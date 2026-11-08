/**
 * Configuração validada no arranque.
 *
 * REGRAS
 *  1. Nenhuma chave de API vive no código. Nunca. Só em `.env` (que está no
 *     .gitignore) ou nas variáveis de ambiente da plataforma de alojamento.
 *  2. O núcleo da aplicação não exige NENHUM segredo: mapas, geocodificação,
 *     pesquisa de unidades de saúde e roteamento usam serviços abertos sem
 *     chave. A aplicação arranca e funciona com um `.env` vazio.
 *  3. Só as funcionalidades opcionais (LLM) pedem chave — e se faltar, a
 *     funcionalidade desliga-se sozinha em vez de rebentar.
 */

// Carrega .env se o dotenv estiver instalado. Em Node >= 20 podes dispensá-lo
// por completo e arrancar com:  node --env-file=.env src/server.js
try {
  require('dotenv').config();
} catch {
  /* dotenv é opcional: as variáveis podem vir do ambiente da plataforma. */
}

function optional(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const NODE_ENV = optional('NODE_ENV', 'development');
const APP_VERSION = optional('APP_VERSION', '2.0.0');

const config = {
  nodeEnv: NODE_ENV,
  isProd: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',
  port: toInt(optional('PORT', '5000'), 5000),
  version: APP_VERSION,

  /**
   * Identificação enviada em cada pedido aos serviços comunitários do
   * OpenStreetMap. A política do Nominatim exige um User-Agent que permita
   * contactar o responsável. Põe aqui um e-mail real antes de ir para produção.
   */
  userAgent: optional(
    'HTTP_USER_AGENT',
    `RunToHealth/${APP_VERSION} (+https://runtohealth.com; contacto@runtohealth.com)`
  ),

  /* ── Serviços geográficos abertos (sem chave, sem faturação) ───────────
   * Todos são software livre e auto-hospedáveis. Para escalar, instala uma
   * instância própria e muda apenas estas variáveis.
   */
  nominatimBase: optional('NOMINATIM_BASE', 'https://nominatim.openstreetmap.org'),
  // Lista separada por vírgulas, por ordem de preferência. O Overpass público
  // é comunitário e satura com frequência: se uma instância não responde a
  // tempo, tenta-se a seguinte em vez de falhar logo.
  overpassBases: optional('OVERPASS_BASE', 'https://overpass-api.de/api/interpreter,https://overpass.private.coffee/api/interpreter,https://overpass.kumi.systems/api/interpreter')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  // Tempo por tentativa (s). Curto de propósito: é melhor passar depressa à
  // instância seguinte do que esperar 35 s por uma que está sobrecarregada.
  overpassTimeout: toInt(optional('OVERPASS_TIMEOUT', '12'), 12),
  // Tempo máximo TOTAL no Overpass antes de passar ao Nominatim (ms).
  overpassBudgetMs: toInt(optional('OVERPASS_BUDGET_MS', '15000'), 15000),
  // O servidor de demonstração do OSRM não tem SLA: serve para desenvolver,
  // não para produção com volume.
  osrmBase: optional('OSRM_BASE', 'https://router.project-osrm.org'),

  /* ── CORS ─────────────────────────────────────────────────────────────── */
  // 5173 = vite dev, 4173 = vite preview, 3000 = alternativa comum.
  // Faltar o 4173 faz `npm run preview` falhar em CORS sem explicação óbvia.
  corsOrigins: toList(
    optional(
      'CORS_ORIGINS',
      'http://localhost:5173,http://localhost:4173,http://localhost:3000,' +
        'http://127.0.0.1:5173,http://127.0.0.1:4173'
    )
  ),

  /* ── Cache e limitação de ritmo ───────────────────────────────────────── */
  cacheTtlSeconds: toInt(optional('CACHE_TTL_SECONDS', '86400'), 86400),
  rateLimitWindowMs: toInt(optional('RATE_LIMIT_WINDOW_MS', '60000'), 60000),
  rateLimitMax: toInt(optional('RATE_LIMIT_MAX', '60'), 60),

  /* ── LLM (opcional) ───────────────────────────────────────────────────────
   * Qualquer serviço compatível com a API da OpenAI serve, o que inclui
   * opções gratuitas:
   *   - Ollama local  → LLM_BASE_URL=http://localhost:11434/v1  (sem chave)
   *   - Groq          → camada gratuita generosa
   *   - OpenRouter    → tem modelos gratuitos
   * Sem LLM_API_KEY (e sem base local), a funcionalidade desativa-se.
   */
  llm: {
    baseUrl: optional('LLM_BASE_URL', ''),
    apiKey: optional('LLM_API_KEY', ''),
    model: optional('LLM_MODEL', ''),
    timeoutMs: toInt(optional('LLM_TIMEOUT_MS', '20000'), 20000),
    maxOutputTokens: toInt(optional('LLM_MAX_OUTPUT_TOKENS', '700'), 700),
  },

  /* ── Dados abertos do SNS ────────────────────────────────────────────────
   * O Portal da Transparência do SNS expõe uma API pública (OpenDataSoft).
   * ⚠️  Confirma o dataset_id exato em https://transparencia.sns.gov.pt/explore/
   *     e define-o aqui. Não inventes o identificador.
   */
  sns: {
    openDataBase: optional(
      'SNS_OPENDATA_BASE',
      'https://transparencia.sns.gov.pt/api/explore/v2.1/catalog/datasets'
    ),
    waitingTimesDataset: optional('SNS_WAITING_TIMES_DATASET', ''),
  },
};

/** Avisos no arranque — informativos, nunca fatais para o núcleo. */
function describeStartup() {
  const warnings = [];
  if (config.isProd && config.corsOrigins.includes('*')) {
    warnings.push('CORS_ORIGINS contém "*" em produção. Restringe aos teus domínios.');
  }
  if (config.isProd && /contacto@runtohealth\.com/.test(config.userAgent)) {
    warnings.push(
      'HTTP_USER_AGENT ainda tem o contacto de exemplo. A política do Nominatim ' +
        'exige um contacto real — sem ele podes ser bloqueado.'
    );
  }
  if (config.isProd && /router\.project-osrm\.org/.test(config.osrmBase)) {
    warnings.push(
      'OSRM_BASE aponta para o servidor de demonstração, que não tem SLA. ' +
        'Para produção, aloja a tua instância OSRM.'
    );
  }
  if (!config.llm.baseUrl) {
    warnings.push('LLM não configurado: o endpoint de orientação fica desativado.');
  }
  if (!config.sns.waitingTimesDataset) {
    warnings.push(
      'SNS_WAITING_TIMES_DATASET vazio: /api/waiting-times responde em modo degradado.'
    );
  }
  return warnings;
}

module.exports = config;
module.exports.describeStartup = describeStartup;
