/**
 * Orientação de encaminhamento (substitui o antigo endpoint de "diagnóstico").
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PORQUE É QUE O "QUICK DIAGNOSIS" FOI REMOVIDO                           │
 * │                                                                         │
 * │ O código anterior pedia a um LLM "provide multiple possible diagnoses"  │
 * │ e mostrava o resultado ao utente com o título "Diagnosis".              │
 * │                                                                         │
 * │ Isso é um problema a três níveis:                                       │
 * │                                                                         │
 * │ 1. REGULATÓRIO. Software com finalidade de diagnóstico é um dispositivo │
 * │    médico ao abrigo do Regulamento (UE) 2017/745 (MDR) — tipicamente    │
 * │    classe IIa pela regra 11 — e exige avaliação de conformidade,        │
 * │    marcação CE e organismo notificado. O Regulamento de IA da UE        │
 * │    classifica ainda a IA usada como dispositivo médico como de alto     │
 * │    risco. Publicar isto sem conformidade é ilegal, não apenas arriscado.│
 * │ 2. CLÍNICO. Uma lista de diagnósticos possíveis gerada por um LLM, sem  │
 * │    exame nem história clínica, tanto tranquiliza quem devia ir às       │
 * │    urgências como alarma quem não precisa.                              │
 * │ 3. TÉCNICO. A implementação estava avariada: usava `cohere.generate()`  │
 * │    com o SDK v7, onde essa função já não existe.                        │
 * │                                                                         │
 * │ O QUE FAZEMOS EM VEZ DISSO                                              │
 * │ Encaminhamento, não diagnóstico: que NÍVEL de cuidados procurar, que    │
 * │ ESPECIALIDADE costuma tratar aquele tipo de queixa, que sinais de       │
 * │ alarme obrigam a contacto imediato, e que DIREITOS de acesso existem.   │
 * │ Isto é informação de navegação no sistema de saúde — não é um ato       │
 * │ médico.                                                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Fornecedor de LLM: qualquer serviço compatível com a API da OpenAI, escolhido
 * por variáveis de ambiente. Inclui opções sem custo (Ollama local, camadas
 * gratuitas da Groq ou do OpenRouter). Sem configuração, o endpoint desliga-se
 * e o motor determinístico de sinais de alarme continua a funcionar.
 */

const config = require('../config/env');

const MAX_INPUT_CHARS = 1000;

/* ───────────────────── sinais de alarme (determinístico) ─────────────────
 * Esta parte NÃO depende de LLM. É uma lista de padrões que, em caso de
 * correspondência, encaminham imediatamente para o 112 ou SNS 24, antes de
 * qualquer chamada a um modelo. Um LLM pode falhar ou estar indisponível;
 * isto não.
 */
