/**
 * Internacionalização do conteúdo de direitos.
 *
 * Porque é que isto existe no SERVIDOR e não no cliente: o texto dos direitos é
 * conteúdo jurídico. Tem de ser versionado com a lei, revisto em conjunto e
 * mudado num sítio só quando a portaria mudar. Espalhá-lo pelo cliente
 * garantiria que uma das traduções ficaria para trás na próxima alteração.
 *
 * Idiomas escolhidos a partir do Relatório de Migrações e Asilo 2025 da AIMA
 * (1 585 854 estrangeiros residentes em Portugal no final de 2025):
 *
 *   pt  Português  — 50% dos residentes estrangeiros vêm de países lusófonos
 *   en  English    — Reino Unido (47 726) e língua franca de muitos outros
 *   es  Español    — comunidade hispanofalante e fronteira com Espanha
 *   ru  Русский    — Ucrânia (84 889), 4.ª maior comunidade
 *   hi  हिन्दी       — Índia (91 405), 3.ª maior comunidade, e boa parte
 *                    dos residentes do Nepal (53 304) compreende hindi
 */

const LOCALES = {
  pt: require('./locales/pt'),
  en: require('./locales/en'),
  es: require('./locales/es'),
  ru: require('./locales/ru'),
  hi: require('./locales/hi'),
};

const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED = Object.keys(LOCALES);

/** Normaliza "pt-PT", "PT", "pt_BR" → "pt". Desconhecido → português. */
function normalize(lang) {
  if (!lang || typeof lang !== 'string') return DEFAULT_LANGUAGE;
  const short = lang.trim().toLowerCase().slice(0, 2);
  return SUPPORTED.includes(short) ? short : DEFAULT_LANGUAGE;
}

function getLocale(lang) {
  return LOCALES[normalize(lang)];
}

/** Substitui {chave} pelos valores dados. Chave sem valor fica como está. */
function interpolate(template, values) {
  if (typeof template !== 'string' || !values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

/**
 * Cria um tradutor ligado a um idioma.
 * Em falta de chave, cai para português em vez de devolver vazio: mais vale
 * texto em português do que nada numa página sobre direitos.
 */
function createTranslator(lang) {
  const code = normalize(lang);
  const locale = LOCALES[code];
  const fallback = LOCALES[DEFAULT_LANGUAGE];

  function lookup(path) {
    const parts = path.split('.');
    let cur = locale;
    for (const p of parts) {
      if (cur == null) break;
      cur = cur[p];
    }
    if (cur !== undefined) return cur;

    let fb = fallback;
    for (const p of parts) {
      if (fb == null) break;
      fb = fb[p];
    }
    return fb;
  }

  function t(path, values) {
    const value = lookup(path);
    if (Array.isArray(value)) return value.map((v) => interpolate(v, values));
    if (typeof value === 'string') return interpolate(value, values);
    return value !== undefined ? value : path;
  }

  t.language = code;
  t.locale = locale;
  t.languageName = locale.name; // `name` es de solo lectura en funciones (error en modo estricto)
  return t;
}

/** Lista para alimentar o seletor de idioma do cliente. */
function listLanguages() {
  return SUPPORTED.map((code) => ({
    code,
    name: LOCALES[code].name,
    isDefault: code === DEFAULT_LANGUAGE,
  }));
}

/** Negoceia a partir do cabeçalho Accept-Language, se o cliente não disser nada. */
function fromAcceptLanguage(header) {
  if (!header || typeof header !== 'string') return DEFAULT_LANGUAGE;
  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .filter((c) => Number.isFinite(c.q))
    .sort((a, b) => b.q - a.q);

  for (const c of candidates) {
    const short = c.tag.slice(0, 2);
    if (SUPPORTED.includes(short)) return short;
  }
  return DEFAULT_LANGUAGE;
}

module.exports = {
  LOCALES,
  SUPPORTED,
  DEFAULT_LANGUAGE,
  normalize,
  getLocale,
  createTranslator,
  listLanguages,
  fromAcceptLanguage,
  interpolate,
};
