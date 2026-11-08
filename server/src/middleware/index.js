/**
 * Middleware transversal: CORS restrito, limitação de ritmo, cabeçalhos de
 * segurança e tratamento de erros.
 *
 * O que mudou face à versão anterior:
 *   - `cors()` era aplicado DUAS vezes, a segunda com `origin: "*"`. Agora é
 *     uma lista branca explícita, lida de CORS_ORIGINS.
 *   - Não havia limitação de ritmo nenhuma. Como a aplicação chama serviços
 *     comunitários (Nominatim, Overpass), não limitar é abusar da
 *     infraestrutura de terceiros e arriscar bloqueio do nosso IP.
 *   - Os erros devolviam a mensagem interna ao cliente. Agora é devolvida uma
 *     mensagem segura, com o detalhe apenas no log do servidor.
 */

const config = require('../config/env');

/* ──────────────────────────────── CORS ──────────────────────────────── */

function cors(req, res, next) {
  const origin = req.headers.origin;
  const allowed = config.corsOrigins;

  if (origin && (allowed.includes(origin) || allowed.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', allowed.includes('*') ? '*' : origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  return next();
}

/* ─────────────────────── cabeçalhos de segurança ───────────────────── */

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  if (config.isProd) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  // É uma API JSON: não há razão para o browser executar nada daqui.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  );
  return next();
}

/* ─────────────────────── limitação de ritmo ────────────────────────── */

const buckets = new Map();

function clientKey(req) {
  // Atrás de um proxy (Vercel, Cloudflare) o IP real vem no cabeçalho.
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimit(req, res, next) {
  if (config.isTest) return next();

  const key = clientKey(req);
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + config.rateLimitWindowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  const remaining = Math.max(0, config.rateLimitMax - bucket.count);
  res.setHeader('X-RateLimit-Limit', String(config.rateLimitMax));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > config.rateLimitMax) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Demasiados pedidos. Tente novamente dentro de um minuto.',
      },
    });
  }

  // Limpeza preguiçosa, para o Map não crescer indefinidamente.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }

  return next();
}

/* ──────────────────────── tratamento de erros ──────────────────────── */

function notFound(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Rota não encontrada: ${req.method} ${req.path}` },
  });
}

// eslint-disable-next-line no-unused-vars -- o Express exige 4 argumentos
function errorHandler(err, req, res, _next) {
  const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  if (status >= 500) {
    console.error('[erro]', req.method, req.path, err.code || '', err.message, err.stack);
  } else {
    console.warn('[aviso]', req.method, req.path, err.code || '', err.message);
  }

  res.status(status).json({
    error: {
      code: err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      // Erros 5xx nunca expõem o detalhe interno ao cliente.
      message:
        status >= 500
          ? 'Ocorreu um erro no servidor. Tente novamente.'
          : err.message,
    },
  });
}

/** Embrulha handlers async para que as rejeições cheguem ao errorHandler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = {
  cors,
  securityHeaders,
  rateLimit,
  notFound,
  errorHandler,
  asyncHandler,
};
