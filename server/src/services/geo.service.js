/**
 * Camada geográfica — 100% gratuita, sem chaves de API, sem faturação.
 *
 * SUBSTITUI COMPLETAMENTE A GOOGLE MAPS PLATFORM.
 *
 *   Google Places Text Search  →  Overpass API (dados OpenStreetMap)
 *   Google Geocoding           →  Nominatim (OpenStreetMap)
 *   Google Distance Matrix     →  OSRM /table  (+ fallback haversine)
 *   Google Maps JS (tiles)     →  Leaflet + tiles OSM (no cliente)
 *
 * Nenhum destes serviços exige cartão de crédito nem chave.
 *
 * ⚠️  RESPONSABILIDADE DE USO
 * Nominatim, Overpass e o servidor de demonstração do OSRM são infraestruturas
 * comunitárias mantidas por donativos. As respetivas políticas de uso exigem:
 *   - Nominatim: no máximo 1 pedido por segundo e um User-Agent identificável.
 *   - Overpass:  pedidos moderados, com timeout declarado.
 *   - OSRM demo: sem SLA; não serve para produção com volume.
 *
 * Por isso este módulo impõe, do nosso lado:
 *   - uma fila com intervalo mínimo entre pedidos a cada serviço,
 *   - cache agressiva (a geocodificação de "Hospital de Braga" não muda),
 *   - degradação graciosa: se o roteamento falhar, usa-se distância geodésica.
 *
 * Quando o tráfego crescer, basta apontar as variáveis de ambiente
 * NOMINATIM_BASE / OVERPASS_BASE / OSRM_BASE para instâncias próprias
 * (todas são software livre e auto-hospedável). Zero alterações de código.
 */

const config = require('../config/env');
const { TtlCache } = require('./cache');

/* ─────────────────────────────── caches ──────────────────────────────── */

// Geocodificação é praticamente imutável → 30 dias.
const geocodeCache = new TtlCache({ ttlSeconds: 2_592_000, maxEntries: 5000 });
// POIs mudam lentamente → 24 h.
const poiCache = new TtlCache({ ttlSeconds: 86_400, maxEntries: 1000 });
// Tempos de viagem variam com o trânsito → 30 min.
const matrixCache = new TtlCache({ ttlSeconds: 1800, maxEntries: 1000 });

/* ──────────────────── limitador de ritmo por serviço ─────────────────── */

/**
 * Serializa pedidos a um serviço, garantindo um intervalo mínimo entre eles.
 * Existe para cumprirmos as políticas de uso, não para nossa conveniência.
 */
class RateLimitedQueue {
  constructor(minIntervalMs) {
    this.minIntervalMs = minIntervalMs;
    this.lastRun = 0;
    this.chain = Promise.resolve();
  }

  run(task) {
    const result = this.chain.then(async () => {
      const wait = this.minIntervalMs - (Date.now() - this.lastRun);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.lastRun = Date.now();
      return task();
    });
    // A corrente não deve quebrar quando uma tarefa falha.
    this.chain = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }
}

const nominatimQueue = new RateLimitedQueue(1100); // política: 1 req/s
const overpassQueue = new RateLimitedQueue(1000);
const osrmQueue = new RateLimitedQueue(250);

/* ───────────────────────────── utilitários ───────────────────────────── */

function httpError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function badRequest(message, code = 'BAD_REQUEST') {
  return httpError(message, 400, code);
}

function sanitizeText(value, { max = 120, field = 'texto' } = {}) {
  if (typeof value !== 'string') throw badRequest(`${field} deve ser texto.`);
  const clean = value.replace(/[\u0000-\u001f<>]/g, '').trim();
  if (!clean) throw badRequest(`${field} não pode ser vazio.`);
  if (clean.length > max) throw badRequest(`${field} excede ${max} caracteres.`);
  return clean;
}

