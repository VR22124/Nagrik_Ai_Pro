import { SCENARIOS } from "../data/scenarios.config.js";

export function recommendScenario(registrationStatus, intent = "", context = {}) {
  const text = intent.toLowerCase();
  const migrationType = context.migrationType || "unspecified";
  const moved = text.includes("moved") || text.includes("migrate");
  const mentionsBooth = text.includes("booth") || text.includes("polling station");
  const mentionsConstituency = text.includes("constituency");
  const mentionsVerify = text.includes("verify") || text.includes("details");
  const mentionsUpcoming = text.includes("upcoming election") || text.includes("eligible");
  const neverVoted = text.includes("never voted") || text.includes("first vote");
  const rural = context.voterAreaType === "rural" || text.includes("village") || text.includes("rural");
  const urban = context.voterAreaType === "urban" || text.includes("city") || text.includes("urban");

  if (text.includes("lost")) return SCENARIOS.LOST_ID_REGISTERED;
  if (mentionsBooth && registrationStatus === "registered") return SCENARIOS.REGISTERED_CHECK_BOOTH;
  if (mentionsConstituency) return SCENARIOS.CONSTITUENCY_CONFUSION;
  if (mentionsVerify && registrationStatus === "registered") return SCENARIOS.REGISTERED_VERIFY_DETAILS;
  if (neverVoted && registrationStatus === "registered") return SCENARIOS.REGISTERED_NEVER_VOTED;
  if (mentionsUpcoming) return SCENARIOS.ELIGIBILITY_UPCOMING;
  if (moved && registrationStatus === "not_registered") return SCENARIOS.FIRST_TIME_MIGRATED;
  if (moved && migrationType === "inter_state") return SCENARIOS.MIGRATED_INTER_STATE;
  if (moved && migrationType === "intra_state") return SCENARIOS.MIGRATED_INTRA_STATE;
  if (moved) return SCENARIOS.MIGRATED;
  if (rural) return SCENARIOS.RURAL_VOTER_GUIDANCE;
  if (urban) return SCENARIOS.URBAN_VOTER_GUIDANCE;
  if (text.includes("correct")) return SCENARIOS.CORRECTION;
  if (registrationStatus === "unsure") return SCENARIOS.UNKNOWN_STATUS;
  if (registrationStatus === "not_registered") return SCENARIOS.ELIGIBLE_UNREGISTERED;
  if (registrationStatus === "registered") return SCENARIOS.REGULAR_REGISTERED;
  return SCENARIOS.CORRECTION;
}
