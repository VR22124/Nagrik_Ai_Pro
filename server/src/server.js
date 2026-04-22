import { createApp } from "./app.js";
import { env } from "./config/env.js";

// Fail fast in production if critical environment variables are missing
if (env.NODE_ENV === "production" && !env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in production environment!");
  process.exit(1);
}

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