function parseCoord(value, field) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) throw badRequest(`${field} inválida.`);
  const limit = field.toLowerCase().includes('lat') ? 90 : 180;
  if (Math.abs(n) > limit) throw badRequest(`${field} fora de alcance.`);
  return n;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 25_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        // Identificação exigida pela política do Nominatim e boa prática nos restantes.
        'User-Agent': config.userAgent,
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      // Mensagens específicas: um 502 genérico não diz a ninguém o que fazer.
      // Estes serviços são comunitários e ficam mesmo sobrecarregados.
      let message;
      let code = 'UPSTREAM_ERROR';
      if (res.status === 429) {
        message =
          'O serviço de mapas está a limitar pedidos neste momento. ' +
          'Tente novamente dentro de um minuto.';
        code = 'UPSTREAM_RATE_LIMITED';
      } else if (res.status === 504 || res.status === 503) {
        message =
          'O serviço de mapas está sobrecarregado. Tente novamente dentro de ' +
          'um minuto.';
        code = 'UPSTREAM_BUSY';
      } else if (res.status === 400) {
        // Quase sempre uma query mal formada do nosso lado.
        const detail = await res.text().catch(() => '');
        console.error('[overpass] query rejeitada:', detail.slice(0, 500));
        message = 'O pedido ao serviço de mapas foi recusado.';
        code = 'UPSTREAM_BAD_QUERY';
      } else {
        message = `O serviço de mapas respondeu ${res.status}.`;
      }
      throw httpError(message, 502, code);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw httpError('Tempo de espera esgotado no serviço geográfico.', 504, 'UPSTREAM_TIMEOUT');
    }
    if (err instanceof TypeError) {
      throw httpError('Não foi possível contactar o serviço de mapas.', 502, 'UPSTREAM_UNREACHABLE');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Distância geodésica em metros. Usada como rede de segurança. */
function haversineMeters(a, b) {
  const R = 6_371_000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  if (seconds == null) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/* ───────────────────── Nominatim: geocodificação ─────────────────────── */

/**
 * Texto → coordenadas + bounding box.
 * @returns {Promise<null | {displayName,lat,lng,boundingBox,osmType,osmId,category,type}>}
 */
/** Uma tentativa única contra o Nominatim. */
async function geocodeOnce(q, countryCodes, language) {
  const url = new URL('/search', config.nominatimBase);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', language);
  if (countryCodes) url.searchParams.set('countrycodes', countryCodes);

  const data = await nominatimQueue.run(() => fetchWithTimeout(url, {}, 15_000));
  return Array.isArray(data) ? data[0] || null : null;
}

/**
 * Variantes progressivamente mais soltas da mesma morada.
 *
 * O Nominatim é exigente com números de porta: "Rua D. Fernando da Guerra 38,
 * Braga" devolve zero resultados se o número 38 não estiver mapeado, mesmo
 * estando a rua lá. Falhar aí seria dizer ao utente que a morada dele não
 * existe. Tentamos então sem o número, e por fim sem restrição de país.
 */
function addressVariants(q) {
  const variants = [q];

  // Sem número de porta (dígitos soltos antes de uma vírgula ou no fim).
  const noNumber = q
    .replace(/\b\d+\s*[-\u2013]?\s*[A-Za-z]?\b(?=\s*(,|$))/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
  if (noNumber && noNumber !== q && noNumber.length > 3) variants.push(noNumber);

  // Só o que vem depois da primeira vírgula costuma ser a localidade.
  const parts = q.split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length > 1) {
    const tail = parts.slice(1).join(', ');
    if (tail.length > 2) variants.push(tail);
  }

  return [...new Set(variants)];
}

async function geocode(query, { countryCodes = 'pt', language = 'pt' } = {}) {
  const q = sanitizeText(query, { field: 'morada', max: 200 });
  const key = `geo:${countryCodes}:${language}:${q.toLowerCase()}`;

  return geocodeCache.wrap(key, async () => {
    let first = null;
    let usedVariant = null;

    for (const variant of addressVariants(q)) {
      first = await geocodeOnce(variant, countryCodes, language);
      if (first) {
        usedVariant = variant;
        break;
      }
    }

    // Última tentativa: sem restringir ao país. Alguém pode estar a escrever
    // uma morada do outro lado da fronteira, ou com grafia pouco comum.
    if (!first && countryCodes) {
      first = await geocodeOnce(q, '', language);
      if (first) usedVariant = q;
    }

    if (!first) return null;

    // boundingbox do Nominatim: [south, north, west, east] (strings)
    const bb = (first.boundingbox || []).map(Number);
    return {
      displayName: first.display_name || null,
      // Quando a morada exata não existe, dizemos com que variante
      // acertámos, para o utente perceber que não é a casa dele ao metro.
      matchedQuery: usedVariant !== q ? usedVariant : undefined,
      approximate: usedVariant !== q || undefined,
      lat: Number(first.lat),
      lng: Number(first.lon),
      boundingBox:
        bb.length === 4 && bb.every(Number.isFinite)
          ? { south: bb[0], north: bb[1], west: bb[2], east: bb[3] }
          : null,
      osmType: first.osm_type || null,
      osmId: first.osm_id || null,
      category: first.category || null,
      type: first.type || null,
      attribution: '© OpenStreetMap contributors',
    };
  });
}

/** Coordenadas → morada. */
async function reverseGeocode(lat, lng, { language = 'pt' } = {}) {
  const la = parseCoord(lat, 'latitude');
  const ln = parseCoord(lng, 'longitude');
  const key = `rev:${language}:${la.toFixed(4)},${ln.toFixed(4)}`;

  return geocodeCache.wrap(key, async () => {
    const url = new URL('/reverse', config.nominatimBase);
    url.searchParams.set('lat', String(la));
    url.searchParams.set('lon', String(ln));
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('accept-language', language);

    const data = await nominatimQueue.run(() => fetchWithTimeout(url, {}, 15_000));
    if (!data || data.error) return null;
    const a = data.address || {};
    return {
      displayName: data.display_name || null,
      city: a.city || a.town || a.village || a.municipality || null,
      county: a.county || null,
      district: a.state_district || a.state || null,
      postcode: a.postcode || null,
      country: a.country || null,
      countryCode: (a.country_code || '').toUpperCase() || null,
      attribution: '© OpenStreetMap contributors',
    };
  });
}

/* ─────────────── Overpass: pesquisa de unidades de saúde ──────────────── */

/**
 * Envia a query a cada instância Overpass por ordem, passando à seguinte
 * quando a atual está sobrecarregada, em timeout ou inacessível.
 * Um 400 (query nossa mal formada) não adianta tentar noutro sítio.
 */
async function overpassRequest(query) {
  const bases = config.overpassBases;
  // Presupuesto TOTAL, não por instância: com três espelhos lentos o utente
  // esperava quase um minuto antes de ver um erro. Esgotado o presupuesto,
  // quem chama passa ao plano B (Nominatim).
  const deadline = Date.now() + config.overpassBudgetMs;
  let lastErr;
  for (const base of bases) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;
    try {
      return await fetchWithTimeout(
        base,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: query }).toString(),
        },
        Math.min((config.overpassTimeout + 5) * 1000, remaining)
      );
    } catch (err) {
      lastErr = err;
      if (err.code === 'UPSTREAM_BAD_QUERY') throw err;
      console.warn(`[overpass] ${base} falhou (${err.code || err.message}); a tentar a seguinte`);
    }
  }
  throw lastErr || httpError('Tempo de espera esgotado no serviço geográfico.', 504, 'UPSTREAM_TIMEOUT');
}

