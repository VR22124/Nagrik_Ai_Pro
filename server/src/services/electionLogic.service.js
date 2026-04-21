import { FORMS } from "../data/forms.config.js";
import { SCENARIOS } from "../data/scenarios.config.js";
import { ELECTION_RULES } from "../data/electionRules.config.js";

export function checkEligibility(age) {
  if (age < 18) {
    return {
      isEligible: false,
      eligibilityStatus: "NOT_ELIGIBLE_AGE",
      blockFurtherProcessing: true
    };
  }
  return { isEligible: true, eligibilityStatus: "ELIGIBLE", blockFurtherProcessing: false };
}

export function mapForms(registrationStatus, scenario, isEligible) {
  if (isEligible === false) return ["Wait until age eligibility and then apply on official portal"];

  if (
    scenario === SCENARIOS.LOST_ID ||
    scenario === SCENARIOS.LOST_ID_REGISTERED ||
    scenario === SCENARIOS.CORRECTION
  ) {
    return [FORMS.CORRECTION_OR_REPLACEMENT];
  }

  if (
    registrationStatus === "not_registered" ||
    scenario === SCENARIOS.FIRST_TIME ||
    scenario === SCENARIOS.FIRST_TIME_MIGRATED ||
    scenario === SCENARIOS.ELIGIBLE_UNREGISTERED ||
    scenario === SCENARIOS.ELIGIBILITY_UPCOMING
  ) {
    return [FORMS.NEW_REGISTRATION];
  }

  if (registrationStatus === "unsure" || scenario === SCENARIOS.UNKNOWN_STATUS) {
    return [
      "Check electoral roll first using NVSP/Voter Helpline",
      `${FORMS.NEW_REGISTRATION} if your name is not found`,
      `${FORMS.CORRECTION_OR_REPLACEMENT} if details are incorrect`
    ];
  }

  return ["No new form may be required if your electoral roll entry is correct"];
}

export function getTimelineRisk(context) {
  if (context.registrationStatus === "not_registered" && context.movedRecently) {
    return {
      level: "high",
      message: "Applying late may exclude you from the upcoming election cycle."
    };
  }
  if (context.registrationStatus === "unsure") {
    return {
      level: "medium",
      message: "Check your roll status now to avoid last-minute correction delays."
    };
  }
  return {
    level: "low",
    message: "Start early to keep enough time for verification and corrections."
  };
}

export function getAddressRisk(context) {
  if (!context.hasAddressProof) {
    return {
      risk: "high",
      message: "Missing current address proof can delay verification.",
      recommendation: "Collect hostel certificate, rental agreement, utility bill, or bank passbook."
    };
  }
  if (context.scenario.includes("migrated")) {
    return {
      risk: "medium",
      message: "Migrated applicants should ensure documents match current residence.",
      recommendation: "Use your current address exactly as shown in proof documents."
    };
  }
  return {
    risk: "low",
    message: "Address readiness looks good.",
    recommendation: "Double-check spelling and pincode before submission."
  };
}

export function getElectionCoreInsights(scenario) {
  const baseInsight = "Your ability to vote depends on your name in the electoral roll, not only voter ID.";
  if (scenario.includes("lost_id")) {
    return {
      keyInsight: `${ELECTION_RULES.ID_RULE} ${ELECTION_RULES.ROLL_RULE}`,
      practicalTip: "Verify your electoral roll entry before polling day and keep one valid alternate ID proof."
    };
  }
  if (scenario.includes("constituency") || scenario.includes("migrated")) {
    return {
      keyInsight: `${ELECTION_RULES.CONSTITUENCY_RULE} ${ELECTION_RULES.ROLL_RULE}`,
      practicalTip: "Use your current residence details and confirm constituency mapping before applying."
    };
  }
  return {
    keyInsight: baseInsight,
    practicalTip: "Always verify your name in the electoral roll a few days before polling day."
  };
}

export function getRuleWhyRiskLines(scenario) {
  const rule = `Rule: ${ELECTION_RULES.ROLL_RULE}`;
  if (scenario.includes("lost_id")) {
    return [
      rule,
      "Why: Polling staff check roll inclusion first; voter card loss alone does not cancel eligibility.",
      "Risk: If roll status is not verified early, you may face confusion on polling day."
    ];
  }
  if (scenario.includes("migrated") || scenario.includes("constituency")) {
    return [
      `Rule: ${ELECTION_RULES.CONSTITUENCY_RULE}`,
      "Why: Booth assignment and voting rights are linked to current constituency records.",
      "Risk: Using old address details can shift or block your expected polling location."
    ];
  }
  return [
    rule,
    "Why: Electoral roll is the official source used for voting eligibility at booth level.",
    "Risk: Skipping roll check may lead to last-minute correction delays or missed participation."
  ];
}
