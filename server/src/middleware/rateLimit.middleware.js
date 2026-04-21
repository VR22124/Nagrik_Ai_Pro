import { AppError } from "../utils/appError.js";

export function createRateLimiter({ windowMs = 60_000, maxRequests = 120 } = {}) {
  const bucket = new Map();

  return function rateLimit(req, _res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const current = bucket.get(key);

    if (!current || now >= current.resetAt) {
      bucket.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count <= maxRequests) {
      return next();
    }

    const retryAfterMs = Math.max(0, current.resetAt - now);
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return next(
      new AppError("Too many requests. Please try again shortly.", 429, {
        retryAfterSec
      })
    );
  };
}