const RED_FLAGS = [
  {
    id: 'dor_toracica',
    patterns: [
      /dor\s+no\s+peito/i, /dor\s+tor[áa]cica/i, /aperto\s+no\s+peito/i,
      /dolor\s+en\s+el\s+pecho/i, /chest\s+pain/i,
    ],
    action: 'emergencia',
    message:
      'Dor no peito pode indicar uma emergência cardíaca. Ligue 112 imediatamente.',
  },
  {
    id: 'avc',
    patterns: [
      // Assimetria facial
      // Nota: \w nao cobre acentos em JS, por isso usamos [^\s] para as
      // palavras intermedias ("a boca ESTA ao lado").
      /boca\s+([^\s]+\s+){0,2}(ao\s+lado|tort[oa]|ca[íi]d[oa]|descaid[oa])/i,
      /(cara|rosto|face)\s+([^\s]+\s+){0,2}(ca[íi]d[oa]|tort[oa]|ao\s+lado)/i,
      /metade\s+d[oa]\s+(corpo|cara|rosto|face)/i,
      // Perda de força: cobrir "perda de força", "perdi a força",
      // "perdeu a força", "sem força", "fraqueza" e o membro afetado.
      /perd[aeiu]\w*\s+(a\s+|de\s+)?for[çc]a/i,
      /sem\s+for[çc]a\s+(n[oa]|num|numa|do|da)/i,
      /(bra[çc]o|perna|m[ãa]o|p[ée]|lado)\s+(direit|esquerd)\w*\s+(sem|fraco|dormente|adormecid)/i,
      /fraqueza\s+(s[úu]bita|repentina|num|numa|no|na)/i,
      /formigueiro\s+(s[úu]bit|repentin)\w*/i,
      // Fala
      /n[ãa]o\s+consigo\s+falar/i, /fala\s+(arrastada|enrolada|trocada)/i,
      /dificuldade\s+(a|em)\s+falar/i, /n[ãa]o\s+consegue\s+falar/i,
      // Genéricos
      /paralis/i, /\bavc\b/i, /derrame\s+cerebral/i, /stroke/i,
      /trombose\s+cerebral/i,
    ],
    action: 'emergencia',
    message:
      'Perda súbita de força, desvio da boca ou alteração da fala podem indicar ' +
      'um AVC. Cada minuto conta: ligue 112 imediatamente.',
  },
  {
    id: 'dificuldade_respiratoria',
    patterns: [
      /n[ãa]o\s+consigo\s+respirar/i, /falta\s+de\s+ar\s+(grave|s[úu]bita|intensa)/i,
      /dificuldade\s+(grave\s+)?(a|em)\s+respirar/i, /asfixi/i,
      /can'?t\s+breathe/i,
    ],
    action: 'emergencia',
    message: 'Dificuldade respiratória grave é uma emergência. Ligue 112.',
  },
  {
    id: 'hemorragia',
    patterns: [
      /hemorragia/i, /sangr[ao]\s+muito/i, /n[ãa]o\s+para\s+de\s+sangrar/i,
      /vomit[oa]\s+sangue/i, /sangue\s+nas\s+f[ée]zes/i,
    ],
    action: 'emergencia',
    message: 'Hemorragia que não para requer avaliação urgente. Ligue 112.',
  },
  {
    id: 'alteracao_consciencia',
    patterns: [
      /perd[ia]\s+de\s+consci[êe]ncia/i, /desmai/i, /convuls/i,
      /n[ãa]o\s+responde/i, /confus[ãa]o\s+s[úu]bita/i,
    ],
    action: 'emergencia',
    message:
      'Perda de consciência, convulsões ou confusão súbita exigem avaliação ' +
      'imediata. Ligue 112.',
  },
  {
    id: 'febre_lactente',
    patterns: [
      /beb[êé].{0,30}febre/i, /rec[ée]m[- ]nascid.{0,30}febre/i,
      /febre.{0,30}(beb[êé]|rec[ée]m[- ]nascid)/i,
    ],
    action: 'urgente',
    message:
      'Febre num bebé com menos de 3 meses deve ser avaliada no mesmo dia. ' +
      'Contacte o SNS 24 (808 24 24 24) ou dirija-se a um serviço de urgência pediátrica.',
  },
  {
    id: 'ideacao_suicida',
    patterns: [
      /quero\s+morrer/i, /acabar\s+com\s+a\s+minha\s+vida/i, /suic[íi]d/i,
      /n[ãa]o\s+quero\s+(mais\s+)?viver/i, /fazer\s+mal\s+a\s+mim/i,
      /autol[ée]s/i,
    ],
    action: 'apoio_imediato',
    message:
      'Se está a pensar em ferir-se, por favor fale com alguém agora. ' +
      'SNS 24: 808 24 24 24 (opção de saúde mental). Em perigo imediato: 112. ' +
      'Não está sozinho e há ajuda disponível.',
  },
];

function detectRedFlags(text) {
  const found = [];
  for (const flag of RED_FLAGS) {
    if (flag.patterns.some((re) => re.test(text))) {
      found.push({ id: flag.id, action: flag.action, message: flag.message });
    }
  }
  return found;
}

const EMERGENCY_CONTACTS = [
  { label: 'Emergência médica', value: '112', note: 'Risco de vida imediato' },
  {
    label: 'SNS 24',
    value: '808 24 24 24',
    note: 'Triagem e aconselhamento por enfermeiro, 24 h por dia',
  },
];

/* ─────────────────────────── cliente de LLM ──────────────────────────── */

function llmEnabled() {
  // Uma base local (Ollama) não precisa de chave; um serviço remoto precisa.
  if (!config.llm.baseUrl) return false;
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(
    config.llm.baseUrl
  );
  return isLocal || Boolean(config.llm.apiKey);
}

