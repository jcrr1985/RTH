/**
 * Motor de Direitos do Utente (SNS, Portugal)
 *
 * Dada a inscrição de um utente numa lista de espera do SNS, calcula:
 *   1. o TMRG legalmente aplicável,
 *   2. quanto tempo já esperou e em que percentagem do prazo está,
 *   3. QUE DIREITOS CONCRETOS já pode exercer, com base legal e passos práticos.
 *
 * Porque é que isto importa:
 *   No final de 2025 havia mais de 1 milhão de utentes em espera por consulta de
 *   especialidade e cerca de 264 mil por cirurgia. Num período de 8 meses foram
 *   emitidos mais de 134 400 vales cirurgia — e mais de metade (55,37%) foram
 *   recusados pelos utentes. Noutro semestre, de 51 940 vales emitidos apenas
 *   26,9% foram efetivamente utilizados.
 *   O direito existe; o que falta é as pessoas saberem o que fazer com ele.
 *
 * IDIOMAS
 *   O texto vive em src/i18n/locales/*. Cerca de 1,59 milhões de residentes em
 *   Portugal são estrangeiros, e a maior parte das comunidades que mais precisa
 *   de navegar a burocracia da saúde não lê português com à-vontade. As
 *   designações oficiais (Vale Cirurgia, Nota de Transferência, Gabinete do
 *   Utente) ficam em português em todos os idiomas, porque é assim que
 *   aparecem na carta e no balcão.
 *
 * ⚠️  Isto é INFORMAÇÃO, não aconselhamento jurídico nem clínico.
 */

const {
  SOURCE,
  TRANSFER_THRESHOLDS,
  lookupTmrg,
} = require('../config/tmrg');
const { createTranslator } = require('../i18n');

const MS_PER_DAY = 86_400_000;

const STATUS = {
  WITHIN: 'dentro_do_prazo',
  TRANSFER_DUE: 'transferencia_devida',
  BREACHED: 'prazo_ultrapassado',
};

/* ────────────────────────────── utilitários ─────────────────────────────── */

function parseDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // Normaliza para meia-noite UTC: contamos dias de calendário, não instantes.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function calendarDaysBetween(from, to) {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

function businessDaysBetween(from, to) {
  let days = 0;
  const cursor = new Date(from.getTime());
  while (cursor < to) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days += 1;
  }
  return days; // Nota: não desconta feriados nacionais.
}

function addCalendarDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Converte a entrada da tabela num número de dias comparável. */
function tmrgToDays(entry) {
  if (entry.unit === 'hours') return entry.value / 24;
  return entry.value; // calendar e business são contados nas suas próprias unidades
}

/**
 * Ligações e base legal NÃO são traduzidas: apontam para fontes oficiais
 * portuguesas e os nomes dos diplomas são os que constam do Diário da
 * República. Traduzi-los tornaria impossível encontrá-los.
 */
