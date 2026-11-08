const { createApp } = require('./app');
const config = require('./config/env');
const { describeStartup } = require('./config/env');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Run To Health API v${config.version} — porta ${config.port} (${config.nodeEnv})`);
  for (const w of describeStartup()) console.warn(`  aviso: ${w}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recebido. A encerrar...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