const SYSTEM_PROMPT = `És um assistente de NAVEGAÇÃO no sistema de saúde português. NÃO és médico e NÃO fazes diagnósticos.

REGRAS ABSOLUTAS:
1. NUNCA nomeies uma doença, condição ou diagnóstico provável. Nem como hipótese, nem com ressalvas, nem a pedido do utilizador.
2. NUNCA sugiras medicamentos, dosagens, suplementos ou tratamentos.
3. NUNCA estimes gravidade clínica nem digas a alguém que "provavelmente não é nada".
4. Se a descrição sugerir risco, encaminha para o 112 ou SNS 24 e não acrescentes mais nada.

O QUE FAZES:
- Indicas que NÍVEL de cuidados é o ponto de entrada adequado: médico de família / centro de saúde, SNS 24, consulta de especialidade por referenciação, ou serviço de urgência.
- Indicas que ESPECIALIDADE costuma acompanhar aquele tipo de queixa, em termos gerais.
- Dizes que informação vale a pena levar à consulta (há quanto tempo, o que agrava, medicação habitual, exames anteriores).
- Lembras que, em Portugal, a consulta de especialidade hospitalar exige referenciação pelo médico de família, e que existem Tempos Máximos de Resposta Garantidos.

FORMATO: responde SEMPRE em JSON válido, sem texto fora do JSON, com esta forma exata:
{
  "entryPoint": "medico_familia" | "sns24" | "urgencia" | "especialidade_referenciada",
  "entryPointReason": "uma frase, sem termos de diagnóstico",
  "likelySpecialities": ["nome da especialidade em português"],
  "whatToBring": ["item", "item"],
  "questionsToAsk": ["pergunta a fazer ao médico"],
  "accessNote": "nota sobre referenciação ou TMRG, se aplicável"
}

Escreve em português de Portugal. Sê breve e concreto.`;

async function callLlm(description, language) {
  const base = config.llm.baseUrl.replace(/\/+$/, '');
  const url = `${base}/chat/completions`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.llm.timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(config.llm.apiKey
          ? { Authorization: `Bearer ${config.llm.apiKey}` }
          : {}),
      },
      body: JSON.stringify({
        model: config.llm.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              `Idioma de resposta: ${language}\n` +
              `Descrição do utilizador: ${description}`,
          },
        ],
        temperature: 0.2,
        max_tokens: config.llm.maxOutputTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(
        `O serviço de orientação devolveu ${res.status}.` +
          (body ? ` ${body.slice(0, 200)}` : '')
      );
      err.statusCode = res.status === 429 ? 429 : 502;
      err.code = res.status === 429 ? 'LLM_RATE_LIMITED' : 'LLM_ERROR';
      throw err;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      const err = new Error('O serviço de orientação devolveu resposta vazia.');
      err.statusCode = 502;
      err.code = 'LLM_EMPTY';
      throw err;
    }

    try {
      return JSON.parse(raw);
    } catch {
      const err = new Error('O serviço de orientação devolveu JSON inválido.');
      err.statusCode = 502;
      err.code = 'LLM_BAD_JSON';
      throw err;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('Tempo de espera esgotado no serviço de orientação.');
      e.statusCode = 504;
      e.code = 'LLM_TIMEOUT';
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const ALLOWED_ENTRY_POINTS = new Set([
  'medico_familia',
  'sns24',
  'urgencia',
  'especialidade_referenciada',
]);

/** Valida e limpa a resposta do modelo. Nunca confiar na forma devolvida. */
function sanitizeLlmOutput(raw) {
  const asArray = (v, max) =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, max)
      : [];

  const entryPoint = ALLOWED_ENTRY_POINTS.has(raw?.entryPoint)
    ? raw.entryPoint
    : 'medico_familia';

  return {
    entryPoint,
    entryPointReason:
      typeof raw?.entryPointReason === 'string'
        ? raw.entryPointReason.slice(0, 300)
        : null,
    likelySpecialities: asArray(raw?.likelySpecialities, 4),
    whatToBring: asArray(raw?.whatToBring, 8),
    questionsToAsk: asArray(raw?.questionsToAsk, 6),
    accessNote:
      typeof raw?.accessNote === 'string' ? raw.accessNote.slice(0, 400) : null,
  };
}

const ENTRY_POINT_GUIDE = {
  medico_familia: {
    label: 'Médico de família / centro de saúde',
    detail:
      'É o ponto de entrada normal e a via para obter referenciação para ' +
      'consulta de especialidade hospitalar. TMRG: 15 dias úteis para ' +
      'situação não aguda; 24 horas em doença aguda.',
  },
  sns24: {
    label: 'SNS 24 — 808 24 24 24',
    detail:
      'Triagem telefónica por enfermeiro, 24 horas por dia. Indica se deve ' +
      'esperar, ir ao centro de saúde ou à urgência.',
  },
  urgencia: {
    label: 'Serviço de urgência',
    detail:
      'Se a situação não é de risco de vida imediato, ligue primeiro ao ' +
      'SNS 24: evita esperas longas e a triagem pode encaminhá-lo melhor.',
  },
  especialidade_referenciada: {
    label: 'Consulta de especialidade hospitalar (por referenciação)',
    detail:
      'Em Portugal exige referenciação pelo médico de família. Depois de o ' +
      'pedido estar registado, aplica-se um TMRG de 120 dias na prioridade ' +
      'normal (prazos mais curtos em oncologia e cardiologia).',
  },
};

