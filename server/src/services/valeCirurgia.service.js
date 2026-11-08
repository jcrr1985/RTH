/**
 * Seletor de hospital para Vale Cirurgia / Nota de Transferência.
 *
 * O PROBLEMA QUE RESOLVE
 * O vale cirurgia chega ao utente como um documento com uma LISTA DE NOMES de
 * hospitais e um formulário de "Justificação de Recusa". O utente não tem como
 * saber qual lhe fica a 40 minutos e qual a 3 horas, se chega lá sem carro,
 * nem quantas vezes terá de repetir a viagem.
 *
 * Resultado: num período de oito meses foram emitidos mais de 134 400 vales
 * cirurgia e 55,37% foram recusados pelos utentes. Noutro semestre, de 51 940
 * vales emitidos só 26,9% chegaram a ser utilizados.
 *
 * Esta é exatamente a decisão que o RTH já sabia apoiar — geolocalização,
 * distância e tempo de viagem. Só faltava apontá-la a este momento.
 *
 * O QUE *NÃO* FAZEMOS
 * Não classificamos qualidade clínica. Não temos dados para isso, e fabricar um
 * "score de qualidade" a partir de estrelas de utilizadores seria enganador num
 * contexto cirúrgico. Modelamos a CARGA LOGÍSTICA do percurso, que é real,
 * mensurável, e é a principal razão de recusa.
 */

const geo = require('./geo.service');
const { createTranslator } = require('../i18n');

/**
 * Pesos da pontuação logística. Explícitos e devolvidos na resposta, para que
 * o utente possa discordar deles em vez de receber uma caixa negra.
 */
const WEIGHTS = {
  drivingTime: 0.55,
  walkAccess: 0.3,
  dataCompleteness: 0.15,
};

/** Uma cirurgia programada não é uma ida só. */
/** Tempo máximo à espera dos contactos do OSM (extra, não essencial). */
const ENRICH_BUDGET_MS = 12_000;

const ASSUMED_TRIPS = 4; // pré-operatória + cirurgia + alta + seguimento

function isLocatable(h) {
  return Number.isFinite(h.lat) && Number.isFinite(h.lng);
}

function scoreOption(option, { maxDriving, maxWalking }) {
  // Tempo de condução: menos é melhor. Sem dados → neutro.
  const drive =
    option.driving?.durationSeconds != null && maxDriving > 0
      ? 1 - option.driving.durationSeconds / maxDriving
      : 0.5;

  // Acessibilidade sem carro. Quem não conduz depende disto, e o acompanhante
  // no dia da alta também.
  let walk = 0.5;
  if (option.walking?.durationSeconds != null && maxWalking > 0) {
    walk = 1 - option.walking.durationSeconds / maxWalking;
  } else if (option.walking && option.walking.durationSeconds == null) {
    walk = 0.15; // sem rota pedestre encontrada
  }

  // Quão completo está o registo: ter telefone e site poupa ao utente meia
  // hora ao telefone a tentar descobrir com quem falar.
  const fields = [option.phone, option.website, option.address].filter(Boolean);
  const completeness = fields.length / 3;

  const raw =
    drive * WEIGHTS.drivingTime +
    walk * WEIGHTS.walkAccess +
    completeness * WEIGHTS.dataCompleteness;

  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
}

/**
 * Contactos dos hospitais a partir do OSM, numa única consulta.
 * É um extra: nunca pode atrasar nem impedir o ranking, por isso tem um
 * limite de tempo e falha em silêncio para "sem contactos".
 */
