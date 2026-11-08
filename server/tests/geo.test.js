const assert = require('node:assert/strict');
const { test } = require('node:test');

const geo = require('../src/services/geo.service');
const {
  haversineMeters,
  normalizeKey,
  buildOverpassQuery,
  mapOverpassElement,
  formatDistance,
  formatDuration,
  SPECIALITY_MAP,
  RateLimitedQueue,
  addressVariants,
} = geo._internals;

/* ─────────────────────────── distância ─────────────────────────── */

test('haversine: Braga → Porto ronda os 45 km', () => {
  const braga = { lat: 41.5454, lng: -8.4265 };
  const porto = { lat: 41.1579, lng: -8.6291 };
  const m = haversineMeters(braga, porto);
  assert.ok(m > 40_000 && m < 50_000, `esperado ~45 km, obtido ${m} m`);
});

test('haversine: distância de um ponto a si mesmo é zero', () => {
  const p = { lat: 41.5454, lng: -8.4265 };
  assert.equal(haversineMeters(p, p), 0);
});

/* ───────────────────────── normalização ────────────────────────── */

test('normalizeKey remove acentos e maiúsculas', () => {
  assert.equal(normalizeKey('Oftalmologia'), 'oftalmologia');
  assert.equal(normalizeKey('  CARDIOLOGIA  '), 'cardiologia');
  assert.equal(normalizeKey('Nutrição'), 'nutricao');
  assert.equal(normalizeKey('Medicina Geral e Familiar'), 'medicina geral e familiar');
});

test('especialidades em português resolvem para tags OSM', () => {
  assert.deepEqual(SPECIALITY_MAP[normalizeKey('Oftalmologia')], ['ophthalmology']);
  assert.deepEqual(SPECIALITY_MAP[normalizeKey('Ortopedia')], ['orthopaedics']);
  assert.deepEqual(SPECIALITY_MAP[normalizeKey('Nutrição')], ['nutrition']);
});

/* ──────────────────────── formatação ───────────────────────────── */

test('formatDistance passa de metros a quilómetros', () => {
  assert.equal(formatDistance(450), '450 m');
  assert.equal(formatDistance(1500), '1.5 km');
  assert.equal(formatDistance(45_200), '45.2 km');
  assert.equal(formatDistance(null), null);
});

test('formatDuration apresenta horas e minutos', () => {
  assert.equal(formatDuration(600), '10 min');
  assert.equal(formatDuration(3600), '1 h');
  assert.equal(formatDuration(5400), '1 h 30 min');
  assert.equal(formatDuration(null), null);
});

/* ───────────────────── query Overpass ──────────────────────────── */

const BBOX = { south: 41.4, west: -8.5, north: 41.6, east: -8.3 };

test('query Overpass inclui timeout, bbox e saída com centro', () => {
  const q = buildOverpassQuery({ bbox: BBOX, limit: 40 });
  assert.match(q, /\[out:json\]\[timeout:\d+\]/);
  assert.match(q, /41\.4,-8\.5,41\.6,-8\.3/);
  assert.match(q, /out center 40;/);
});

/* ─────────────── regressão: a instrução `out` estava errada ───────────────
 * Uma versão anterior gerava `out center tags 40;`, errada duas vezes:
 *   1. a ordem é  out [verbosidade] [geometria] [ordenação] [limite]
 *   2. a verbosidade `tags` NÃO devolve geometria — nem as coordenadas dos
 *      nós — por isso todos os resultados eram descartados a seguir.
 * O Overpass recusava a query e a pesquisa devolvia 502 ao utente.
 */

test('a instrução out NUNCA usa a verbosidade `tags`, que remove coordenadas', () => {
  const queries = [
    buildOverpassQuery({ bbox: BBOX, limit: 40 }),
    buildOverpassQuery({ bbox: BBOX, specialityValues: ['cardiology'], limit: 10 }),
    buildOverpassQuery({ bbox: BBOX, nameFilter: 'Trofa', limit: 10 }),
  ];
  for (const q of queries) {
    const out = q.match(/out [^;]*;/)[0];
    assert.ok(!/\btags\b/.test(out), `verbosidade "tags" remove as coordenadas: ${out}`);
    assert.match(out, /^out center \d+;$/, `instrução out mal formada: ${out}`);
  }
});

