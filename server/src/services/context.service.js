export function normalizeContext(input) {
  return {
    age: Number(input.age),
    state: String(input.state || "").trim(),
    registrationStatus: input.registrationStatus,
    scenario: input.scenario,
    language: input.language || "en",
    simpleMode: Boolean(input.simpleMode),
    hasAddressProof: input.hasAddressProof !== false,
    movedRecently: Boolean(input.movedRecently),
    migrationType: input.migrationType || "unspecified",
    intent: String(input.intent || "").trim(),
    voterAreaType: input.voterAreaType || "unspecified"
  };
}
