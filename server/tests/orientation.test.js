const assert = require('node:assert/strict');
const { test } = require('node:test');

const orientation = require('../src/services/orientation.service');
const { sanitizeLlmOutput, SYSTEM_PROMPT } = orientation._internals;

/* ──────────────────── sinais de alarme ────────────────────
 * Esta é a parte crítica para a segurança: tem de funcionar SEM LLM,
 * porque um modelo pode estar indisponível, lento ou simplesmente errado.
 */

const flagIds = (text) => orientation.detectRedFlags(text).map((f) => f.id);

test('dor no peito dispara emergência', () => {
  for (const frase of [
    'tenho uma dor no peito muito forte',
    'sinto um aperto no peito desde ontem',
    'dor torácica ao subir escadas',
  ]) {
    assert.ok(flagIds(frase).includes('dor_toracica'), `não detetado: "${frase}"`);
  }
});

test('sinais de AVC disparam emergência', () => {
  for (const frase of [
    'a minha mãe tem a boca ao lado e não consegue falar',
    'a boca está ao lado',
    'o rosto ficou torto',
    'a cara está caída de um lado',
    'perdi a força no braço direito de repente',
    'a minha mãe perdeu a força na perna esquerda',
    'fiquei sem força na mão direita',
    'tenho o braço esquerdo dormente de repente',
    'fraqueza súbita no lado direito',
    'tem a fala arrastada desde há uma hora',
    'tem dificuldade a falar desde hoje',
    'acho que foi um AVC',
  ]) {
    assert.ok(flagIds(frase).includes('avc'), `não detetado: "${frase}"`);
  }
});

test('expressões correntes com as mesmas palavras não disparam AVC', () => {
  // Estes falsos positivos enviariam gente ao 112 sem razão, o que gasta
  // credibilidade e recursos de emergência.
  for (const frase of [
    'estacionei o carro ao lado do hospital',
    'a farmácia é ao lado do centro de saúde',
    'ando sem força de vontade para ir ao ginásio',
    'perdi o cartão de utente',
    'queria marcar consulta de rotina de oftalmologia',
  ]) {
    assert.deepEqual(flagIds(frase), [], `falso positivo em "${frase}"`);
  }
});

test('dificuldade respiratória grave dispara emergência', () => {
  assert.ok(flagIds('não consigo respirar bem').includes('dificuldade_respiratoria'));
  assert.ok(
    flagIds('tenho falta de ar grave desde hoje').includes('dificuldade_respiratoria')
  );
});

test('febre em bebé é encaminhada como urgente, não como emergência', () => {
  const result = orientation.detectRedFlags('o meu bebé tem febre de 38 graus');
  const flag = result.find((f) => f.id === 'febre_lactente');
  assert.ok(flag, 'febre em lactente não detetada');
  assert.equal(flag.action, 'urgente');
});

test('ideação suicida é encaminhada para apoio imediato', () => {
  for (const frase of [
    'já não quero viver',
    'ando a pensar em acabar com a minha vida',
    'quero fazer mal a mim mesmo',
  ]) {
    const flags = orientation.detectRedFlags(frase);
    const flag = flags.find((f) => f.action === 'apoio_imediato');
    assert.ok(flag, `não detetado: "${frase}"`);
    assert.match(flag.message, /808 24 24 24/);
  }
});

test('queixas banais não disparam sinais de alarme', () => {
  for (const frase of [
    'tenho uma verruga na mão há meses',
    'queria marcar consulta de rotina de oftalmologia',
    'preciso de renovar a receita da medicação habitual',
  ]) {
    assert.deepEqual(flagIds(frase), [], `falso positivo em "${frase}"`);
  }
});

/* ──────── encaminhamento imediato tem prioridade sobre o LLM ──────── */

test('com sinal de emergência responde sem chamar LLM', async () => {
  const r = await orientation.getOrientation({
    description: 'dor no peito e falta de ar',
  });
  assert.equal(r.kind, 'encaminhamento_imediato');
  assert.equal(r.urgent, true);
  assert.equal(r.llmUsed, false);
  assert.match(r.message, /112/);
  assert.ok(r.contacts.some((c) => c.value === '112'));
});

