export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Lempar error aman; detail asli dari database hanya masuk log server.
export function unwrap({ data, error, count }) {
  if (error) {
    console.error('[supabase]', error.code, error.message);
    if (error.code === '23505') throw new AppError(409, 'Data sudah ada.');
    if (error.code === '23503') throw new AppError(404, 'Data terkait tidak ditemukan.');
    throw new AppError(500, 'Terjadi kesalahan pada server. Coba lagi nanti.');
  }
  return { data, count };
}
