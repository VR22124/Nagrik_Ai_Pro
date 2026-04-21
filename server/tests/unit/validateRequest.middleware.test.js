import test from "node:test";
import assert from "node:assert/strict";
import {
  validateEligibilityRequest,
  validateGeminiChatRequest,
  validateGeminiExplainRequest,
  validateScenarioRequest
} from "../../src/middleware/validateRequest.middleware.js";

function createNextCapture() {
  let captured = null;
  return {
    next: (err) => {
      captured = err || null;
    },
    getError: () => captured
  };
}

test("eligibility validation rejects missing fields", () => {
  const req = { body: {} };
  const { next, getError } = createNextCapture();
  validateEligibilityRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("eligibility validation rejects invalid age", () => {
  const req = { body: { age: -1 } };
  const { next, getError } = createNextCapture();
  validateEligibilityRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("eligibility validation accepts edge upper bound age", () => {
  const req = { body: { age: 130 } };
  const { next, getError } = createNextCapture();
  validateEligibilityRequest(req, {}, next);
  assert.equal(getError(), null);
  assert.equal(req.body.age, 130);
});

test("scenario validation rejects bad registration status", () => {
  const req = { body: { registrationStatus: "invalid_status" } };
  const { next, getError } = createNextCapture();
  validateScenarioRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("scenario validation applies defaults and sanitizes intent", () => {
  const req = { body: { intent: "  moved to city\u0000\u0001 " } };
  const { next, getError } = createNextCapture();
  validateScenarioRequest(req, {}, next);
  assert.equal(getError(), null);
  assert.equal(req.body.registrationStatus, "unsure");
  assert.equal(req.body.migrationType, "unspecified");
  assert.equal(req.body.intent, "moved to city");
});

test("gemini explain validation rejects invalid response shape", () => {
  const req = { body: { response: "not-an-object" } };
  const { next, getError } = createNextCapture();
  validateGeminiExplainRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("gemini chat validation rejects oversized message", () => {
  const req = { body: { message: "a".repeat(501) } };
  const { next, getError } = createNextCapture();
  validateGeminiChatRequest(req, {}, next);
  assert.equal(getError()?.statusCode, 422);
});

test("scenario validation strips HTML injection tags (XSS check)", () => {
  const req = { body: { intent: "<script>alert(1)</script> hello" } };
  const { next, getError } = createNextCapture();
  validateScenarioRequest(req, {}, next);
  assert.equal(getError(), null);
  assert.equal(req.body.intent, "scriptalert(1)/script hello");
});
