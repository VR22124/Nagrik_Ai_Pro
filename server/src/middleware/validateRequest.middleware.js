import { validateContextPayload } from "../validators/context.validator.js";
import { AppError } from "../utils/appError.js";

const REG_STATUSES = new Set(["registered", "not_registered", "unsure"]);
const MIGRATION_TYPES = new Set(["intra_state", "inter_state", "unspecified"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeText(value, maxLength = 500) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, " ") // Basic injection prevention (strips `<` and `>`)
    .trim()
    .slice(0, maxLength);
}

function validateUserContext(userContext = {}) {
  const errors = [];
  if (!isPlainObject(userContext)) {
    return ["userContext must be an object if provided"];
  }

  if (userContext.age !== undefined && (!Number.isFinite(Number(userContext.age)) || Number(userContext.age) <= 0)) {
    errors.push("userContext.age must be a valid positive number if provided");
  }
  if (userContext.state !== undefined && typeof userContext.state !== "string") {
    errors.push("userContext.state must be a string if provided");
  }
  if (userContext.registrationStatus !== undefined && !REG_STATUSES.has(userContext.registrationStatus)) {
    errors.push("userContext.registrationStatus must be one of: registered, not_registered, unsure");
  }
  if (userContext.scenario !== undefined && typeof userContext.scenario !== "string") {
    errors.push("userContext.scenario must be a string if provided");
  }
  if (userContext.nextBestAction !== undefined && typeof userContext.nextBestAction !== "string") {
    errors.push("userContext.nextBestAction must be a string if provided");
  }
  return errors;
}

export function validateGuidanceRequest(req, _res, next) {
  const errors = validateContextPayload(req.body);
  if (errors.length) return next(new AppError("Validation failed", 422, errors));
  return next();
}

export function validateEligibilityRequest(req, _res, next) {
  const age = Number(req.body?.age);
  if (!Number.isFinite(age) || age <= 0 || age > 130) {
    return next(new AppError("Validation failed", 422, ["age must be a valid positive number <= 130"]));
  }
  req.body.age = age;
  return next();
}

export function validateScenarioRequest(req, _res, next) {
  const errors = [];
  const payload = req.body || {};

  if (payload.registrationStatus !== undefined && !REG_STATUSES.has(payload.registrationStatus)) {
    errors.push("registrationStatus must be one of: registered, not_registered, unsure");
  }
  if (payload.migrationType !== undefined && !MIGRATION_TYPES.has(payload.migrationType)) {
    errors.push("migrationType must be one of: intra_state, inter_state, unspecified");
  }
  if (payload.intent !== undefined && typeof payload.intent !== "string") {
    errors.push("intent must be a string if provided");
  }

  if (errors.length) return next(new AppError("Validation failed", 422, errors));

  req.body = {
    registrationStatus: payload.registrationStatus ?? "unsure",
    intent: sanitizeText(payload.intent ?? "", 400),
    migrationType: payload.migrationType ?? "unspecified"
  };

  return next();
}

export function validateGeminiExplainRequest(req, _res, next) {
  const { response, userContext = {} } = req.body || {};
  const errors = [];

  if (!isPlainObject(response)) {
    errors.push("response must be an object");
  }
  errors.push(...validateUserContext(userContext));

  const responseSize = JSON.stringify(response || {}).length;
  if (responseSize > 25_000) {
    errors.push("response payload is too large");
  }

  if (errors.length) return next(new AppError("Validation failed", 422, errors));

  req.body.userContext = {
    age: userContext.age === undefined ? undefined : Number(userContext.age),
    state: userContext.state === undefined ? undefined : sanitizeText(userContext.state, 80),
    registrationStatus: userContext.registrationStatus,
    scenario: userContext.scenario === undefined ? undefined : sanitizeText(userContext.scenario, 100),
    nextBestAction:
      userContext.nextBestAction === undefined ? undefined : sanitizeText(userContext.nextBestAction, 240)
  };
  return next();
}

export function validateGeminiChatRequest(req, _res, next) {
  const { message, userContext = {}, guidance = {} } = req.body || {};
  const errors = [];

  if (typeof message !== "string" || !message.trim()) {
    errors.push("message is required and must be a non-empty string");
  }
  if (typeof message === "string" && message.length > 500) {
    errors.push("message must be at most 500 characters");
  }
  errors.push(...validateUserContext(userContext));
  if (guidance !== undefined && !isPlainObject(guidance)) {
    errors.push("guidance must be an object if provided");
  }
  if (JSON.stringify(guidance || {}).length > 25_000) {
    errors.push("guidance payload is too large");
  }

  if (errors.length) return next(new AppError("Validation failed", 422, errors));

  req.body.message = sanitizeText(message, 500);
  req.body.userContext = {
    age: userContext.age === undefined ? undefined : Number(userContext.age),
    state: userContext.state === undefined ? undefined : sanitizeText(userContext.state, 80),
    registrationStatus: userContext.registrationStatus,
    scenario: userContext.scenario === undefined ? undefined : sanitizeText(userContext.scenario, 100),
    nextBestAction:
      userContext.nextBestAction === undefined ? undefined : sanitizeText(userContext.nextBestAction, 240)
  };
  return next();
}

export function validateGeminiMapsExplainRequest(req, _res, next) {
  const payload = req.body || {};
  const errors = [];

  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 1000) {
    errors.push("request payload must be under 1000 characters");
  }

  if (!payload.state || typeof payload.state !== "string" || !payload.state.trim()) {
    errors.push("state is required and must be a non-empty string");
  }
  if (typeof payload.state === "string" && payload.state.length > 80) {
    errors.push("state must be at most 80 characters");
  }
  if (payload.intent !== undefined && typeof payload.intent !== "string") {
    errors.push("intent must be a string if provided");
  }
  if (typeof payload.intent === "string" && payload.intent.length > 300) {
    errors.push("intent must be at most 300 characters");
  }
  if (
    payload.registrationStatus !== undefined &&
    !REG_STATUSES.has(payload.registrationStatus)
  ) {
    errors.push("registrationStatus must be one of: registered, not_registered, unsure");
  }
  if (payload.nextBestAction !== undefined && typeof payload.nextBestAction !== "string") {
    errors.push("nextBestAction must be a string if provided");
  }
  if (typeof payload.nextBestAction === "string" && payload.nextBestAction.length > 240) {
    errors.push("nextBestAction must be at most 240 characters");
  }

  if (errors.length) return next(new AppError("Validation failed", 422, errors));

  req.body = {
    state: sanitizeText(payload.state, 80),
    intent: payload.intent === undefined ? undefined : sanitizeText(payload.intent, 300),
    registrationStatus: payload.registrationStatus || "unknown",
    nextBestAction:
      payload.nextBestAction === undefined ? undefined : sanitizeText(payload.nextBestAction, 240)
  };

  return next();
}

