const assert = require('node:assert/strict');
const { test } = require('node:test');

const { assessRights, STATUS } = require('../src/services/rights.service');
const { lookupTmrg } = require('../src/config/tmrg');

const ids = (r) => r.entitlements.map((e) => e.id);

/* ─────────────────────────── tabela TMRG ─────────────────────────── */

test('tabela TMRG: cirurgia geral normal = 180 dias seguidos', () => {
  assert.deepEqual(lookupTmrg('cirurgia', 'geral', 'normal'), {
    value: 180,
    unit: 'calendar',
  });
});

test('tabela TMRG: cirurgia oncológica normal = 60 dias', () => {
  assert.equal(lookupTmrg('cirurgia', 'oncologica', 'normal').value, 60);
});

test('tabela TMRG: primeira consulta oncológica não tem nível normal', () => {
  assert.equal(lookupTmrg('primeira_consulta', 'oncologica', 'normal'), null);
});

/* ───────────────────── dentro do prazo ───────────────────── */

test('dentro do prazo: 30/180 dias não ativa qualquer transferência', () => {
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-10-01',
    today: '2026-10-31',
  });

  assert.equal(r.status, STATUS.WITHIN);
  assert.equal(r.waiting.daysWaited, 30);
  assert.equal(r.waiting.daysRemaining, 150);
  assert.equal(r.tmrg.dueDate, '2027-03-30');
  assert.ok(!ids(r).includes('vale_cirurgia_primeiro'));
  assert.ok(ids(r).includes('acompanhamento_gabinete_utente'));
});

/* ───────────────── limiar de 75% (prioridade normal) ───────────────── */

test('cirurgia normal: aos 74% ainda não é devida transferência', () => {
  // 180 * 0.75 = 135 dias
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-05-15', // 134 dias
  });
  assert.equal(r.waiting.daysWaited, 134);
  assert.equal(r.status, STATUS.WITHIN);
});

test('cirurgia normal: aos 135 dias (75%) o vale cirurgia é devido', () => {
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-05-16', // 135 dias
  });
  assert.equal(r.waiting.daysWaited, 135);
  assert.equal(r.status, STATUS.TRANSFER_DUE);
  assert.ok(ids(r).includes('vale_cirurgia_primeiro'));
  // Ainda dentro do TMRG: não deve sugerir Diretiva nem reclamação.
  assert.ok(!ids(r).includes('diretiva_transfronteirica'));
  assert.ok(!ids(r).includes('reclamacao_ers'));
});

/* ──────────── limiar de 50% (prioridade prioritária) ──────────── */

test('cirurgia prioritária usa limiar de 50% do TMRG', () => {
  // TMRG 30 dias → transferência devida aos 15
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'prioritaria',
    requestDate: '2026-10-01',
    today: '2026-10-16', // 15 dias
  });
  assert.equal(r.tmrg.days, 30);
  assert.equal(r.waiting.transferThreshold, 0.5);
  assert.equal(r.status, STATUS.TRANSFER_DUE);
  assert.ok(ids(r).includes('vale_cirurgia_primeiro'));
});

/* ──────────────────── prazo ultrapassado ──────────────────── */

test('cirurgia normal aos 200 dias: prazo ultrapassado abre Diretiva + ERS', () => {
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-07-20', // 200 dias
  });

  assert.equal(r.status, STATUS.BREACHED);
  assert.equal(r.waiting.daysRemaining, 0);
  assert.ok(r.waiting.percentElapsed > 1);

  const got = ids(r);
  assert.ok(got.includes('vale_cirurgia_primeiro'));
  assert.ok(got.includes('vale_cirurgia_segundo'));
  assert.ok(got.includes('diretiva_transfronteirica'));
  assert.ok(got.includes('reclamacao_ers'));
  assert.ok(got.includes('revisao_prioridade'));
});

test('terceiro vale só aparece depois de dois vales recebidos', () => {
  const base = {
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-07-20',
  };

  assert.ok(!ids(assessRights({ ...base, valesReceived: 1 })).includes('vale_cirurgia_terceiro'));
  assert.ok(ids(assessRights({ ...base, valesReceived: 2 })).includes('vale_cirurgia_terceiro'));
});

/* ───────── consultas: sem vale cirurgia, mas com Diretiva ───────── */

