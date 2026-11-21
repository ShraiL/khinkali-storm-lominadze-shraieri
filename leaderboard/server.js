import express from 'express';
import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function createApp(dataDirectory = '/data') {
  mkdirSync(dataDirectory, { recursive: true });
  const file = join(dataDirectory, 'scores.json');
  if (!existsSync(file)) writeFileSync(file, '[]\n');
  const scores = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(scores)) throw new Error('scores.json must contain an array');

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '4kb' }));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/scores', (_request, response) => {
    response.json([...scores].sort((a, b) => b.score - a.score).slice(0, 10));
  });
  app.post('/api/scores', (request, response, next) => {
    const { name, score } = request.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 24 ||
        !Number.isSafeInteger(score) || score < 0) {
      return response.status(400).json({ error: 'Use a name (1–24 characters) and a nonnegative integer score.' });
    }
    const entry = { name: name.trim(), score };
    try {
      // Synchronous writes serialize this tiny single-process service. Rename
      // replaces the complete file, so a partial write cannot corrupt scores.json.
      writeFileSync(file + '.tmp', JSON.stringify([...scores, entry], null, 2) + '\n');
      renameSync(file + '.tmp', file);
      scores.push(entry);
      response.status(201).json(entry);
    } catch (error) { next(error); }
  });
  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'Invalid JSON.' });
    }
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Request too large.' });
    }
    console.error(error.message);
    response.status(500).json({ error: 'Could not save the score.' });
  });
  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createApp(process.env.DATA_DIR || '/data').listen(3000, '0.0.0.0', () => {
    console.log('Leaderboard listening on 0.0.0.0:3000');
  });
}