async function enrichAll(locatable) {
  const none = () => locatable.map(() => null);
  let timer;
  try {
    const places = await Promise.race([
      geo.searchHealthcareAround({ points: locatable, radius: 2000 }),
      new Promise((_, rej) => {
        timer = setTimeout(() => rej(new Error('enrich timeout')), ENRICH_BUDGET_MS);
      }),
    ]);
    const { normalizeKey, haversineMeters } = geo._internals;
    return locatable.map((h) => {
      const target = normalizeKey(h.inputName);
      const near = places
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => ({ p, d: haversineMeters(h, p) }))
        .filter((x) => x.d <= 2500)
        .sort((x, y) => x.d - y.d)
        .map((x) => x.p);
      return (
        near.find((p) => {
          const name = normalizeKey(p.name);
          return name.includes(target) || target.includes(name);
        }) ||
        near.find((p) => p.facilityType === 'hospital') ||
        null
      );
    });
  } catch (err) {
    console.warn('[vale] contactos indisponíveis:', err.message);
    return none();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {object} params
 * @param {string[]} params.hospitalNames nomes tal como constam do vale
 * @param {{lat:number,lng:number}} params.origin posição do utente
 * @param {string} [params.language='pt']
 */
async function rankValeOptions({ hospitalNames, origin, language = 'pt' }) {
  const t = createTranslator(language);
  const t0 = Date.now();

  if (!Array.isArray(hospitalNames) || hospitalNames.length === 0) {
    const err = new Error(t('errors.noHospitals'));
    err.statusCode = 400;
    err.code = 'NO_HOSPITALS';
    throw err;
  }
  if (hospitalNames.length > 20) {
    const err = new Error(t('errors.tooManyHospitals'));
    err.statusCode = 400;
    err.code = 'TOO_MANY_HOSPITALS';
    throw err;
  }

  /* 1. Resolver cada nome numa localização.
   *    geo.geocode serializa os pedidos a 1/s para cumprir a política do
   *    Nominatim, por isso esta fase é sequencial por desenho. */
  const resolved = [];
  for (const rawName of hospitalNames) {
    const name = String(rawName || '').trim();
    if (!name) continue;
    try {
      const hit = await geo.geocode(`${name}, Portugal`, { language });
      if (!hit || !Number.isFinite(hit.lat)) {
        resolved.push({ inputName: name, resolved: false, reason: 'não encontrado' });
        continue;
      }
      resolved.push({
        inputName: name,
        resolved: true,
        formattedAddress: hit.displayName,
        lat: hit.lat,
        lng: hit.lng,
        osmType: hit.osmType,
        osmId: hit.osmId,
      });
    } catch (err) {
      resolved.push({ inputName: name, resolved: false, reason: err.message });
    }
  }

  const tGeocoded = Date.now();
  const locatable = resolved.filter((c) => c.resolved && isLocatable(c));
  const unresolved = resolved.filter((c) => !c.resolved || !isLocatable(c));

  if (locatable.length === 0) {
    return {
      origin,
      weights: WEIGHTS,
      assumedTrips: ASSUMED_TRIPS,
      options: [],
      unresolved,
      note: t('errors.noneLocated'),
    };
  }

  /* 2. Matriz de viagem: uma chamada por modo, não uma por hospital. */
  const destinations = locatable.map((h) => ({ lat: h.lat, lng: h.lng }));

  const [driving, walking, enriched] = await Promise.all([
    geo.travelMatrix({ origin, destinations, mode: 'driving' }),
    geo.travelMatrix({ origin, destinations, mode: 'walking' }).catch(() => null),
    enrichAll(locatable),
  ]);

  const tTravel = Date.now();
  console.log(
    `[vale] ${locatable.length}/${resolved.length} localizados · geocodificação ${tGeocoded - t0} ms · ` +
      `rotas+contactos ${tTravel - tGeocoded} ms · total ${tTravel - t0} ms`
  );

  const options = locatable.map((h, i) => {
    const osm = enriched[i];
    const drive = driving[i] || null;
    return {
      inputName: h.inputName,
      name: osm?.name || h.inputName,
      address: osm?.address || h.formattedAddress,
      lat: h.lat,
      lng: h.lng,
      phone: osm?.phone || null,
      website: osm?.website || null,
      facilityType: osm?.facilityType || null,
      isPublic: osm?.isPublic ?? null,
      wheelchair: osm?.wheelchair || null,
      osmUrl: osm?.osmUrl || null,
      driving: drive,
      walking: walking ? walking[i] || null : null,
      // O número que realmente conta para a decisão.
      totalTravelBurden:
        drive?.durationSeconds != null
          ? {
              trips: ASSUMED_TRIPS,
              totalSeconds: drive.durationSeconds * 2 * ASSUMED_TRIPS,
              totalText: geo._internals.formatDuration(
                drive.durationSeconds * 2 * ASSUMED_TRIPS
              ),
              explanation: t('valeTripsExplanation', { trips: ASSUMED_TRIPS }),
            }
          : null,
    };
  });

  const drivingTimes = options
    .map((o) => o.driving?.durationSeconds)
    .filter(Number.isFinite);
  const walkingTimes = options
    .map((o) => o.walking?.durationSeconds)
    .filter(Number.isFinite);

  const maxDriving = drivingTimes.length ? Math.max(...drivingTimes) : 0;
  const maxWalking = walkingTimes.length ? Math.max(...walkingTimes) : 0;

  for (const o of options) o.score = scoreOption(o, { maxDriving, maxWalking });

  options.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      (a.driving?.durationSeconds ?? Infinity) -
      (b.driving?.durationSeconds ?? Infinity)
    );
  });
  options.forEach((o, i) => {
    o.rank = i + 1;
  });

  const nearest = [...options].sort(
    (a, b) =>
      (a.driving?.durationSeconds ?? Infinity) -
      (b.driving?.durationSeconds ?? Infinity)
  )[0];

  return {
    language: t.language,
    origin,
    weights: WEIGHTS,
    assumedTrips: ASSUMED_TRIPS,
    options,
    unresolved,
    summary: {
      total: options.length,
      bestLogistics: options[0]
        ? { name: options[0].name, score: options[0].score }
        : null,
      nearest: nearest
        ? {
            name: nearest.name,
            durationText: nearest.driving?.durationText || null,
            distanceText: nearest.driving?.distanceText || null,
          }
        : null,
    },
    timingsMs: { geocoding: tGeocoded - t0, travelAndContacts: tTravel - tGeocoded, total: tTravel - t0 },
    guidance: t('valeGuidance'),
    attribution: 'Dados de localização © OpenStreetMap contributors (ODbL).',
    disclaimer: t('valeDisclaimer'),
  };
}

module.exports = { rankValeOptions, WEIGHTS, ASSUMED_TRIPS };
