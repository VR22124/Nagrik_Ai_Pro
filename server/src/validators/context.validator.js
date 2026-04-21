import { SCENARIOS } from "../data/scenarios.config.js";

const REG_STATUSES = ["registered", "not_registered", "unsure"];
const SCENARIO_VALUES = Object.values(SCENARIOS);

export function validateContextPayload(payload = {}) {
  const errors = [];
  const { age, state, registrationStatus, scenario, hasAddressProof, migrationType, voterAreaType } =
    payload;

  if (!Number.isFinite(age) || age <= 0) {
    errors.push("age must be a valid positive number");
  }
  if (!state || typeof state !== "string") {
    errors.push("state is required");
  }
  if (!REG_STATUSES.includes(registrationStatus)) {
    errors.push("registrationStatus must be one of: registered, not_registered, unsure");
  }
  if (!SCENARIO_VALUES.includes(scenario)) {
    errors.push(`scenario must be one of: ${SCENARIO_VALUES.join(", ")}`);
  }
  if (hasAddressProof !== undefined && typeof hasAddressProof !== "boolean") {
    errors.push("hasAddressProof must be a boolean if provided");
  }
  if (
    migrationType !== undefined &&
    !["intra_state", "inter_state", "unspecified"].includes(migrationType)
  ) {
    errors.push("migrationType must be one of: intra_state, inter_state, unspecified");
  }
  if (voterAreaType !== undefined && !["rural", "urban", "unspecified"].includes(voterAreaType)) {
    errors.push("voterAreaType must be one of: rural, urban, unspecified");
  }
  return errors;
}
