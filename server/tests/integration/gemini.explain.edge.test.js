import test from "node:test";
import assert from "node:assert";

test("/api/gemini/explain returns 400 for missing response field", async (t) => {
  const { default: request } = await import("supertest");
  const { createApp } = await import("../../src/app.js");
  const app = createApp();
  const res = await request(app).post("/api/gemini/explain").send({});
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test("/api/gemini/chat recovers cleanly on LLM provider failure", async (t) => {
  const { default: request } = await import("supertest");
  const { createApp } = await import("../../src/app.js");
  
  // Inject mock to force LLM failure
  process.env.GEMINI_API_KEY = "invalid_key_for_test";
  
  const app = createApp();
  const res = await request(app).post("/api/gemini/chat").send({ message: "Hello" });
  
  // App should catch API failures and fallback to 500 cleanly with generic message
  assert.strictEqual(res.status, 500);
  assert.match(res.body.error || res.body.message, /failed/i);
});
