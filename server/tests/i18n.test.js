/**
 * Testes de internacionalização.
 *
 * O mais importante aqui é o teste de PARIDADE DE CHAVES: garante que nenhum
 * idioma fica para trás quando se acrescenta conteúdo. Numa aplicação sobre
 * direitos legais, um campo em falta não é um detalhe estético — é um utente
 * que não fica a saber o que pode fazer.
 */

const assert = require('node:assert/strict');
const { test } = require('node:test');

const i18n = require('../src/i18n');
const { assessRights } = require('../src/services/rights.service');

const LANGS = ['pt', 'en', 'es', 'ru', 'hi'];

/* ───────────────────── idiomas disponíveis ───────────────────── */

test('estão disponíveis os cinco idiomas previstos', () => {
  assert.deepEqual([...i18n.SUPPORTED].sort(), [...LANGS].sort());
  assert.equal(i18n.DEFAULT_LANGUAGE, 'pt');
});

test('listLanguages devolve código e nome nativo de cada idioma', () => {
  const list = i18n.listLanguages();
  assert.equal(list.length, 5);
  const byCode = Object.fromEntries(list.map((l) => [l.code, l.name]));
  assert.equal(byCode.pt, 'Português');
  assert.equal(byCode.en, 'English');
  assert.equal(byCode.es, 'Español');
  assert.equal(byCode.ru, 'Русский');
  assert.equal(byCode.hi, 'हिन्दी');
  assert.equal(list.filter((l) => l.isDefault).length, 1);
});

/* ───────────────── paridade de chaves entre idiomas ───────────────── */

/** Caminhos de todas as folhas do objeto, para comparar estruturas. */
function leafPaths(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) out.push(`${path}[]`);
    else if (v && typeof v === 'object') out.push(...leafPaths(v, path));
    else out.push(path);
  }
  return out.sort();
}

test('todos os idiomas têm exatamente as mesmas chaves que o português', () => {
  const reference = leafPaths(i18n.LOCALES.pt);
  for (const lang of LANGS.filter((l) => l !== 'pt')) {
    const actual = leafPaths(i18n.LOCALES[lang]);
    const missing = reference.filter((k) => !actual.includes(k));
    const extra = actual.filter((k) => !reference.includes(k));
    assert.deepEqual(missing, [], `${lang}: chaves em falta`);
    assert.deepEqual(extra, [], `${lang}: chaves a mais`);
  }
});

test('nenhuma tradução ficou vazia', () => {
  for (const lang of LANGS) {
    const walk = (obj, prefix = '') => {
      for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'string') {
          assert.ok(v.trim().length > 0, `${lang}: ${path} está vazio`);
        } else if (Array.isArray(v)) {
          v.forEach((item, i) => {
            assert.equal(typeof item, 'string', `${lang}: ${path}[${i}] não é texto`);
            assert.ok(item.trim().length > 0, `${lang}: ${path}[${i}] está vazio`);
          });
        } else if (v && typeof v === 'object') {
          walk(v, path);
        }
      }
    };
    walk(i18n.LOCALES[lang]);
  }
});

test('os passos de cada direito têm o mesmo número de itens em todos os idiomas', () => {
  const ids = Object.keys(i18n.LOCALES.pt.entitlements);
  for (const id of ids) {
    const ref = i18n.LOCALES.pt.entitlements[id];
    for (const lang of LANGS.filter((l) => l !== 'pt')) {
      const other = i18n.LOCALES[lang].entitlements[id];
      assert.equal(other.steps.length, ref.steps.length, `${lang}/${id}: nº de passos difere`);
      assert.equal(
        other.warnings.length,
        ref.warnings.length,
        `${lang}/${id}: nº de avisos difere`
      );
    }
  }
});

/* ───────────────── termos oficiais ficam em português ───────────────── */

test('os nomes oficiais dos documentos ficam em português em todos os idiomas', () => {
  // São o que vem impresso na carta e o que o balcão reconhece. Traduzi-los
  // mandaria o utente pedir uma coisa que não existe.
  for (const lang of LANGS) {
    const L = i18n.LOCALES[lang];
    assert.match(
      L.entitlements.vale_cirurgia_primeiro.title,
      /Vale Cirurgia/,
      `${lang}: perdeu "Vale Cirurgia" no título`
    );
    assert.match(
      L.entitlements.vale_cirurgia_primeiro.whatItMeans,
      /Nota de Transfer[êe]ncia/,
      `${lang}: perdeu "Nota de Transferência"`
    );
    assert.ok(
      L.entitlements.vale_cirurgia_primeiro.steps.some((s) => /Gabinete do Utente/.test(s)),
      `${lang}: perdeu "Gabinete do Utente" nos passos`
    );
  }
});

test('os números de emergência aparecem em todos os idiomas', () => {
  for (const lang of LANGS) {
    assert.match(i18n.LOCALES[lang].disclaimer, /808 24 24 24/, `${lang}: falta o SNS 24`);
    assert.match(i18n.LOCALES[lang].disclaimer, /112/, `${lang}: falta o 112`);
  }
});

/* ───────────────────────── interpolação ───────────────────────── */

