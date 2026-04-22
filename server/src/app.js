import express from "express";
import cors from "cors";
import helmet from "helmet";
import guidanceRoutes from "./routes/guidance.routes.js";
import eligibilityRoutes from "./routes/eligibility.routes.js";
import scenariosRoutes from "./routes/scenarios.routes.js";
import healthRoutes from "./routes/health.routes.js";
import geminiRoutes from "./routes/gemini.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { createRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(env.CORS_ORIGINS);
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
  allowedOrigins.add("https://nagrik-ai-pro.onrender.com");
  allowedOrigins.add("https://nagrik-ai-pro.web.app");
  allowedOrigins.add("https://nagrik-ai-pro.firebaseapp.com");
  
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        return callback(null, allowedOrigins.has(origin));
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json({ limit: "80kb" }));
  app.use(
    createRateLimiter({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS
    })
  );
  app.use(requestLogger);

  app.use("/api/health", healthRoutes);
  app.use("/api/gemini", geminiRoutes);
  app.use("/api/guidance", guidanceRoutes);
  app.use("/api/eligibility", eligibilityRoutes);
  app.use("/api/scenarios", scenariosRoutes);
  app.use("/api/logs", logsRoutes);

  app.use(errorHandler);
  return app;
}
