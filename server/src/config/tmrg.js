/**
 * TMRG — Tempos Máximos de Resposta Garantidos (SNS, Portugal)
 *
 * ⚠️  ESTES VALORES SÃO DADOS LEGAIS. NÃO OS ALTERE SEM FONTE OFICIAL.
 *
 * Base legal:
 *   - Lei n.º 15/2014, de 21 de março (direitos e deveres do utente)
 *   - Portaria n.º 153/2017, de 4 de maio
 *   - Portaria n.º 135/2026/1, de 31 de março (altera a anterior; adapta ao SINACC)
 *
 * Fonte dos valores: página oficial da Entidade Reguladora da Saúde (ERS)
 *   https://www.ers.pt/pt/utentes/perguntas-frequentes/faq/tempos-maximos-de-resposta-garantidos-tmrg/
 *
 * VERIFICADO EM: 2026-11-01
 *
 * A Portaria n.º 135/2026/1 entrou em vigor em abril de 2026 e reduziu os níveis
 * de prioridade em várias áreas. Reverifique esta tabela contra o Diário da
 * República antes de qualquer release, e atualize `verifiedOn`.
 *
 * `unit`: "calendar" = dias seguidos (de calendário) | "business" = dias úteis
 *         | "hours" = horas
 */

const SOURCE = {
  legalBasis: [
    'Lei n.º 15/2014, de 21 de março',
    'Portaria n.º 153/2017, de 4 de maio',
    'Portaria n.º 135/2026/1, de 31 de março',
  ],
  sourceUrl:
    'https://www.ers.pt/pt/utentes/perguntas-frequentes/faq/tempos-maximos-de-resposta-garantidos-tmrg/',
  verifiedOn: '2026-11-01',
};

/**
 * careType → condition → priority → { value, unit }
 */
const TMRG_TABLE = {
  // ───────────────────────── Cuidados de Saúde Primários ─────────────────────
  csp: {
    geral: {
      doenca_aguda: { value: 24, unit: 'hours' },
      sem_doenca_aguda: { value: 15, unit: 'business' },
      // Pedido originado noutra unidade / serviço hospitalar / Centro de Contacto SNS
      sem_doenca_aguda_referenciado: { value: 30, unit: 'business' },
      renovacao_medicacao_cronica: { value: 72, unit: 'hours' },
      relatorios_referenciacao: { value: 72, unit: 'hours' },
      consulta_domicilio: { value: 24, unit: 'hours' },
    },
  },

  // ─────────────────── Primeira consulta de especialidade hospitalar ─────────
  primeira_consulta: {
    // Referenciada pelos CSP (exceto Oncologia e Cardiologia)
    geral: {
      muito_prioritaria: { value: 30, unit: 'calendar' },
      prioritaria: { value: 60, unit: 'calendar' },
      normal: { value: 120, unit: 'calendar' },
    },
    // Doença oncológica suspeita ou confirmada
    oncologica: {
      muito_prioritaria: { value: 7, unit: 'calendar' },
      prioritaria: { value: 30, unit: 'calendar' },
    },
    // Doença cardíaca suspeita ou confirmada
    cardiaca: {
      muito_prioritaria: { value: 15, unit: 'calendar' },
      prioritaria: { value: 30, unit: 'calendar' },
    },
  },

  // ──────────── Procedimentos cirúrgicos / terapêuticos programados ──────────
  cirurgia: {
    geral: {
      prioritaria: { value: 30, unit: 'calendar' },
      normal: { value: 180, unit: 'calendar' },
    },
    oncologica: {
      prioritaria: { value: 30, unit: 'calendar' },
      normal: { value: 60, unit: 'calendar' },
    },
    cardiaca: {
      prioritaria: { value: 30, unit: 'calendar' },
      normal: { value: 90, unit: 'calendar' },
    },
  },

  // ──────────── Meios Complementares de Diagnóstico e Terapêutica ────────────
  mcdt: {
    geral: {
      cateterismo_cardiaco: { value: 30, unit: 'calendar' },
      pacemaker_cardiaco: { value: 30, unit: 'calendar' },
      endoscopia_gastrenterologica: { value: 90, unit: 'calendar' },
      medicina_nuclear: { value: 30, unit: 'calendar' },
      tac: { value: 90, unit: 'calendar' },
      ressonancia_magnetica: { value: 90, unit: 'calendar' },
      angiografia_diagnostica: { value: 30, unit: 'calendar' },
      radioterapia: { value: 15, unit: 'calendar' },
    },
  },
};

/**
 * Limiares de emissão de Nota de Transferência / Vale Cirurgia.
 *
 * O Manual de Gestão de Inscritos para Cirurgia determina que os episódios são
 * transferidos decorridos 75% do TMRG (prioridade "normal") e 50% do TMRG
 * (prioridade "prioritária"). Um segundo vale é emitido automaticamente aos
 * 100% do TMRG; um terceiro pode ser pedido pelo utente ou pela instituição.
 *
 * Fontes: ACSS (https://www.acss.min-saude.pt/2022/12/22/vale-cirurgia/),
 *         SNS 24 (https://www.sns24.gov.pt/servico/notas-de-transferencia-e-vale-cirurgia/),
 *         gov.pt (https://www.gov.pt/servicos/receber-vale-cirurgia-e-nota-de-transferencia)
 */
const TRANSFER_THRESHOLDS = {
  normal: 0.75,
  prioritaria: 0.5,
  muito_prioritaria: 0.5,
};

/** Rótulos legíveis (pt-PT) para apresentação ao utente. */
const LABELS = {
  careType: {
    csp: 'Cuidados de saúde primários',
    primeira_consulta: 'Primeira consulta de especialidade hospitalar',
    cirurgia: 'Cirurgia / procedimento programado',
    mcdt: 'Exame (meio complementar de diagnóstico e terapêutica)',
  },
  condition: {
    geral: 'Doença não oncológica / não cardíaca',
    oncologica: 'Doença oncológica',
    cardiaca: 'Doença cardíaca',
  },
  priority: {
    muito_prioritaria: 'Muito prioritária',
    prioritaria: 'Prioritária',
    normal: 'Normal',
  },
};

/** Devolve a entrada da tabela, ou null se a combinação não existir na lei. */
function lookupTmrg(careType, condition, priority) {
  const byCare = TMRG_TABLE[careType];
  if (!byCare) return null;
  const byCondition = byCare[condition];
  if (!byCondition) return null;
  return byCondition[priority] || null;
}

/** Combinações válidas, para alimentar formulários no cliente. */
function listOptions() {
  return Object.entries(TMRG_TABLE).map(([careType, conditions]) => ({
    careType,
    label: LABELS.careType[careType] || careType,
    conditions: Object.entries(conditions).map(([condition, priorities]) => ({
      condition,
      label: LABELS.condition[condition] || condition,
      priorities: Object.keys(priorities).map((priority) => ({
        priority,
        label: LABELS.priority[priority] || priority,
        ...priorities[priority],
      })),
    })),
  }));
}

module.exports = {
  SOURCE,
  TMRG_TABLE,
  TRANSFER_THRESHOLDS,
  LABELS,
  lookupTmrg,
  listOptions,
};
