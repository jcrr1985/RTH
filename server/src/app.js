const express = require('express');

const config = require('./config/env');
const {
  cors,
  securityHeaders,
  rateLimit,
  notFound,
  errorHandler,
} = require('./middleware');
const routes = require('./routes');

function createApp() {
  const app = express();

  // Atrás de Vercel/Cloudflare, confiar no proxy para obter o IP real.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(securityHeaders);
  app.use(cors);
  // 100 kB é mais do que suficiente para esta API. O limite anterior de 15 MB
  // era um convite a pedidos abusivos.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(rateLimit);

  app.get('/', (req, res) => {
    res.json({
      name: 'Run To Health API',
      version: config.version,
      docs: '/api/health',
      endpoints: [
        'GET  /api/health',
        'GET  /api/languages',
        'GET  /api/healthcare?speciality=&city=&country=',
        'GET  /api/healthcare/nearby?lat=&lng=&radius=',
        'GET  /api/geocode?q=',
        'GET  /api/reverse-geocode?lat=&lng=',
        'POST /api/travel-matrix',
        'GET  /api/specialities',
        'GET  /api/rights/options',
        'POST /api/rights/assess',
        'POST /api/vale-cirurgia/rank',
        'POST /api/orientation',
      ],
    });
  });

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