/**
 * Plano B quando o Overpass público não responde (acontece: em novembro de
 * 2026 o overpass-api.de devolvia 406 e os espelhos passavam dos 30 s).
 * O Nominatim aceita pesquisa estruturada por `amenity` dentro de uma
 * viewbox e devolve as etiquetas extra (telefone, site, especialidade),
 * por isso o resultado tem a mesma forma que o do Overpass.
 */
async function nominatimPoiSearch({ bbox, specialityValues, nameFilter, limit }) {
  const amenities = ['hospital', 'clinic', 'doctors'];
  if (!specialityValues || specialityValues.some((v) => /dent|stomat|orthodont/.test(v))) {
    amenities.push('dentist');
  }
  const viewbox = `${bbox.west},${bbox.north},${bbox.east},${bbox.south}`;
  const all = [];
  for (const amenity of amenities) {
    const url = new URL('/search', config.nominatimBase);
    url.searchParams.set('amenity', amenity);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '40');
    url.searchParams.set('extratags', '1');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('viewbox', viewbox);
    url.searchParams.set('bounded', '1');
    try {
      const data = await nominatimQueue.run(() => fetchWithTimeout(url, {}, 12_000));
      if (Array.isArray(data)) all.push(...data);
    } catch (err) {
      console.warn(`[nominatim-poi] ${amenity} falhou (${err.code || err.message})`);
    }
  }

  const elements = all
    .filter((r) => r.category === 'amenity' || r.category === 'healthcare')
    .map((r) => {
      const ad = r.address || {};
      return {
        type: r.osm_type,
        id: r.osm_id,
        lat: Number(r.lat),
        lon: Number(r.lon),
        tags: {
          ...(r.extratags || {}),
          name: r.name || ad[r.type] || undefined,
          [r.category]: r.type,
          'addr:street': ad.road,
          'addr:housenumber': ad.house_number,
          'addr:postcode': ad.postcode,
          'addr:city': ad.city || ad.town || ad.village,
        },
      };
    });

  let places = [];
  const seen = new Set();
  for (const el of elements) {
    const place = mapOverpassElement(el);
    if (!place || !place.name || seen.has(place.id)) continue;
    seen.add(place.id);
    places.push(place);
  }

  let matchedBy = 'all';
  if (specialityValues?.length) {
    const re = new RegExp(specialityValues.map(escapeOverpassRegex).join('|'), 'i');
    const hits = places.filter((p) => p.specialities.some((s) => re.test(s)));
    if (hits.length) {
      places = hits;
      matchedBy = 'healthcare:speciality';
    } else {
      // Nenhuma unidade tem a especialidade registada no OSM. Em vez de
      // "zero resultados", mostram-se hospitais e clínicas da zona, e diz-se.
      places = places.filter((p) => ['hospital', 'clinic'].includes(p.facilityType));
      matchedBy = 'general-fallback';
    }
  } else if (nameFilter) {
    const key = normalizeKey(nameFilter);
    places = places.filter((p) => normalizeKey(p.name).includes(key));
    matchedBy = 'name';
  }

  return { places: places.slice(0, limit), matchedBy };
}



