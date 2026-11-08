/**
 * Função serverless do Vercel: a mesma API Express do servidor, servida em
 * /api no mesmo domínio que a aplicação web (sem CORS, sem URLs a configurar).
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createApp } = require('../server/src/app.js');

export default createApp();