test('primeira consulta fora do prazo: Diretiva sim, vale cirurgia não', () => {
  const r = assessRights({
    careType: 'primeira_consulta',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-06-01', // 151 dias > 120
  });

  assert.equal(r.tmrg.days, 120);
  assert.equal(r.status, STATUS.BREACHED);
  const got = ids(r);
  assert.ok(got.includes('diretiva_transfronteirica'));
  assert.ok(got.includes('reclamacao_ers'));
  assert.ok(!got.includes('vale_cirurgia_primeiro'), 'vale cirurgia é só para cirurgia');
});

/* ──────────────── casos oncológicos (prazos curtos) ──────────────── */

test('consulta oncológica muito prioritária: 7 dias, ultrapassado aos 10', () => {
  const r = assessRights({
    careType: 'primeira_consulta',
    condition: 'oncologica',
    priority: 'muito_prioritaria',
    requestDate: '2026-10-01',
    today: '2026-10-11',
  });
  assert.equal(r.tmrg.days, 7);
  assert.equal(r.status, STATUS.BREACHED);
  assert.ok(ids(r).includes('diretiva_transfronteirica'));
});

/* ──────────────────────── MCDT e dias úteis ──────────────────────── */

test('MCDT: ressonância magnética = 90 dias', () => {
  const r = assessRights({
    careType: 'mcdt',
    condition: 'geral',
    priority: 'ressonancia_magnetica',
    requestDate: '2026-01-01',
    today: '2026-02-01',
  });
  assert.equal(r.tmrg.days, 90);
  assert.equal(r.status, STATUS.WITHIN);
});

test('CSP sem doença aguda conta em DIAS ÚTEIS, não de calendário', () => {
  // 2026-11-02 (seg) → 2026-11-16 (seg) = 14 dias de calendário, 10 dias úteis
  const r = assessRights({
    careType: 'csp',
    condition: 'geral',
    priority: 'sem_doenca_aguda',
    requestDate: '2026-11-02',
    today: '2026-11-16',
  });
  assert.equal(r.tmrg.unit, 'business');
  assert.equal(r.waiting.daysWaited, 10);
  assert.equal(r.status, STATUS.WITHIN);
});

test('CSP doença aguda: TMRG de 24 horas = 1 dia', () => {
  const r = assessRights({
    careType: 'csp',
    condition: 'geral',
    priority: 'doenca_aguda',
    requestDate: '2026-11-01',
    today: '2026-11-03',
  });
  assert.equal(r.tmrg.days, 1);
  assert.equal(r.status, STATUS.BREACHED);
});

/* ───────────────────────────── validação ──────────────────────────── */

test('combinação inexistente devolve erro 422', () => {
  assert.throws(
    () =>
      assessRights({
        careType: 'cirurgia',
        condition: 'oncologica',
        priority: 'inexistente',
        requestDate: '2026-01-01',
      }),
    (err) => err.statusCode === 422 && err.code === 'TMRG_COMBINATION_NOT_FOUND'
  );
});

test('data inválida devolve erro 400', () => {
  assert.throws(
    () =>
      assessRights({
        careType: 'cirurgia',
        condition: 'geral',
        priority: 'normal',
        requestDate: 'ontem',
      }),
    (err) => err.statusCode === 400 && err.code === 'INVALID_REQUEST_DATE'
  );
});

test('data futura devolve erro 400', () => {
  assert.throws(
    () =>
      assessRights({
        careType: 'cirurgia',
        condition: 'geral',
        priority: 'normal',
        requestDate: '2027-01-01',
        today: '2026-11-01',
      }),
    (err) => err.code === 'FUTURE_REQUEST_DATE'
  );
});

/* ────────────── toda a resposta traz base legal e disclaimer ───────────── */

test('a resposta inclui sempre base legal, fonte verificada e disclaimer', () => {
  const r = assessRights({
    careType: 'cirurgia',
    condition: 'geral',
    priority: 'normal',
    requestDate: '2026-01-01',
    today: '2026-07-20',
  });
  assert.ok(r.legal.legalBasis.length >= 2);
  assert.match(r.legal.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(r.disclaimer, /808 24 24 24/);
  for (const e of r.entitlements) {
    assert.ok(e.id && e.title && e.summary, 'direito sem campos essenciais');
    assert.ok(Array.isArray(e.steps), 'direito sem passos práticos');
  }
});