test('interpolate substitui as chaves presentes e deixa as outras', () => {
  assert.equal(i18n.interpolate('faltam {n} dias', { n: 7 }), 'faltam 7 dias');
  assert.equal(i18n.interpolate('{a} e {b}', { a: 'x' }), 'x e {b}');
  assert.equal(i18n.interpolate('sem chaves', { a: 1 }), 'sem chaves');
});

test('o tradutor interpola dentro de listas', () => {
  const t = i18n.createTranslator('pt');
  const guidance = t('valeGuidance');
  assert.ok(Array.isArray(guidance) && guidance.length > 0);
  const explanation = t('valeTripsExplanation', { trips: 4 });
  assert.match(explanation, /4/);
  assert.ok(!explanation.includes('{trips}'));
});

/* ───────────────────────── normalização ───────────────────────── */

test('normalize aceita variantes regionais e cai para português', () => {
  assert.equal(i18n.normalize('pt-PT'), 'pt');
  assert.equal(i18n.normalize('pt_BR'), 'pt');
  assert.equal(i18n.normalize('EN-us'), 'en');
  assert.equal(i18n.normalize('ru-RU'), 'ru');
  assert.equal(i18n.normalize('hi-IN'), 'hi');
  assert.equal(i18n.normalize('zz'), 'pt');
  assert.equal(i18n.normalize(''), 'pt');
  assert.equal(i18n.normalize(null), 'pt');
  assert.equal(i18n.normalize(undefined), 'pt');
});

test('fromAcceptLanguage respeita a ordem de preferência', () => {
  assert.equal(i18n.fromAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8'), 'ru');
  assert.equal(i18n.fromAcceptLanguage('de-DE,de;q=0.9,en;q=0.5'), 'en');
  assert.equal(i18n.fromAcceptLanguage('hi-IN,hi;q=0.9'), 'hi');
  // Nenhum idioma suportado → português.
  assert.equal(i18n.fromAcceptLanguage('de,fr;q=0.8'), 'pt');
  assert.equal(i18n.fromAcceptLanguage(''), 'pt');
  assert.equal(i18n.fromAcceptLanguage(undefined), 'pt');
});

/* ──────────── o motor de direitos responde no idioma pedido ──────────── */

const CASE = {
  careType: 'cirurgia',
  condition: 'geral',
  priority: 'normal',
  requestDate: '2026-01-01',
  today: '2026-07-20', // 200 dias, prazo ultrapassado
};

test('a avaliação devolve o idioma usado', () => {
  for (const lang of LANGS) {
    assert.equal(assessRights({ ...CASE, language: lang }).language, lang);
  }
  assert.equal(assessRights(CASE).language, 'pt', 'sem idioma deve usar português');
  assert.equal(assessRights({ ...CASE, language: 'de' }).language, 'pt');
});

test('os mesmos direitos são devolvidos em qualquer idioma', () => {
  const ids = (lang) =>
    assessRights({ ...CASE, language: lang }).entitlements.map((e) => e.id);
  const reference = ids('pt');
  assert.ok(reference.length >= 4);
  for (const lang of LANGS) {
    assert.deepEqual(ids(lang), reference, `${lang}: lista de direitos difere`);
  }
});

test('o texto muda mesmo de idioma para idioma', () => {
  const titles = LANGS.map(
    (lang) => assessRights({ ...CASE, language: lang }).statusLabel
  );
  assert.equal(new Set(titles).size, LANGS.length, 'algum idioma repetiu o texto');
});

test('a base legal e as ligações NÃO são traduzidas', () => {
  // Apontam para o Diário da República e para portais oficiais portugueses.
  for (const lang of LANGS) {
    const r = assessRights({ ...CASE, language: lang });
    const vale = r.entitlements.find((e) => e.id === 'vale_cirurgia_primeiro');
    assert.ok(vale.legalBasis.some((b) => /Lei n\.º 15\/2014/.test(b)), lang);
    assert.ok(vale.links.some((l) => l.url.includes('sns24.gov.pt')), lang);
    const diretiva = r.entitlements.find((e) => e.id === 'diretiva_transfronteirica');
    assert.ok(diretiva.legalBasis.some((b) => /2011\/24\/UE/.test(b)), lang);
  }
});

test('cada idioma interpola a percentagem no resumo do vale', () => {
  for (const lang of LANGS) {
    const r = assessRights({ ...CASE, language: lang });
    const vale = r.entitlements.find((e) => e.id === 'vale_cirurgia_primeiro');
    assert.match(vale.summary, /75/, `${lang}: percentagem não interpolada`);
    assert.ok(!vale.summary.includes('{percent}'), `${lang}: placeholder por substituir`);
  }
});

test('as mensagens de erro saem no idioma pedido', () => {
  const bad = { ...CASE, requestDate: 'não é uma data' };
  const messages = LANGS.map((lang) => {
    try {
      assessRights({ ...bad, language: lang });
      throw new Error('devia ter falhado');
    } catch (err) {
      return err.message;
    }
  });
  assert.equal(new Set(messages).size, LANGS.length, 'erros não traduzidos');
});

test('o aviso de não-aconselhamento vem sempre, em qualquer idioma', () => {
  for (const lang of LANGS) {
    const r = assessRights({ ...CASE, language: lang });
    assert.ok(r.disclaimer && r.disclaimer.length > 40, lang);
    assert.match(r.disclaimer, /808 24 24 24/, `${lang}: falta o SNS 24`);
  }
});