/**
 * Especialidade (pt/en) → valores de `healthcare:speciality` do OSM.
 * Quando não há correspondência, cai-se numa pesquisa por nome.
 * Referência: https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality
 */
const SPECIALITY_MAP = {
  cardiologia: ['cardiology'],
  cardiology: ['cardiology'],
  dermatologia: ['dermatology'],
  dermatology: ['dermatology'],
  oftalmologia: ['ophthalmology'],
  ophthalmology: ['ophthalmology'],
  ortopedia: ['orthopaedics'],
  orthopaedics: ['orthopaedics'],
  pediatria: ['paediatrics'],
  paediatrics: ['paediatrics'],
  ginecologia: ['gynaecology'],
  gynaecology: ['gynaecology'],
  obstetricia: ['obstetrics'],
  neurologia: ['neurology'],
  neurology: ['neurology'],
  psiquiatria: ['psychiatry'],
  psychiatry: ['psychiatry'],
  psicologia: ['psychotherapist'],
  otorrinolaringologia: ['otolaryngology'],
  urologia: ['urology'],
  urology: ['urology'],
  gastroenterologia: ['gastroenterology'],
  endocrinologia: ['endocrinology'],
  oncologia: ['oncology'],
  oncology: ['oncology'],
  reumatologia: ['rheumatology'],
  pneumologia: ['pulmonology'],
  nefrologia: ['nephrology'],
  fisioterapia: ['physiotherapist'],
  physiotherapy: ['physiotherapist'],
  dentista: ['dentist'],
  estomatologia: ['dentist'],
  dentistry: ['dentist'],
  'medicina geral e familiar': ['general'],
  'medicina geral': ['general'],
  'clinica geral': ['general'],
  'general practice': ['general'],
  vacinacao: ['vaccination'],
  radiologia: ['radiology'],
  alergologia: ['allergology'],
  imunoalergologia: ['allergology'],
  'cirurgia geral': ['surgery'],
  nutricao: ['nutrition'],
  podologia: ['podiatrist'],
};