test('ideação suicida devolve apoio antes de qualquer outra coisa', async () => {
  const r = await orientation.getOrientation({ description: 'não quero mais viver' });
  assert.equal(r.kind, 'encaminhamento_imediato');
  assert.match(r.message, /808 24 24 24/);
});

test('sem LLM configurado devolve orientação base e não falha', async () => {
  const r = await orientation.getOrientation({
    description: 'tenho uma dor no joelho ao caminhar há três semanas',
  });
  assert.equal(r.kind, 'encaminhamento_base');
  assert.equal(r.llmUsed, false);
  assert.equal(r.entryPoint, 'medico_familia');
  assert.ok(r.whatToBring.length > 0);
  assert.ok(r.questionsToAsk.length > 0);
});

test('descrição vazia é rejeitada', async () => {
  await assert.rejects(
    orientation.getOrientation({ description: '   ' }),
    (e) => e.code === 'NO_DESCRIPTION'
  );
});

/* ──────── toda a resposta traz aviso de não-diagnóstico ──────── */

test('todas as respostas incluem o disclaimer de não-diagnóstico', async () => {
  for (const d of ['dor no peito', 'dor no joelho há semanas']) {
    const r = await orientation.getOrientation({ description: d });
    assert.ok(r.disclaimer, 'resposta sem disclaimer');
    assert.match(r.disclaimer, /diagn[óo]stic/i);
  }
});

/* ──────── o prompt de sistema proíbe diagnóstico ──────── */

test('o prompt de sistema proíbe explicitamente nomear diagnósticos', () => {
  assert.match(SYSTEM_PROMPT, /NUNCA nomeies uma doen[çc]a/);
  assert.match(SYSTEM_PROMPT, /N[ÃA]O faz(es)? diagn[óo]sticos/i);
  assert.match(SYSTEM_PROMPT, /NUNCA sugiras medicamentos/);
});

/* ──────── saneamento da saída do modelo ──────── */

test('sanitizeLlmOutput força um entryPoint da lista permitida', () => {
  assert.equal(
    sanitizeLlmOutput({ entryPoint: 'curandeiro' }).entryPoint,
    'medico_familia'
  );
  assert.equal(
    sanitizeLlmOutput({ entryPoint: 'urgencia' }).entryPoint,
    'urgencia'
  );
});

test('sanitizeLlmOutput descarta tipos errados sem explodir', () => {
  const r = sanitizeLlmOutput({
    entryPoint: 'sns24',
    likelySpecialities: 'cardiologia', // devia ser array
    whatToBring: [null, 42, 'exames anteriores', ''],
    questionsToAsk: undefined,
  });
  assert.deepEqual(r.likelySpecialities, []);
  assert.deepEqual(r.whatToBring, ['exames anteriores']);
  assert.deepEqual(r.questionsToAsk, []);
});

test('sanitizeLlmOutput limita o tamanho dos campos de texto', () => {
  const r = sanitizeLlmOutput({
    entryPoint: 'sns24',
    entryPointReason: 'x'.repeat(5000),
    accessNote: 'y'.repeat(5000),
  });
  assert.ok(r.entryPointReason.length <= 300);
  assert.ok(r.accessNote.length <= 400);
});

test('sanitizeLlmOutput limita o número de itens das listas', () => {
  const r = sanitizeLlmOutput({
    entryPoint: 'sns24',
    likelySpecialities: Array.from({ length: 50 }, (_, i) => `esp${i}`),
    whatToBring: Array.from({ length: 50 }, (_, i) => `item${i}`),
  });
  assert.ok(r.likelySpecialities.length <= 4);
  assert.ok(r.whatToBring.length <= 8);
});

test('sem configuração de LLM, llmEnabled é falso', () => {
  assert.equal(orientation.llmEnabled(), false);
});
