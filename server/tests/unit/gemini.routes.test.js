import test from "node:test";
import assert from "node:assert/strict";
import geminiRoutes from "../../src/routes/gemini.routes.js";

function findRouteHandler(path, index = 0) {
  const route = geminiRoutes.stack.find((entry) => entry.route?.path === path);
  return route?.route?.stack?.[index]?.handle;
}

function createResponseCapture() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test("gemini explain returns null text when upstream fails", async () => {
  process.env.GEMINI_API_KEY = "test-key";
  const explainHandler = findRouteHandler("/explain", 1);
  assert.ok(explainHandler, "expected explain route handler");

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({ error: { message: "unavailable" } })
  });

  const res = createResponseCapture();
  await explainHandler(
    {
      body: {
        response: { requiredActions: ["Start registration using Form 6"] },
        userContext: { age: 22, state: "Tamil Nadu", registrationStatus: "not_registered" }
      }
    },
    res
  );

  global.fetch = originalFetch;

  assert.equal(res.statusCode, 200);
  assert.equal(res.body?.text, null);
});
