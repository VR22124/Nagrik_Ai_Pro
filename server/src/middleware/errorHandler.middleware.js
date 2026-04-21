export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const retryAfter = err?.details?.retryAfterSec;
  if (status === 429 && Number.isFinite(retryAfter)) {
    res.set("Retry-After", String(retryAfter));
  }
  res.status(status).json({
    error: {
      message: err.message || "Internal server error",
      details: err.details || null
    }
  });
}