test('a query usa nwr em vez de três seletores repetidos', () => {
  const q = buildOverpassQuery({ bbox: BBOX, limit: 40 });
  assert.match(q, /nwr\[/);
  assert.ok(!/^\s*(node|way|relation)\[/m.test(q), 'seletores separados por tipo');
});

test('a query termina com um único bloco de saída', () => {
  const q = buildOverpassQuery({ bbox: BBOX, limit: 40 });
  assert.equal((q.match(/out /g) || []).length, 1, 'mais do que uma instrução out');
  assert.match(q.trim(), /;$/);
});

test('query Overpass filtra por healthcare:speciality quando há mapeamento', () => {
  const q = buildOverpassQuery({
    bbox: BBOX,
    specialityValues: ['cardiology'],
    limit: 10,
  });
  assert.match(q, /healthcare:speciality"~"cardiology"/);
});

test('query Overpass cai para pesquisa por nome sem mapeamento', () => {
  const q = buildOverpassQuery({ bbox: BBOX, nameFilter: 'Trofa Saude', limit: 10 });
  assert.match(q, /"name"~"Trofa Saude",i/);
});

test('query Overpass neutraliza aspas na entrada', () => {
  const q = buildOverpassQuery({
    bbox: BBOX,
    nameFilter: 'teste"](node);out;//',
    limit: 5,
  });
  // As aspas têm de estar escapadas para não quebrar a query.
  assert.ok(!/[^\\]"\]\(node\)/.test(q), 'injeção de Overpass QL não neutralizada');
  assert.match(q, /teste\\"/);
});

/* ───────────────── mapeamento de elementos OSM ─────────────────── */

test('mapOverpassElement normaliza um nó com etiquetas completas', () => {
  const place = mapOverpassElement({
    type: 'node',
    id: 123,
    lat: 41.5,
    lon: -8.4,
    tags: {
      name: 'Clínica Exemplo',
      amenity: 'clinic',
      'healthcare:speciality': 'cardiology;internal',
      phone: '+351 253 000 000',
      website: 'https://exemplo.pt',
      'addr:street': 'Rua Teste',
      'addr:city': 'Braga',
      wheelchair: 'yes',
    },
  });

  assert.equal(place.id, 'node/123');
  assert.equal(place.name, 'Clínica Exemplo');
  assert.deepEqual(place.specialities, ['cardiology', 'internal']);
  assert.equal(place.address, 'Rua Teste, Braga');
  assert.equal(place.wheelchair, 'yes');
  assert.equal(place.osmUrl, 'https://www.openstreetmap.org/node/123');
});

test('mapOverpassElement usa o centro de ways e relations', () => {
  const place = mapOverpassElement({
    type: 'way',
    id: 9,
    center: { lat: 41.1, lon: -8.6 },
    tags: { name: 'Hospital X', amenity: 'hospital' },
  });
  assert.equal(place.lat, 41.1);
  assert.equal(place.lng, -8.6);
});

test('mapOverpassElement descarta elementos sem coordenadas', () => {
  assert.equal(
    mapOverpassElement({ type: 'way', id: 1, tags: { name: 'Sem geometria' } }),
    null
  );
});

test('mapOverpassElement deteta unidades da rede pública', () => {
  const sns = mapOverpassElement({
    type: 'node',
    id: 1,
    lat: 41,
    lon: -8,
    tags: { name: 'Centro de Saúde de Nogueira', amenity: 'clinic' },
  });
  assert.equal(sns.isPublic, true);

  const privada = mapOverpassElement({
    type: 'node',
    id: 2,
    lat: 41,
    lon: -8,
    tags: { name: 'Clínica Dentária Sorriso', amenity: 'dentist' },
  });
  assert.equal(privada.isPublic, false);
});

/* ─────────────────── limitador de ritmo ────────────────────────── */

test('RateLimitedQueue respeita o intervalo mínimo entre tarefas', async () => {
  const q = new RateLimitedQueue(60);
  const stamps = [];
  await Promise.all([
    q.run(async () => stamps.push(Date.now())),
    q.run(async () => stamps.push(Date.now())),
    q.run(async () => stamps.push(Date.now())),
  ]);
  assert.equal(stamps.length, 3);
  assert.ok(stamps[1] - stamps[0] >= 50, 'segunda tarefa demasiado cedo');
  assert.ok(stamps[2] - stamps[1] >= 50, 'terceira tarefa demasiado cedo');
});

test('RateLimitedQueue não quebra a corrente quando uma tarefa falha', async () => {
  const q = new RateLimitedQueue(10);
  await assert.rejects(q.run(async () => { throw new Error('falha'); }));
  assert.equal(await q.run(async () => 'ok'), 'ok');
});

/* ───────────────────── validação de entrada ────────────────────── */

test('travelMatrix rejeita coordenadas inválidas', async () => {
  await assert.rejects(
    geo.travelMatrix({ origin: { lat: 'x', lng: -8 }, destinations: [{ lat: 41, lng: -8 }] }),
    (e) => e.statusCode === 400
  );
});

test('travelMatrix rejeita lista de destinos vazia', async () => {
  await assert.rejects(
    geo.travelMatrix({ origin: { lat: 41, lng: -8 }, destinations: [] }),
    (e) => e.code === 'NO_DESTINATIONS'
  );
});

test('travelMatrix rejeita modo de viagem desconhecido', async () => {
  await assert.rejects(
    geo.travelMatrix({
      origin: { lat: 41, lng: -8 },
      destinations: [{ lat: 41.1, lng: -8.1 }],
      mode: 'teleporte',
    }),
    (e) => e.code === 'BAD_MODE'
  );
});

test('travelMatrix impõe um limite de destinos', async () => {
  const many = Array.from({ length: 51 }, (_, i) => ({ lat: 41 + i / 1000, lng: -8 }));
  await assert.rejects(
    geo.travelMatrix({ origin: { lat: 41, lng: -8 }, destinations: many }),
    (e) => e.code === 'TOO_MANY_DESTINATIONS'
  );
});

test('searchHealthcare exige área', async () => {
  await assert.rejects(
    geo.searchHealthcare({ speciality: 'cardiologia' }),
    (e) => e.code === 'NO_AREA'
  );
});

/* ─────────── variantes de morada (reintentos do geocode) ───────────
 * O Nominatim devolve zero resultados quando o número de porta não está
 * mapeado, mesmo com a rua lá. Dizer ao utente que a morada dele não existe
 * seria errado, por isso tentamos variantes mais soltas.
 */

test('addressVariants retira o número de porta e depois alarga à localidade', () => {
  const v = addressVariants('Rua Dom Fernando Da Guerra 38, braga');
  assert.equal(v[0], 'Rua Dom Fernando Da Guerra 38, braga', 'a 1.ª tentativa é a morada tal como foi escrita');
  assert.ok(v.includes('Rua Dom Fernando Da Guerra, braga'), 'falta a variante sem número');
  assert.ok(v.includes('braga'), 'falta a variante só com a localidade');
});

test('addressVariants não inventa variantes quando não há número nem vírgula', () => {
  assert.deepEqual(addressVariants('Hospital de Braga'), ['Hospital de Braga']);
  assert.deepEqual(addressVariants('Braga'), ['Braga']);
});

test('addressVariants não devolve duplicados', () => {
  for (const addr of ['Braga', 'Rua X 1, Porto', 'Hospital de Santa Maria, Lisboa']) {
    const v = addressVariants(addr);
    assert.equal(new Set(v).size, v.length, `duplicados em ${addr}`);
  }
});

test('listSpecialities devolve uma lista ordenada e não vazia', () => {
  const list = geo.listSpecialities();
  assert.ok(list.length > 20);
  assert.deepEqual(list, [...list].sort());
});

/* ───────── Overpass: cascata de instâncias ───────── */

test('overpassRequest passa à instância seguinte quando a primeira dá timeout/504', async () => {
  const config = require('../src/config/env');
  const original = { fetch: global.fetch, bases: config.overpassBases };
  const calls = [];
  config.overpassBases = ['https://a.test/api', 'https://b.test/api', 'https://c.test/api'];
  global.fetch = async (url) => {
    calls.push(url);
    if (url.startsWith('https://a.test')) return { ok: false, status: 504, text: async () => '' };
    if (url.startsWith('https://b.test')) throw new TypeError('fetch failed');
    return { ok: true, json: async () => ({ elements: [{ id: 1 }] }) };
  };
  try {
    const data = await geo._internals.overpassRequest('[out:json];out;');
    assert.deepEqual(data, { elements: [{ id: 1 }] });
    assert.equal(calls.length, 3);
  } finally {
    global.fetch = original.fetch;
    config.overpassBases = original.bases;
  }
});

test('overpassRequest não tenta outras instâncias quando a query é rejeitada (400)', async () => {
  const config = require('../src/config/env');
  const original = { fetch: global.fetch, bases: config.overpassBases };
  let n = 0;
  config.overpassBases = ['https://a.test/api', 'https://b.test/api'];
  global.fetch = async () => { n++; return { ok: false, status: 400, text: async () => 'bad' }; };
  try {
    await assert.rejects(() => geo._internals.overpassRequest('x'), { code: 'UPSTREAM_BAD_QUERY' });
    assert.equal(n, 1);
  } finally {
    global.fetch = original.fetch;
    config.overpassBases = original.bases;
  }
});

/* ───────── consulta agregada (Vale Cirurgia) ───────── */

test('buildAroundQuery: uma união com todos os pontos e `out center` sem `tags`', () => {
  const q = geo._internals.buildAroundQuery(
    [{ lat: 41.55, lng: -8.42 }, { lat: 41.44, lng: -8.29 }, { lat: 41.15, lng: -8.61 }],
    2000
  );
  assert.equal((q.match(/around:2000/g) || []).length, 6); // 2 seletores × 3 pontos
  assert.match(q, /out center \d+;/);
  assert.doesNotMatch(q, /out [^;]*tags/);
});

test('searchHealthcareAround: N localizações → 1 único pedido Overpass', async () => {
  const config = require('../src/config/env');
  const original = { fetch: global.fetch, bases: config.overpassBases };
  let n = 0;
  config.overpassBases = ['https://a.test/api'];
  global.fetch = async () => {
    n++;
    return { ok: true, json: async () => ({ elements: [
      { type: 'node', id: 1, lat: 41.55, lon: -8.42, tags: { name: 'Hospital de Braga', amenity: 'hospital' } },
    ] }) };
  };
  try {
    const places = await geo.searchHealthcareAround({
      points: [{ lat: 41.5501, lng: -8.4201 }, { lat: 41.4401, lng: -8.2901 }, { lat: 41.1501, lng: -8.6101 }],
    });
    assert.equal(n, 1);
    assert.equal(places.length, 1);
    assert.equal(places[0].name, 'Hospital de Braga');
  } finally {
    global.fetch = original.fetch;
    config.overpassBases = original.bases;
  }
});

/* ───────── plano B: Overpass caído → Nominatim ───────── */

test('searchHealthcare usa Nominatim quando o Overpass devolve 406/timeout', async () => {
  const config = require('../src/config/env');
  const original = { fetch: global.fetch, bases: config.overpassBases };
  config.overpassBases = ['https://a.test/api', 'https://b.test/api'];
  const nominatimHits = [];
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes('.test/api')) return { ok: false, status: 406, text: async () => '' };
    nominatimHits.push(new URL(u).searchParams.get('amenity'));
    const amenity = new URL(u).searchParams.get('amenity');
    const rows = amenity === 'hospital'
      ? [{ category: 'amenity', type: 'hospital', osm_type: 'way', osm_id: 1, lat: '41.56', lon: '-8.40',
           name: 'Hospital de Braga', extratags: { phone: '+351 253 027 000', 'healthcare:speciality': 'cardiology;general' },
           address: { road: 'Rua das Sete Fontes', city: 'Braga' } },
         { category: 'highway', type: 'bus_stop', osm_type: 'node', osm_id: 9, lat: '41.5', lon: '-8.4', name: 'Hospital' }]
      : amenity === 'clinic'
        ? [{ category: 'amenity', type: 'clinic', osm_type: 'node', osm_id: 2, lat: '41.55', lon: '-8.42', name: 'Clidume',
             extratags: { 'healthcare:speciality': 'stomatology' }, address: {} }]
        : [];
    return { ok: true, json: async () => rows };
  };
  try {
    const bbox = { south: 41.46, west: -8.53, north: 41.62, east: -8.29 };
    const r = await geo.searchHealthcare({ bbox, speciality: 'cardiologia', limit: 40 });
    assert.equal(r.provider, 'nominatim');
    assert.equal(r.matchedBy, 'healthcare:speciality');
    assert.deepEqual(r.places.map((p) => p.name), ['Hospital de Braga']);
    assert.equal(r.places[0].phone, '+351 253 027 000');
    assert.ok(nominatimHits.includes('hospital') && nominatimHits.includes('clinic'));

    // Especialidade sem registo → hospitais e clínicas, com aviso.
    const r2 = await geo.searchHealthcare({ bbox: { ...bbox, south: 41.4601 }, speciality: 'pediatria', limit: 40 });
    assert.equal(r2.matchedBy, 'general-fallback');
    assert.ok(r2.places.length >= 1);
    assert.match(r2.dataQualityNote, /confirme a especialidade/);
  } finally {
    global.fetch = original.fetch;
    config.overpassBases = original.bases;
  }
});
