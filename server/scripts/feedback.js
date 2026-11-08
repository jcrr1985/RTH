#!/usr/bin/env node
/** Mostra os comentários recebidos (data/feedback.jsonl), do mais recente. */
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'data', 'feedback.jsonl');
if (!fs.existsSync(file)) {
  console.log('Ainda não há comentários.');
  process.exit(0);
}
const rows = fs
  .readFileSync(file, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))
  .reverse();

console.log(`${rows.length} comentário(s)\n`);
for (const r of rows) {
  console.log(`${r.at}  ${r.page || ''}${r.email ? `  <${r.email}>` : ''}`);
  console.log(`  ${r.message.replace(/\n/g, '\n  ')}\n`);
}