/** Remove acentos e normaliza para procurar no mapa de especialidades. */
function normalizeKey(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeOverpassRegex(text) {
  return String(text).replace(/["\\]/g, '\\$&');
}

/**
 * Constrói a query Overpass QL para unidades de saúde numa bounding box.
 *
 * ⚠️  CUIDADO COM A INSTRUÇÃO `out`. A ordem é
 *        out [verbosidade] [geometria] [ordenação] [limite];
 *     e a verbosidade `tags` NÃO devolve geometria nenhuma — nem sequer as
 *     coordenadas dos nós. Uma versão anterior usava `out center tags 40;`,
 *     que estava errada das duas maneiras: geometria antes da verbosidade, e
 *     `tags` a remover as coordenadas de que precisamos. O Overpass rejeitava
 *     a query e a pesquisa devolvia 502.
 *     `out center 40;` é o correto: a verbosidade `body` (a omissão) traz
 *     coordenadas e etiquetas, e `center` acrescenta o centroide a ways e
 *     relations.
 *
 * Usa-se `nwr` (node+way+relation) em vez de três seletores repetidos: é a
 * mesma coisa, numa query muito mais curta e mais leve para o servidor.
 */
function buildOverpassQuery({ bbox, specialityValues, nameFilter, limit }) {
  const box = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const baseAmenities = 'clinic|doctors|hospital|dentist';

  let selectors;
  if (specialityValues?.length) {
    // Filtra por especialidade declarada no OSM.
    const re = specialityValues.map(escapeOverpassRegex).join('|');
    selectors =
      `  nwr["healthcare:speciality"~"${re}"](${box});\n` +
      `  nwr["amenity"~"^(${baseAmenities})$"]["healthcare:speciality"~"${re}"](${box});`;
  } else if (nameFilter) {
    // Sem mapeamento conhecido: procura pelo texto no nome da unidade.
    const re = escapeOverpassRegex(nameFilter);
    selectors =
      `  nwr["amenity"~"^(${baseAmenities})$"]["name"~"${re}",i](${box});\n` +
      `  nwr["healthcare"]["name"~"${re}",i](${box});`;
  } else {
    selectors =
      `  nwr["amenity"~"^(${baseAmenities})$"](${box});\n` +
      `  nwr["healthcare"](${box});`;
  }

  return (
    `[out:json][timeout:${config.overpassTimeout}];\n` +
    `(\n${selectors}\n);\n` +
    `out center ${limit};`
  );
}

/** Normaliza um elemento Overpass para a forma usada pelo cliente. */
function mapOverpassElement(el) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lng = el.lon ?? el.center?.lon ?? null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const addressParts = [
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:postcode'],
    tags['addr:city'],
  ].filter(Boolean);

  return {
    id: `${el.type}/${el.id}`,
    osmType: el.type,
    osmId: el.id,
    name: tags.name || tags['name:pt'] || null,
    lat,
    lng,
    address: addressParts.length ? addressParts.join(', ') : null,
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    email: tags.email || tags['contact:email'] || null,
    openingHours: tags.opening_hours || null,
    facilityType: tags.amenity || tags.healthcare || null,
    specialities: tags['healthcare:speciality']
      ? tags['healthcare:speciality'].split(';').map((s) => s.trim())
      : [],
    emergency: tags.emergency || null,
    wheelchair: tags.wheelchair || null,
    operator: tags.operator || null,
    // A rede pública portuguesa aparece frequentemente identificada no operador.
    isPublic: /sns|servi[çc]o nacional de sa[úu]de|minist[ée]rio|ula?s |centro de sa[úu]de/i.test(
      `${tags.operator || ''} ${tags.name || ''}`
    ),
    source: 'OpenStreetMap',
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

/**
 * Pesquisa unidades de saúde.
 *
 * @param {object} params
 * @param {string} [params.speciality]
 * @param {string} [params.city]
 * @param {string} [params.country='Portugal']
 * @param {object} [params.bbox] alternativa a city: {south,west,north,east}
 * @param {number} [params.limit=40]
 * @param {string} [params.language='pt']
 */
async function searchHealthcare({
  speciality,
  city,
  country = 'Portugal',
  bbox,
  limit = 40,
  language = 'pt',
}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 40, 1), 100);

  let area = bbox;
  let areaLabel = null;

  if (!area) {
    if (!city) throw badRequest('Indique uma cidade ou uma bounding box.', 'NO_AREA');
    const cityClean = sanitizeText(city, { field: 'cidade', max: 80 });
    const countryClean = sanitizeText(country, { field: 'país', max: 80 });
    const located = await geocode(`${cityClean}, ${countryClean}`, {
      countryCodes: '',
      language,
    });
    if (!located?.boundingBox) {
      throw httpError(
        `Não foi possível localizar "${cityClean}, ${countryClean}".`,
        404,
        'AREA_NOT_FOUND'
      );
    }
    area = located.boundingBox;
    areaLabel = located.displayName;
  }

  for (const k of ['south', 'west', 'north', 'east']) {
    if (!Number.isFinite(Number(area[k]))) {
      throw badRequest(`bounding box inválida: falta "${k}".`, 'BAD_BBOX');
    }
  }

  const specKey = speciality ? normalizeKey(speciality) : null;
  const specialityValues = specKey ? SPECIALITY_MAP[specKey] : null;
  const nameFilter = specKey && !specialityValues ? speciality : null;

  const cacheKey = `poi:${JSON.stringify({ area, specKey, safeLimit })}`;

  return poiCache.wrap(cacheKey, async () => {
    const query = buildOverpassQuery({
      bbox: area,
      specialityValues,
      nameFilter,
      limit: safeLimit,
    });

    let places = [];
    let matchedBy = specialityValues ? 'healthcare:speciality' : nameFilter ? 'name' : 'all';
    let provider = 'overpass';
    try {
      const data = await overpassQueue.run(() => overpassRequest(query));
      const seen = new Set();
      for (const el of data.elements || []) {
        const place = mapOverpassElement(el);
        if (!place || !place.name) continue; // sem nome não é útil ao utente
        if (seen.has(place.id)) continue;
        seen.add(place.id);
        places.push(place);
      }
    } catch (err) {
      if (err.code === 'UPSTREAM_BAD_QUERY') throw err;
      console.warn(`[healthcare] Overpass indisponível (${err.code || err.message}); a usar Nominatim`);
      const fb = await nominatimPoiSearch({
        bbox: area,
        specialityValues,
        nameFilter,
        limit: safeLimit,
      });
      places = fb.places;
      matchedBy = fb.matchedBy;
      provider = 'nominatim';
    }

    return {
      area: { ...area, label: areaLabel },
      speciality: speciality || null,
      matchedBy,
      provider,
      count: places.length,
      places,
      attribution:
        'Dados © OpenStreetMap contributors, disponibilizados sob ODbL. ' +
        (provider === 'overpass' ? 'Pesquisa via Overpass API.' : 'Pesquisa via Nominatim.'),
      dataQualityNote:
        matchedBy === 'general-fallback'
          ? 'Nenhuma unidade desta zona tem esta especialidade registada no OpenStreetMap. ' +
            'Mostramos hospitais e clínicas próximos: confirme a especialidade por telefone.'
          :
        'A cobertura do OpenStreetMap para unidades de saúde varia por região. ' +
        'A ausência de uma unidade não significa que ela não exista.',
    };
  });
}

/**
 * UMA só consulta Overpass para várias localizações.
 *
 * O seletor de Vale Cirurgia precisava de contactos (telefone, site) de N
 * hospitais e fazia N consultas Overpass em série. Contra um servidor público
 * que demora segundos por consulta, isso eram ~1 minuto. Aqui junta-se tudo
 * numa união de seletores `around`: 1 pedido, qualquer que seja N.
 */
function buildAroundQuery(points, radius) {
  const sel = points
    .map(
      (p) =>
        `  nwr["amenity"~"^(hospital|clinic)$"](around:${radius},${p.lat},${p.lng});\n` +
        `  nwr["healthcare"~"^(hospital|clinic|centre)$"](around:${radius},${p.lat},${p.lng});`
    )
    .join('\n');
  const limit = Math.min(500, Math.max(40, points.length * 40));
  return `[out:json][timeout:${config.overpassTimeout}];\n(\n${sel}\n);\nout center ${limit};`;
}

async function searchHealthcareAround({ points, radius = 2000 }) {
  if (!Array.isArray(points) || points.length === 0) return [];
  if (points.length > 20) throw badRequest('Máximo de 20 localizações.', 'TOO_MANY_POINTS');
  const pts = points.map((p, i) => ({
    lat: parseCoord(p?.lat, `latitude ${i + 1}`),
    lng: parseCoord(p?.lng, `longitude ${i + 1}`),
  }));
  const r = Math.min(5000, Math.max(200, Number(radius) || 2000));
  const key = `around:${r}:${pts.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|')}`;

  return poiCache.wrap(key, async () => {
    const data = await overpassQueue.run(() => overpassRequest(buildAroundQuery(pts, r)));
    const seen = new Set();
    const places = [];
    for (const el of data.elements || []) {
      const place = mapOverpassElement(el);
      if (!place || !place.name || seen.has(place.id)) continue;
      seen.add(place.id);
      places.push(place);
    }
    return places;
  });
}

/* ──────────────── OSRM: matriz de tempos e distâncias ───────────────── */

const OSRM_PROFILES = { driving: 'driving', walking: 'foot', cycling: 'bike' };

/**
 * Tempos/distâncias de UMA origem para VÁRIOS destinos, numa única chamada.
 *
 * Substitui o padrão antigo de 2 chamadas DirectionsService por cartão.
 * Com 20 clínicas: 40 chamadas → 1.
 *
 * Se o OSRM falhar (o servidor de demonstração não tem SLA), devolve-se
 * distância geodésica em vez de nada — marcada como `estimated: true`.
 */
async function travelMatrix({ origin, destinations, mode = 'driving' }) {
  const o = {
    lat: parseCoord(origin?.lat, 'latitude de origem'),
    lng: parseCoord(origin?.lng, 'longitude de origem'),
  };

  if (!Array.isArray(destinations) || destinations.length === 0) {
    throw badRequest('É necessário pelo menos um destino.', 'NO_DESTINATIONS');
  }
  if (destinations.length > 50) {
    throw badRequest('Máximo de 50 destinos por pedido.', 'TOO_MANY_DESTINATIONS');
  }

  const profile = OSRM_PROFILES[mode];
  if (!profile) throw badRequest('Modo de viagem inválido.', 'BAD_MODE');

  const points = destinations.map((d, i) => ({
    lat: parseCoord(d?.lat, `latitude do destino ${i + 1}`),
    lng: parseCoord(d?.lng, `longitude do destino ${i + 1}`),
  }));

  const geodesic = () =>
    points.map((p, i) => {
      const meters = haversineMeters(o, p);
      return {
        index: i,
        lat: p.lat,
        lng: p.lng,
        mode,
        estimated: true,
        distanceMeters: meters,
        distanceText: formatDistance(meters),
        durationSeconds: null,
        durationText: null,
        note: 'Distância em linha reta: o serviço de roteamento não respondeu.',
      };
    });

  // OSRM espera lon,lat — e a origem é o índice 0.
  const coords = [o, ...points].map((p) => `${p.lng},${p.lat}`).join(';');
  const cacheKey = `matrix:${profile}:${coords}`;

  const cached = matrixCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL(
      `/table/v1/${profile}/${coords}`,
      config.osrmBase
    );
    url.searchParams.set('sources', '0');
    url.searchParams.set('annotations', 'duration,distance');

    const data = await osrmQueue.run(() => fetchWithTimeout(url, {}, 20_000));

    if (data.code !== 'Ok') {
      // Alguns perfis OSRM (MLD) não implementam a tabela de distâncias.
      // Repetimos apenas com durações antes de desistir.
      if (/NotImplemented/i.test(data.code || '')) {
        url.searchParams.set('annotations', 'duration');
        const retry = await osrmQueue.run(() => fetchWithTimeout(url, {}, 20_000));
        if (retry.code === 'Ok') return finalize(retry, null);
      }
      return geodesic();
    }

    return finalize(data, data.distances?.[0] || null);
  } catch {
    // Falha do serviço de roteamento não deve derrubar a resposta ao utente.
    return geodesic();
  }

  function finalize(data, distanceRow) {
    const durationRow = data.durations?.[0] || [];
    const result = points.map((p, i) => {
      // índice 0 é a própria origem; os destinos começam em 1
      const durationSeconds = durationRow[i + 1] ?? null;
      let distanceMeters = distanceRow ? (distanceRow[i + 1] ?? null) : null;
      let estimated = false;
      if (distanceMeters == null) {
        distanceMeters = haversineMeters(o, p);
        estimated = true;
      }
      return {
        index: i,
        lat: p.lat,
        lng: p.lng,
        mode,
        estimated,
        distanceMeters: distanceMeters != null ? Math.round(distanceMeters) : null,
        distanceText: formatDistance(
          distanceMeters != null ? Math.round(distanceMeters) : null
        ),
        durationSeconds:
          durationSeconds != null ? Math.round(durationSeconds) : null,
        durationText: formatDuration(durationSeconds),
      };
    });
    matrixCache.set(cacheKey, result);
    return result;
  }
}

function cacheStats() {
  return {
    geocode: geocodeCache.stats(),
    poi: poiCache.stats(),
    matrix: matrixCache.stats(),
  };
}

/** Especialidades reconhecidas, para alimentar a autocompletar do cliente. */
function listSpecialities() {
  return Object.keys(SPECIALITY_MAP).sort();
}

module.exports = {
  geocode,
  reverseGeocode,
  searchHealthcare,
  searchHealthcareAround,
  travelMatrix,
  listSpecialities,
  cacheStats,
  _internals: {
    haversineMeters,
    normalizeKey,
    buildOverpassQuery,
    mapOverpassElement,
    formatDistance,
    formatDuration,
    SPECIALITY_MAP,
    RateLimitedQueue,
    addressVariants,
    overpassRequest,
    nominatimPoiSearch,
    buildAroundQuery,
  },
};