const ENTITLEMENT_REFS = {
  vale_cirurgia_primeiro: {
    severity: 'media',
    legalBasis: [
      'Lei n.º 15/2014, de 21 de março',
      'Manual de Gestão de Inscritos para Cirurgia (SINACC)',
    ],
    links: [
      {
        label: 'SNS 24 — Notas de transferência e vale cirurgia',
        url: 'https://www.sns24.gov.pt/servico/notas-de-transferencia-e-vale-cirurgia/',
      },
      {
        label: 'gov.pt — Receber vale cirurgia e nota de transferência',
        url: 'https://www.gov.pt/servicos/receber-vale-cirurgia-e-nota-de-transferencia',
      },
      {
        label: 'ACSS — Vale-Cirurgia (FAQ)',
        url: 'https://www.acss.min-saude.pt/2022/12/22/vale-cirurgia/',
      },
    ],
  },
  vale_cirurgia_segundo: {
    severity: 'alta',
    legalBasis: [
      'Lei n.º 15/2014, de 21 de março',
      'Manual de Gestão de Inscritos para Cirurgia (SINACC)',
    ],
    links: [
      {
        label: 'ACSS — Vale-Cirurgia (FAQ)',
        url: 'https://www.acss.min-saude.pt/2022/12/22/vale-cirurgia/',
      },
    ],
  },
  vale_cirurgia_terceiro: {
    severity: 'alta',
    legalBasis: ['Manual de Gestão de Inscritos para Cirurgia (SINACC)'],
    links: [
      {
        label: 'ACSS — Vale-Cirurgia (FAQ)',
        url: 'https://www.acss.min-saude.pt/2022/12/22/vale-cirurgia/',
      },
    ],
  },
  diretiva_transfronteirica: {
    severity: 'alta',
    legalBasis: [
      'Diretiva 2011/24/UE do Parlamento Europeu e do Conselho, de 9 de março de 2011',
      'Lei n.º 52/2014, de 25 de agosto (transposição), em especial o artigo 8.º',
    ],
    links: [
      {
        label: 'SNS — Cuidados de Saúde Programados',
        url: 'https://www.sns.gov.pt/cuidados-de-saude-programados/',
      },
      {
        label: 'Ponto de Contacto Nacional da Diretiva',
        url: 'https://diretiva.min-saude.pt/home-page-2/',
      },
      {
        label: 'Diretiva 2011/24/UE (síntese EUR-Lex)',
        url: 'https://eur-lex.europa.eu/legal-content/PT/TXT/HTML/?uri=LEGISSUM:sp0002',
      },
    ],
  },
  reclamacao_ers: {
    severity: 'media',
    legalBasis: [
      'Lei n.º 15/2014, de 21 de março',
      'Decreto-Lei n.º 126/2014 (estatutos da ERS)',
    ],
    links: [
      { label: 'ERS — Reclamações', url: 'https://www.ers.pt/pt/utentes/reclamacoes/' },
      { label: 'Livro de Reclamações Eletrónico', url: 'https://www.livroreclamacoes.pt/' },
    ],
  },
  revisao_prioridade: {
    severity: 'media',
    legalBasis: ['Manual de Gestão de Inscritos para Cirurgia (SINACC)'],
    links: [],
  },
  acompanhamento_gabinete_utente: {
    severity: 'informativa',
    legalBasis: ['Lei n.º 15/2014, de 21 de março'],
    links: [
      { label: 'Portal dos Tempos de Espera do SNS', url: 'https://tempos.min-saude.pt/' },
      {
        label: 'ERS — TMRG (tabela oficial)',
        url: 'https://www.ers.pt/pt/utentes/perguntas-frequentes/faq/tempos-maximos-de-resposta-garantidos-tmrg/',
      },
    ],
  },
};

/** Monta um direito juntando a estrutura fixa ao texto traduzido. */
function buildEntitlement(id, t, values) {
  const ref = ENTITLEMENT_REFS[id];
  const base = `entitlements.${id}`;
  return {
    id,
    severity: ref.severity,
    title: t(`${base}.title`, values),
    summary: t(`${base}.summary`, values),
    whatItMeans: t(`${base}.whatItMeans`, values),
    steps: t(`${base}.steps`, values),
    warnings: t(`${base}.warnings`, values),
    legalBasis: ref.legalBasis,
    links: ref.links,
  };
}

/* ───────────────────────────── motor principal ──────────────────────────── */

/**
 * @param {object} input
 * @param {string} input.careType   csp | primeira_consulta | cirurgia | mcdt
 * @param {string} input.condition  geral | oncologica | cardiaca
 * @param {string} input.priority   muito_prioritaria | prioritaria | normal | (chave de mcdt/csp)
 * @param {string} input.requestDate  data do registo do pedido / indicação (ISO)
 * @param {string} [input.language='pt'] pt | en | es | ru | hi
 * @param {string} [input.today]      para testes determinísticos
 * @param {number} [input.valesReceived=0] quantos vales já recebeu
 * @returns {object} avaliação de direitos
 */
