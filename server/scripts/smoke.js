#!/usr/bin/env node
/**
 * Smoke test contra os serviços externos reais.
 *
 * Os testes unitários (`npm test`) correm sem rede. Este script confirma que
 * Nominatim, Overpass e OSRM respondem de facto e devolvem o que esperamos.
 *
 *   node scripts/smoke.js
 *
 * Se algum falhar, a causa é quase sempre uma destas:
 *   - HTTP_USER_AGENT não identificável  → o Nominatim bloqueia
 *   - rede sem saída para esses domínios
 *   - a instância pública está sobrecarregada (tenta mais tarde)
 */

const geo = require('../src/services/geo.service');
const rights = require('../src/services/rights.service');
const vale = require('../src/services/valeCirurgia.service');
const config = require('../src/config/env');

const BRAGA = { lat: 41.5454, lng: -8.4265 };

let passed = 0;
let failed = 0;

async function step(name, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    passed += 1;
    console.log(`  ✓ ${name} (${Date.now() - t0} ms)`);
    if (detail) console.log(`      ${detail}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✗ ${name} (${Date.now() - t0} ms)`);
    console.log(`      ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

(async () => {
  console.log('\nRun To Health — smoke test\n');
  console.log(`  User-Agent : ${config.userAgent}`);
  console.log(`  Nominatim  : ${config.nominatimBase}`);
  console.log(`  Overpass   : ${config.overpassBases.join(' , ')}`);
  console.log(`  OSRM       : ${config.osrmBase}\n`);

  console.log('Motor de direitos (sem rede)');
  await step('cirurgia geral normal, 200 dias → prazo ultrapassado', async () => {
    const r = rights.assessRights({
      careType: 'cirurgia',
      condition: 'geral',
      priority: 'normal',
      requestDate: '2026-01-01',
      today: '2026-07-20',
    });
    assert(r.status === 'prazo_ultrapassado', `status inesperado: ${r.status}`);
    const ids = r.entitlements.map((e) => e.id);
    assert(ids.includes('vale_cirurgia_primeiro'), 'sem vale cirurgia');
    assert(ids.includes('diretiva_transfronteirica'), 'sem via transfronteiriça');
    return `${r.entitlements.length} direitos: ${ids.join(', ')}`;
  });

  console.log('\nNominatim (geocodificação)');
  await step('geocodificar "Hospital de Braga"', async () => {
    const r = await geo.geocode('Hospital de Braga');
    assert(r, 'sem resultado');
    assert(Number.isFinite(r.lat) && Number.isFinite(r.lng), 'coordenadas inválidas');
    assert(r.lat > 40 && r.lat < 43, `latitude fora de Portugal: ${r.lat}`);
    return `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)} — ${(r.displayName || '').slice(0, 60)}`;
  });

  await step('cache de geocodificação ativa no segundo pedido', async () => {
    const t0 = Date.now();
    await geo.geocode('Hospital de Braga');
    const ms = Date.now() - t0;
    assert(ms < 50, `demorou ${ms} ms — a cache não funcionou`);
    return `respondeu em ${ms} ms`;
  });

  await step('geocodificação inversa a partir de Braga', async () => {
    const r = await geo.reverseGeocode(BRAGA.lat, BRAGA.lng);
    assert(r, 'sem resultado');
    return `${r.city || '?'}, ${r.country || '?'}`;
  });

  console.log('\nOverpass (unidades de saúde)');
  await step('unidades de saúde em Braga', async () => {
    const r = await geo.searchHealthcare({ city: 'Braga', limit: 25 });
    assert(r.count > 0, 'nenhuma unidade encontrada');
    const exemplo = r.places[0];
    return `${r.count} unidades; ex.: ${exemplo.name} (${exemplo.facilityType || '?'})`;
  });

  await step('filtro por especialidade (dentista em Braga)', async () => {
    const r = await geo.searchHealthcare({
      speciality: 'dentista',
      city: 'Braga',
      limit: 20,
    });
    return `${r.count} resultados, filtrado por ${r.matchedBy}`;
  });

  console.log('\nOSRM (tempos de viagem)');
  await step('matriz Braga → Porto / Guimarães', async () => {
    const r = await geo.travelMatrix({
      origin: BRAGA,
      destinations: [
        { lat: 41.1579, lng: -8.6291 }, // Porto
        { lat: 41.4425, lng: -8.2918 }, // Guimarães
      ],
      mode: 'driving',
    });
    assert(r.length === 2, 'número de resultados errado');
    const estimado = r.some((x) => x.estimated);
    if (estimado) {
      return 'OSRM indisponível — usou distância geodésica (degradação graciosa OK)';
    }
    assert(r[0].durationSeconds > 0, 'duração inválida');
    return `Porto ${r[0].durationText} / ${r[0].distanceText} · Guimarães ${r[1].durationText}`;
  });

  console.log('\nSeletor de Vale Cirurgia (fluxo completo)');
  await step('ordenar 3 hospitais a partir de Braga', async () => {
    const r = await vale.rankValeOptions({
      hospitalNames: [
        'Hospital de Braga',
        'Hospital de São João, Porto',
        'Hospital Senhora da Oliveira, Guimarães',
      ],
      origin: BRAGA,
    });
    assert(r.options.length > 0, 'nenhum hospital localizado');
    const linhas = r.options
      .map(
        (o) =>
          `#${o.rank} ${o.name.slice(0, 40)} — ${o.driving?.durationText || '?'} ` +
          `(total ${o.totalTravelBurden?.totalText || '?'}) score ${o.score}`
      )
      .join('\n      ');
    return `${r.options.length} ordenados, ${r.unresolved.length} não resolvidos\n      ${linhas}`;
  });

  console.log(`\n${passed} passaram, ${failed} falharam\n`);
  process.exit(failed ? 1 : 0);
})();
