import "dotenv/config";

function parseOrigins(raw) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveNumber(raw, fallback) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parsePositiveNumber(process.env.PORT ?? 4000, 4000),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
  CORS_ORIGINS: parseOrigins(
    process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? "http://localhost:5173,http://127.0.0.1:5173"
  ),
  RATE_LIMIT_WINDOW_MS: parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000, 60_000),
  RATE_LIMIT_MAX_REQUESTS: parsePositiveNumber(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120, 120),
  /** Google Sheets Apps Script webhook URL for anonymous analytics logging. Optional. */
  SHEETS_WEBHOOK_URL: process.env.SHEETS_WEBHOOK_URL ?? ""
};
