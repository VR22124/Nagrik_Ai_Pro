import test from "node:test";
import assert from "node:assert/strict";
import {
  checkEligibility,
  getAddressRisk,
  getElectionCoreInsights,
  getRuleWhyRiskLines,
  getTimelineRisk,
  mapForms
} from "../../src/services/electionLogic.service.js";

test("eligibility returns true for age >= 18", () => {
  assert.equal(checkEligibility(22).isEligible, true);
});

test("eligibility returns false for age < 18", () => {
  assert.equal(checkEligibility(17).isEligible, false);
});

test("maps form 6 for unregistered", () => {
  assert.deepEqual(mapForms("not_registered", "first_time", true), ["Form 6"]);
});

test("maps roll-first path for unsure status", () => {
  const forms = mapForms("unsure", "unknown_status", true);
  assert.ok(forms.join(" ").includes("Check electoral roll first"));
});

test("address risk high when proof missing", () => {
  const risk = getAddressRisk({ hasAddressProof: false, scenario: "migrated_inter_state" });
  assert.equal(risk.risk, "high");
});

test("timeline risk high when unregistered and moved recently", () => {
  const risk = getTimelineRisk({ registrationStatus: "not_registered", movedRecently: true });
  assert.equal(risk.level, "high");
});

test("insight explains roll importance", () => {
  const insight = getElectionCoreInsights("regular_registered");
  assert.ok(insight.keyInsight.includes("electoral roll"));
});

test("rule/why/risk lines are produced", () => {
  const lines = getRuleWhyRiskLines("constituency_confusion");
  assert.ok(lines.some((x) => x.startsWith("Rule:")));
  assert.ok(lines.some((x) => x.startsWith("Why:")));
  assert.ok(lines.some((x) => x.startsWith("Risk:")));
});