function assessRights(input) {
  const {
    careType,
    condition,
    priority,
    requestDate,
    today,
    language,
    valesReceived = 0,
  } = input || {};

  const t = createTranslator(language);

  const entry = lookupTmrg(careType, condition, priority);
  if (!entry) {
    const err = new Error(t('errors.tmrgNotFound'));
    err.statusCode = 422;
    err.code = 'TMRG_COMBINATION_NOT_FOUND';
    throw err;
  }

  const start = parseDate(requestDate);
  if (!start) {
    const err = new Error(t('errors.invalidDate'));
    err.statusCode = 400;
    err.code = 'INVALID_REQUEST_DATE';
    throw err;
  }

  const now = parseDate(today || new Date());
  if (start > now) {
    const err = new Error(t('errors.futureDate'));
    err.statusCode = 400;
    err.code = 'FUTURE_REQUEST_DATE';
    throw err;
  }

  const tmrgDays = tmrgToDays(entry);
  const daysWaited =
    entry.unit === 'business'
      ? businessDaysBetween(start, now)
      : calendarDaysBetween(start, now);

  const percentElapsed = tmrgDays > 0 ? daysWaited / tmrgDays : 0;
  const daysRemaining = Math.max(0, Math.ceil(tmrgDays - daysWaited));
  const dueDate = addCalendarDays(start, Math.ceil(tmrgDays));

  const threshold = TRANSFER_THRESHOLDS[priority] ?? 0.75;

  let status = STATUS.WITHIN;
  if (percentElapsed >= 1) status = STATUS.BREACHED;
  else if (percentElapsed >= threshold) status = STATUS.TRANSFER_DUE;

  /* ── composição dos direitos aplicáveis ── */
  const careTypeLabel = t(`careType.${careType}`);
  const entitlements = [];
  const isSurgery = careType === 'cirurgia';

  if (status === STATUS.WITHIN) {
    entitlements.push(
      buildEntitlement('acompanhamento_gabinete_utente', t, {
        daysRemaining,
        dueDate: toIsoDate(dueDate),
      })
    );
  }

  if (isSurgery && status === STATUS.TRANSFER_DUE) {
    entitlements.push(
      buildEntitlement('vale_cirurgia_primeiro', t, {
        percent: Math.round(threshold * 100),
      })
    );
  }

  if (isSurgery && status === STATUS.BREACHED) {
    entitlements.push(
      buildEntitlement('vale_cirurgia_primeiro', t, {
        percent: Math.round(threshold * 100),
      })
    );
    entitlements.push(buildEntitlement('vale_cirurgia_segundo', t, {}));
    if (valesReceived >= 2) {
      entitlements.push(buildEntitlement('vale_cirurgia_terceiro', t, {}));
    }
  }

  if (status === STATUS.BREACHED) {
    entitlements.push(
      buildEntitlement('diretiva_transfronteirica', t, {
        careType: careTypeLabel.toLowerCase(),
      })
    );
    entitlements.push(buildEntitlement('reclamacao_ers', t, {}));
  }

  if (status !== STATUS.WITHIN && priority === 'normal') {
    entitlements.push(buildEntitlement('revisao_prioridade', t, {}));
  }

  return {
    language: t.language,
    input: {
      careType,
      condition,
      priority,
      requestDate: toIsoDate(start),
      evaluatedOn: toIsoDate(now),
      valesReceived,
    },
    labels: {
      careType: careTypeLabel,
      condition: t(`condition.${condition}`),
      priority: t(`priority.${priority}`),
      unit: t(`units.${entry.unit}`),
    },
    tmrg: {
      value: entry.value,
      unit: entry.unit,
      days: tmrgDays,
      dueDate: toIsoDate(dueDate),
    },
    waiting: {
      daysWaited,
      daysRemaining,
      percentElapsed: Math.round(percentElapsed * 1000) / 1000,
      transferThreshold: threshold,
    },
    status,
    statusLabel: t(`status.${status}`),
    entitlements,
    legal: SOURCE,
    disclaimer: t('disclaimer'),
  };
}

module.exports = { assessRights, STATUS };