/**
 * @param {object} params
 * @param {string} params.description descrição livre da situação
 * @param {string} [params.language='pt']
 */
async function getOrientation({ description, language = 'pt' }) {
  if (typeof description !== 'string' || !description.trim()) {
    const err = new Error('Descreva a situação para obter orientação.');
    err.statusCode = 400;
    err.code = 'NO_DESCRIPTION';
    throw err;
  }
  const text = description.trim().slice(0, MAX_INPUT_CHARS);

  // 1. Sinais de alarme primeiro, sempre, sem depender de LLM.
  const redFlags = detectRedFlags(text);
  const emergency = redFlags.find((f) => f.action === 'emergencia');
  const support = redFlags.find((f) => f.action === 'apoio_imediato');

  if (emergency || support) {
    return {
      kind: 'encaminhamento_imediato',
      redFlags,
      urgent: true,
      entryPoint: emergency ? 'urgencia' : 'sns24',
      entryPointLabel: emergency
        ? 'Emergência — 112'
        : 'SNS 24 — 808 24 24 24',
      message: (emergency || support).message,
      contacts: EMERGENCY_CONTACTS,
      llmUsed: false,
      disclaimer:
        'Esta aplicação não faz diagnósticos nem substitui avaliação médica. ' +
        'Em caso de dúvida sobre gravidade, ligue 112 ou SNS 24 (808 24 24 24).',
    };
  }

  // 2. Caso geral: orientação de encaminhamento.
  if (!llmEnabled()) {
    return {
      kind: 'encaminhamento_base',
      redFlags: [],
      urgent: false,
      entryPoint: 'medico_familia',
      entryPointLabel: ENTRY_POINT_GUIDE.medico_familia.label,
      entryPointDetail: ENTRY_POINT_GUIDE.medico_familia.detail,
      whatToBring: [
        'Há quanto tempo tem a queixa e como evoluiu',
        'O que agrava e o que alivia',
        'Medicação habitual, com doses',
        'Exames ou relatórios anteriores relacionados',
        'Antecedentes relevantes na família',
      ],
      questionsToAsk: [
        'Preciso de ser referenciado para uma especialidade?',
        'Qual é o TMRG aplicável ao meu caso e a partir de que data conta?',
        'Que sinais me devem levar a procurar ajuda antes da consulta?',
      ],
      contacts: EMERGENCY_CONTACTS,
      llmUsed: false,
      note:
        'Orientação genérica: o serviço de linguagem natural não está ' +
        'configurado nesta instalação.',
      disclaimer:
        'Esta aplicação não faz diagnósticos nem substitui avaliação médica.',
    };
  }

  const llmRaw = await callLlm(text, language);
  const clean = sanitizeLlmOutput(llmRaw);
  const guide = ENTRY_POINT_GUIDE[clean.entryPoint];

  return {
    kind: 'encaminhamento',
    redFlags,
    urgent: false,
    entryPoint: clean.entryPoint,
    entryPointLabel: guide.label,
    entryPointDetail: guide.detail,
    entryPointReason: clean.entryPointReason,
    likelySpecialities: clean.likelySpecialities,
    whatToBring: clean.whatToBring,
    questionsToAsk: clean.questionsToAsk,
    accessNote: clean.accessNote,
    contacts: EMERGENCY_CONTACTS,
    llmUsed: true,
    model: config.llm.model || null,
    disclaimer:
      'Esta aplicação NÃO faz diagnósticos nem recomenda tratamentos. Apresenta ' +
      'apenas informação sobre como navegar no sistema de saúde. Só um médico ' +
      'pode avaliar a sua situação. Em caso de agravamento, ligue SNS 24 ' +
      '(808 24 24 24); em emergência, 112.',
  };
}

module.exports = {
  getOrientation,
  llmEnabled,
  detectRedFlags,
  EMERGENCY_CONTACTS,
  _internals: { sanitizeLlmOutput, RED_FLAGS, SYSTEM_PROMPT },
};
