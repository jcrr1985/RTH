/**
 * Testes de integração HTTP: arrancam a app real numa porta efémera.
 * Só exercitam rotas que não dependem de serviços externos.
 */

const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS = 'http://localhost:5173';

const { createApp } = require('../src/app');

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

const get = (path, init) => fetch(`${base}${path}`, init);
const post = (path, body) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/* ───────────────────────────── básico ───────────────────────────── */

test('GET / lista os endpoints disponíveis', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, 'Run To Health API');
  assert.ok(body.endpoints.some((e) => e.includes('/api/rights/assess')));
});

test('GET /api/health reporta estado e fornecedores', async () => {
  const res = await get('/api/health');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.features.rights, true);
  // Confirma que já não há dependência da Google.
  assert.ok(!JSON.stringify(body.providers).toLowerCase().includes('google'));
  assert.match(body.providers.geocoding, /nominatim/);
});

test('rota inexistente devolve 404 em JSON', async () => {
  const res = await get('/api/nao-existe');
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error.code, 'NOT_FOUND');
});

/* ───────────────────────── motor de direitos ─────────────────────── */

test('GET /api/rights/options devolve a tabela e a base legal', async () => {
  const res = await get('/api/rights/options');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.options));
  assert.ok(body.options.some((o) => o.careType === 'cirurgia'));
  assert.equal(body.transferThresholds.normal, 0.75);
  assert.ok(body.legal.legalBasis.length >= 2);
});

test('POST /api/rights/assess avalia uma cirurgia fora do prazo', async () => {
  const res = await post('/api/rights/assess', {
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2025-01-01',
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'prazo_ultrapassado');
  const ids = body.entitlements.map((e) => e.id);
  assert.ok(ids.includes('vale_cirurgia_primeiro'));
  assert.ok(ids.includes('diretiva_transfronteirica'));
  assert.ok(body.disclaimer);
});

test('POST /api/rights/assess devolve 422 em combinação inexistente', async () => {
  const res = await post('/api/rights/assess', {
    careType: 'cirurgia',
    condition: 'oncologica',
    priority: 'nivel_inventado',
    requestDate: '2026-01-01',
  });
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.equal(body.error.code, 'TMRG_COMBINATION_NOT_FOUND');
});

test('POST /api/rights/assess devolve 400 em data inválida', async () => {
  const res = await post('/api/rights/assess', {
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: 'qualquer coisa',
  });
  assert.equal(res.status, 400);
});

/* ────────────────── orientação (não diagnóstico) ────────────────── */

test('POST /api/orientation encaminha emergência para o 112', async () => {
  const res = await post('/api/orientation', {
    description: 'dor no peito muito forte',
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.urgent, true);
  assert.match(body.message, /112/);
});

test('o endpoint antigo /api/getDiagnosis responde 410 com o substituto', async () => {
  const res = await post('/api/getDiagnosis', { symptoms: 'tosse' });
  assert.equal(res.status, 410);
  const body = await res.json();
  assert.equal(body.error.code, 'ENDPOINT_REMOVED');
  assert.equal(body.error.replacement, '/api/orientation');
  assert.match(body.error.message, /2017\/745/);
});

/* ───────────────────────── vale cirurgia ───────────────────────── */

test('POST /api/vale-cirurgia/rank exige a localização do utente', async () => {
  const res = await post('/api/vale-cirurgia/rank', {
    hospitalNames: ['Hospital de Braga'],
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'NO_ORIGIN');
});

test('POST /api/vale-cirurgia/rank exige lista de hospitais', async () => {
  const res = await post('/api/vale-cirurgia/rank', {
    hospitalNames: [],
    origin: { lat: 41.5454, lng: -8.4265 },
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'NO_HOSPITALS');
});

/* ──────────────────── segurança e validação ───────────────────── */

test('o antigo proxy aberto /places já não existe', async () => {
  // Antes: /places?apiUrl=<qualquer URL> era buscado pelo servidor com a
  // chave de API anexada — SSRF e drenagem de faturação.
  const res = await get('/places?apiUrl=https://example.com/');
  assert.equal(res.status, 404);
});

test('não existe nenhuma rota que aceite um URL do cliente', async () => {
  const res = await get('/api/healthcare?apiUrl=https://example.com');
  // Sem city nem bbox tem de falhar por falta de área, não por ir buscar o URL.
  assert.ok([400, 404].includes(res.status));
  const body = await res.json();
  assert.ok(!JSON.stringify(body).includes('example.com'));
});

test('cabeçalhos de segurança estão presentes', async () => {
  const res = await get('/api/health');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('CORS só autoriza as origens da lista branca', async () => {
  const permitida = await get('/api/health', {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(
    permitida.headers.get('access-control-allow-origin'),
    'http://localhost:5173'
  );

  const negada = await get('/api/health', {
    headers: { Origin: 'https://sitio-malicioso.example' },
  });
  assert.equal(negada.headers.get('access-control-allow-origin'), null);
});

test('OPTIONS devolve 204 para o preflight', async () => {
  const res = await get('/api/health', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(res.status, 204);
});

test('corpos JSON demasiado grandes são rejeitados', async () => {
  const res = await post('/api/orientation', { description: 'x'.repeat(200_000) });
  assert.ok(res.status >= 400, `esperado erro, obtido ${res.status}`);
});

test('JSON malformado não derruba o servidor', async () => {
  const res = await fetch(`${base}/api/rights/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{isto nao e json',
  });
  assert.ok(res.status >= 400);
  // E o servidor continua a responder.
  assert.equal((await get('/api/health')).status, 200);
});
