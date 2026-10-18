import { ZodError } from 'zod';
import { AppError } from '../lib/http.js';

export const notFound = (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Format JSON tidak valid.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Data terlalu besar.' });
  console.error('[unhandled]', err);
  return res.status(500).json({ error: 'Terjadi kesalahan pada server. Coba lagi nanti.' });
}

export const validate = (schemas) => (req, res, next) => {
  try {
    req.valid = {};
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req.valid[key] = schemas[key].parse(req[key] ?? {});
    }
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return res.status(400).json({ error: e.issues[0]?.message || 'Input tidak valid.' });
    }
    next(e);
  }
};
