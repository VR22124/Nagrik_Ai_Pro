import { TRUST_STATEMENT } from "../data/electionRules.config.js";

export const COMPLIANCE_NOTICE =
  "You will complete this step on the official platform. I will guide you.";

export function withCompliance(payload) {
  return {
    ...payload,
    complianceNotice: COMPLIANCE_NOTICE,
    trustNote: TRUST_STATEMENT
  };
}
