import {
  checkEligibility,
  getAddressRisk,
  getElectionCoreInsights,
  getRuleWhyRiskLines,
  getTimelineRisk,
  mapForms
} from "./electionLogic.service.js";
import { suggestDocuments } from "./documentAdvisor.service.js";
import { getDeadlineGuidance } from "./deadlineAdvisor.service.js";
import { withCompliance } from "./compliance.service.js";
import { buildStructuredResponse } from "../utils/responseBuilder.js";
import { recommendScenario } from "./scenario.service.js";
import { getActionOpener } from "./variation.service.js";
import { getAreaTypeNuance, getStateNuance } from "../data/states.config.js";

function buildWhyLine(scenarioKey) {
  if (scenarioKey.includes("migrated")) {
    return "Why: electoral records are constituency-based, so current residence must match records.";
  }
  if (scenarioKey.includes("lost_id")) {
    return "Why: card loss does not remove voting eligibility if your name remains in the electoral roll.";
  }
  if (scenarioKey === "unknown_status") {
    return "Why: confirming roll status first avoids unnecessary re-application.";
  }
  return "Why: accurate records reduce delays during verification and polling readiness.";
}

function buildScenarioActions(context, forms, scenarioKey) {
  const base = [getActionOpener(`${context.state}-${scenarioKey}`)];
  if (
    context.registrationStatus === "not_registered" ||
    scenarioKey === "eligible_unregistered" ||
    scenarioKey === "eligibility_upcoming_election"
  ) {
    base.push("Start registration using Form 6 on NVSP or Voter Helpline App.");
  } else if (scenarioKey.includes("lost_id")) {
    base.push("Use Form 8 flow to request replacement/update details.");
    base.push("Check your name in the electoral roll because voting depends on roll inclusion.");
  } else if (scenarioKey === "registered_check_booth") {
    base.push("Check booth details from official NVSP/Voter Helpline using your roll record.");
  } else if (scenarioKey === "registered_verify_details") {
    base.push("Verify your name, age, and address in the electoral roll entry.");
  } else if (scenarioKey === "regular_registered") {
    base.push("Keep your roll entry and booth details ready before polling day.");
  } else if (context.registrationStatus === "unsure" || scenarioKey === "unknown_status") {
    base.push("Check your name in the electoral roll first.");
  }
  base.push(`Follow the official flow for ${context.state}.`);
  base.push(buildWhyLine(scenarioKey));
  base.push(...getRuleWhyRiskLines(scenarioKey));
  forms.forEach((f) => base.push(`Required form guidance: ${f}.`));
  return prioritizeActions(base);
}

function prioritizeActions(lines) {
  const ranked = [...lines];
  ranked.sort((a, b) => scoreAction(b) - scoreAction(a));
  return ranked;
}

function scoreAction(line) {
  const l = line.toLowerCase();
  if (l.includes("rule:")) return 4;
  if (l.includes("start registration") || l.includes("check your name in the electoral roll")) return 3;
  if (l.includes("risk:")) return 2;
  if (l.includes("why:")) return 1;
  return 0;
}

const guidanceCache = new Map();

export function generateGuidance(context) {
  const cacheKey = JSON.stringify(context);
  if (guidanceCache.has(cacheKey)) {
    return guidanceCache.get(cacheKey);
  }

  const eligibility = checkEligibility(context.age);
  const resolvedScenario = recommendScenario(context.registrationStatus, context.intent, context);
  const effectiveScenario = context.scenario === "unknown_status" ? resolvedScenario : context.scenario;
  const forms = mapForms(context.registrationStatus, effectiveScenario, eligibility.eligible);
  const requiredActions = buildScenarioActions(context, forms, effectiveScenario);
  const documentsNeeded = suggestDocuments(context);
  const timelineRisk = getTimelineRisk(context);
  const addressRisk = getAddressRisk({ ...context, scenario: effectiveScenario });
  const stateNuance = getStateNuance(context.state);
  const insights = getElectionCoreInsights(effectiveScenario);

  const responseTemplate = buildStructuredResponse({
    userStatus: [
      `Age: ${context.age}`,
      `State: ${context.state}`,
      `Registration status: ${context.registrationStatus}`,
      `Resolved scenario: ${effectiveScenario}`,
      eligibility.eligible ? "You are eligible by age." : eligibility.reason
    ],
    requiredActions,
    documentsNeeded: [...documentsNeeded, `Address-readiness note: ${addressRisk.message}`],
    importantDeadlines: getDeadlineGuidance(timelineRisk),
    nextSteps: [
      "Open official NVSP portal or Voter Helpline App.",
      "Submit the correct form with matching details and track acknowledgment.",
      `Predictive guidance: ${addressRisk.recommendation}`
    ],
    optionalHelpOptions: [
      "Use simple-language mode for first-time guidance.",
      "Use Google Maps to navigate once booth address is available.",
      "Use translation support for regional language assistance.",
      stateNuance.regionalSupport,
      getAreaTypeNuance(context.voterAreaType)
    ],
    journeyTimeline: ["Context", "Verification", "Application", "Roll confirmation", "Polling day readiness"],
    commonMistakes: scenarioSpecificMistakes(effectiveScenario),
    smartPrompts: [
      "Do you want to check your constituency next?",
      "Need help selecting address proof documents?",
      timelineRisk.level === "high"
        ? "Do you want a fast-track checklist for urgent submission?"
        : "Do you want a checklist before submitting forms?"
    ],
    keyInsight: insights.keyInsight,
    practicalTip: insights.practicalTip
  });

  const finalResponse = withCompliance(responseTemplate);
  
  // Clean cache periodically to prevent unbounded memory growth
  if (guidanceCache.size > 500) {
    guidanceCache.clear();
  }
  guidanceCache.set(cacheKey, finalResponse);
  
  return finalResponse;
}

function scenarioSpecificMistakes(scenarioKey) {
  if (scenarioKey.includes("migrated")) {
    return [
      "Using previous constituency address after migration.",
      "Not updating proof documents before applying.",
      "Ignoring constituency re-check after address change."
    ];
  }
  if (scenarioKey.includes("lost_id")) {
    return [
      "Assuming card loss means voter status is removed.",
      "Skipping electoral roll verification before polling day.",
      "Waiting until election week for replacement flow."
    ];
  }
  if (scenarioKey === "registered_check_booth") {
    return [
      "Assuming last election booth remains unchanged.",
      "Skipping constituency lookup before polling day.",
      "Not verifying booth address on official portal."
    ];
  }
  return [
    "Using old hometown address instead of current residence.",
    "Submitting mismatched names between documents.",
    "Waiting too late near roll update cut-off."
  ];
}
