/**
 * Rotas da API.
 *
 * Mudança estrutural face à versão anterior: o servidor NUNCA aceita URLs do
 * cliente. O endpoint `/places?apiUrl=...` era um proxy aberto — qualquer
 * pessoa podia passar qualquer URL e o servidor buscava-a anexando a chave de
 * API. Aqui cada rota recebe parâmetros tipados e constrói ela própria o que
 * precisa.
 */

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { asyncHandler } = require('../middleware');

const geo = require('../services/geo.service');
const rights = require('../services/rights.service');
const vale = require('../services/valeCirurgia.service');
const orientation = require('../services/orientation.service');
const tmrg = require('../config/tmrg');
const i18n = require('../i18n');
const config = require('../config/env');

const router = express.Router();

/* ───────────────────────────── diagnóstico ──────────────────────────── */

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: config.version,
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      geo: true,
      rights: true,
      valeCirurgia: true,
      orientation: orientation.llmEnabled(),
      waitingTimes: Boolean(config.sns.waitingTimesDataset),
    },
    providers: {
      geocoding: config.nominatimBase,
      poi: config.overpassBases,
      routing: config.osrmBase,
      note: 'Serviços abertos, sem chave de API e sem faturação.',
    },
    languages: i18n.SUPPORTED,
    cache: geo.cacheStats(),
  });
});

/* ───────────────────────────── idiomas ──────────────────────────────── */

/**
 * GET /api/languages — idiomas disponíveis, para alimentar o seletor.
 *
 * A escolha vem do Relatório de Migrações e Asilo 2025 da AIMA: dos 1 585 854
 * estrangeiros residentes em Portugal, as maiores comunidades não lusófonas são
 * Índia (91 405), Ucrânia (84 889), Bangladeche (55 579) e Nepal (53 304).
 */
router.get('/languages', (req, res) => {
  res.json({
    languages: i18n.listLanguages(),
    default: i18n.DEFAULT_LANGUAGE,
    detected: i18n.fromAcceptLanguage(req.headers['accept-language']),
  });
});

/* ─────────────────────── pesquisa de unidades ──────────────────────── */

/**
 * GET /api/healthcare?speciality=cardiologia&city=Braga&country=Portugal
 * Substitui o antigo /places (Google Places Text Search).
 */
router.get(
  '/healthcare',
  asyncHandler(async (req, res) => {
    const { speciality, city, country, limit, language } = req.query;
    const result = await geo.searchHealthcare({
      speciality,
      city,
      country: country || 'Portugal',
      limit,
      language: language || 'pt',
    });
    res.json(result);
  })
);

/** GET /api/healthcare/nearby?lat=..&lng=..&radius=5000&speciality=.. */
router.get(
  '/healthcare/nearby',
  asyncHandler(async (req, res) => {
    const lat = Number.parseFloat(req.query.lat);
    const lng = Number.parseFloat(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const err = new Error('Indique lat e lng válidos.');
      err.statusCode = 400;
      err.code = 'BAD_COORDS';
      throw err;
    }
    const radius = Math.min(
      Math.max(Number.parseInt(req.query.radius, 10) || 5000, 500),
      30_000
    );
    // ~111 km por grau de latitude
    const delta = radius / 111_000;

    const result = await geo.searchHealthcare({
      bbox: {
        south: lat - delta,
        north: lat + delta,
        west: lng - delta / Math.max(0.1, Math.cos((lat * Math.PI) / 180)),
        east: lng + delta / Math.max(0.1, Math.cos((lat * Math.PI) / 180)),
      },
      speciality: req.query.speciality,
      limit: req.query.limit,
      language: req.query.language || 'pt',
    });

    // Enriquece com distância real a partir da posição do utente.
    if (result.places.length) {
      const matrix = await geo.travelMatrix({
        origin: { lat, lng },
        destinations: result.places.slice(0, 50).map((p) => ({ lat: p.lat, lng: p.lng })),
        mode: 'driving',
      });
      result.places.forEach((p, i) => {
        if (matrix[i]) p.travel = matrix[i];
      });
      result.places.sort(
        (a, b) =>
          (a.travel?.distanceMeters ?? Infinity) -
          (b.travel?.distanceMeters ?? Infinity)
      );
    }

    res.json({ ...result, origin: { lat, lng }, radius });
  })
);

/** GET /api/geocode?q=Hospital de Braga */
router.get(
  '/geocode',
  asyncHandler(async (req, res) => {
    const result = await geo.geocode(req.query.q, {
      countryCodes: req.query.countryCodes ?? 'pt',
      language: req.query.language || 'pt',
    });
    if (!result) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Morada não encontrada.' } });
    }
    return res.json(result);
  })
);

/** GET /api/reverse-geocode?lat=..&lng=.. */
router.get(
  '/reverse-geocode',
  asyncHandler(async (req, res) => {
    const result = await geo.reverseGeocode(req.query.lat, req.query.lng, {
      language: req.query.language || 'pt',
    });
    if (!result) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Localização não identificada.' } });
    }
    return res.json(result);
  })
);

/** POST /api/travel-matrix — { origin, destinations[], mode } */
router.post(
  '/travel-matrix',
  asyncHandler(async (req, res) => {
    const { origin, destinations, mode } = req.body || {};
    const result = await geo.travelMatrix({
      origin,
      destinations,
      mode: mode || 'driving',
    });
    res.json({ origin, mode: mode || 'driving', results: result });
  })
);

/** GET /api/specialities — especialidades com mapeamento OSM conhecido */
router.get('/specialities', (req, res) => {
  res.json({ specialities: geo.listSpecialities() });
});

/* ──────────────────────── motor de direitos ────────────────────────── */

