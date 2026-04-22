import test from "node:test";
import assert from "node:assert/strict";
import { buildMapsExplainPrompt } from "../../src/services/mapsExplain.service.js";
import { validateGeminiMapsExplainRequest } from "../../src/middleware/validateRequest.middleware.js";

/* ---------- Prompt builder tests ---------- */

test("prompt includes state and location context", () => {
  const prompt = buildMapsExplainPrompt({
    state: "Tamil Nadu",
    intent: "Chennai college area",
    registrationStatus: "not_registered",
    nextBestAction: "Start registration"
  });
  assert.ok(prompt.includes("Tamil Nadu"));
  assert.ok(prompt.includes("Chennai college area"));
  assert.ok(prompt.includes("not_registered"));
  assert.ok(prompt.includes("Start registration"));
});

test("prompt uses state as fallback when intent is short", () => {
  const prompt = buildMapsExplainPrompt({
    state: "Karnataka",
    intent: "hi",
    registrationStatus: "registered"
  });
  assert.ok(prompt.includes("Location: Karnataka"));
});

test("prompt uses intent+state when intent is long enough", () => {
  const prompt = buildMapsExplainPrompt({
    state: "Karnataka",
    intent: "Bangalore MG Road",
    registrationStatus: "registered"
  });
  assert.ok(prompt.includes("Bangalore MG Road, Karnataka"));
});

test("prompt handles missing fields gracefully", () => {
  const prompt = buildMapsExplainPrompt({});
  // New format uses "User profile:" and "Location: India" — no longer "State: unknown"
  assert.ok(prompt.includes("Location: India"));
  assert.ok(prompt.includes("Check official portal"));
});

/* ---------- Validation middleware tests ---------- */

function createNextCapture() {
  let captured = null;
  return {
    next: (err) => {
      captured = err || null;
    },
    getError: () => captured
  };
}

test("maps-explain validation rejects missing state", () => {
  const req = { body: { intent: "some place" } };
  const { next, getError } = createNextCapture();
  validateGeminiMapsExplainRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("maps-explain validation accepts valid payload", () => {
  const req = {
    body: {
      state: "Tamil Nadu",
      intent: "Chennai",
      registrationStatus: "not_registered",
      nextBestAction: "Register on NVSP"
    }
  };
  const { next, getError } = createNextCapture();
  validateGeminiMapsExplainRequest(req, {}, next);
  assert.equal(getError(), null);
  assert.equal(req.body.state, "Tamil Nadu");
});

test("maps-explain validation rejects oversized payload", () => {
  const req = {
    body: {
      state: "Tamil Nadu",
      intent: "x".repeat(950)
    }
  };
  const { next, getError } = createNextCapture();
  validateGeminiMapsExplainRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("maps-explain validation sanitizes input text", () => {
  const req = {
    body: {
      state: "  Tamil Nadu\u0000\u0001 ",
      registrationStatus: "unsure"
    }
  };
  const { next, getError } = createNextCapture();
  validateGeminiMapsExplainRequest(req, {}, next);
  assert.equal(getError(), null);
  assert.equal(req.body.state, "Tamil Nadu");
});