/** GET /api/rights/options — combinações válidas, para alimentar o formulário */
router.get('/rights/options', (req, res) => {
  const lang = i18n.normalize(
    req.query.language || i18n.fromAcceptLanguage(req.headers['accept-language'])
  );
  const t = i18n.createTranslator(lang);

  // As opções vêm da tabela legal; só os rótulos mudam de idioma.
  const options = tmrg.listOptions().map((care) => ({
    ...care,
    label: t(`careType.${care.careType}`),
    conditions: care.conditions.map((cond) => ({
      ...cond,
      label: t(`condition.${cond.condition}`),
      priorities: cond.priorities.map((pr) => ({
        ...pr,
        label: t(`priority.${pr.priority}`),
        unitLabel: t(`units.${pr.unit}`),
      })),
    })),
  }));

  res.json({
    language: lang,
    options,
    transferThresholds: tmrg.TRANSFER_THRESHOLDS,
    legal: tmrg.SOURCE,
  });
});

/**
 * POST /api/rights/assess
 * { careType, condition, priority, requestDate, valesReceived? }
 *
 * O coração do produto: converte "estou à espera desde X" em
 * "estes são os direitos que já pode exercer, e como".
 */
router.post(
  '/rights/assess',
  asyncHandler(async (req, res) => {
    const {
      careType,
      condition,
      priority,
      requestDate,
      valesReceived,
      language,
    } = req.body || {};

    const result = rights.assessRights({
      careType,
      condition,
      priority,
      requestDate,
      valesReceived: Number.parseInt(valesReceived, 10) || 0,
      language: language || i18n.fromAcceptLanguage(req.headers['accept-language']),
    });
    res.json(result);
  })
);

/* ──────────────────── seletor de Vale Cirurgia ─────────────────────── */

/**
 * POST /api/vale-cirurgia/rank
 * { hospitalNames: string[], origin: {lat,lng}, language? }
 */
router.post(
  '/vale-cirurgia/rank',
  asyncHandler(async (req, res) => {
    const { hospitalNames, origin, language } = req.body || {};
    if (
      !origin ||
      !Number.isFinite(Number(origin.lat)) ||
      !Number.isFinite(Number(origin.lng))
    ) {
      const err = new Error('Indique a sua localização (origin.lat e origin.lng).');
      err.statusCode = 400;
      err.code = 'NO_ORIGIN';
      throw err;
    }

    const result = await vale.rankValeOptions({
      hospitalNames,
      origin: { lat: Number(origin.lat), lng: Number(origin.lng) },
      language: language || i18n.fromAcceptLanguage(req.headers['accept-language']),
    });
    res.json(result);
  })
);

/* ───────────────────── orientação (não diagnóstico) ────────────────── */

/**
 * POST /api/orientation — { description, language? }
 *
 * Substitui o antigo POST /api/getDiagnosis. Ver o comentário no topo de
 * orientation.service.js para a razão regulatória da mudança.
 */
router.post(
  '/orientation',
  asyncHandler(async (req, res) => {
    const { description, language } = req.body || {};
    const result = await orientation.getOrientation({
      description,
      language: language || 'pt',
    });
    res.json(result);
  })
);

/* ──────────────────────────── feedback ─────────────────────────────── */

/**
 * POST /api/feedback — { message, email?, page? }
 *
 * O cliente da v1 enviava feedback para um deployment diferente, num URL
 * escrito no código, e o endpoint não existia neste servidor. Fica aqui.
 *
 * Guarda em log estruturado. Para persistir, encaminha daqui para onde
 * quiseres (ficheiro, base de dados, webhook) — a interface não muda.
 */
const FEEDBACK_DIR = path.join(__dirname, '..', '..', 'data');
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback.jsonl');

router.post(
  '/feedback',
  asyncHandler(async (req, res) => {
    const { message, email, page } = req.body || {};

    if (typeof message !== 'string' || message.trim().length < 3) {
      const err = new Error('Escreva uma mensagem com pelo menos 3 caracteres.');
      err.statusCode = 400;
      err.code = 'EMPTY_MESSAGE';
      throw err;
    }
    if (message.length > 2000) {
      const err = new Error('A mensagem excede 2000 caracteres.');
      err.statusCode = 400;
      err.code = 'MESSAGE_TOO_LONG';
      throw err;
    }
    if (email != null && (typeof email !== 'string' || email.length > 200)) {
      const err = new Error('E-mail inválido.');
      err.statusCode = 400;
      err.code = 'BAD_EMAIL';
      throw err;
    }

    const entry = {
      at: new Date().toISOString(),
      page: typeof page === 'string' ? page.slice(0, 200) : null,
      email: email ? email.trim() : null,
      message: message.trim(),
    };

    // Persistir: uma linha JSON por comentário em data/feedback.jsonl (fora do
    // git). Ver com `npm run feedback`. Em alojamento sem disco gravável
    // (p. ex. Vercel) cai para o log, sem derrubar o pedido.
    try {
      fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
      fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n');
    } catch (err) {
      console.warn('[feedback] não foi possível gravar em ficheiro:', err.message);
    }
    console.log('[feedback]', entry.at, entry.page || '', '—', entry.message.slice(0, 80));

    res.status(201).json({ received: true });
  })
);

/** Rota antiga: responde 410 com indicação explícita do substituto. */
router.post('/getDiagnosis', (req, res) => {
  res.status(410).json({
    error: {
      code: 'ENDPOINT_REMOVED',
      message:
        'Este endpoint foi removido. Software com finalidade de diagnóstico é ' +
        'um dispositivo médico ao abrigo do Regulamento (UE) 2017/745 e exige ' +
        'avaliação de conformidade. Use POST /api/orientation, que fornece ' +
        'encaminhamento no sistema de saúde sem produzir diagnósticos.',
      replacement: '/api/orientation',
    },
  });
});

module.exports = router;
