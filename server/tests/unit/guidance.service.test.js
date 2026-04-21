import test from "node:test";
import assert from "node:assert/strict";
import { generateGuidance } from "../../src/services/guidance.service.js";

test("includes compliance notice", () => {
  const output = generateGuidance({
    age: 30,
    state: "Maharashtra",
    registrationStatus: "unsure",
    scenario: "unknown_status",
    hasAddressProof: true
  });
  assert.equal(
    output.complianceNotice,
    "You will complete this step on the official platform. I will guide you."
  );
});

test("includes predictive guidance for missing address proof", () => {
  const output = generateGuidance({
    age: 22,
    state: "Tamil Nadu",
    registrationStatus: "not_registered",
    scenario: "first_time_migrated",
    hasAddressProof: false,
    movedRecently: true
  });
  assert.ok(output.nextSteps.join(" ").includes("Predictive guidance"));
});

test("includes insight and practical tip", () => {
  const output = generateGuidance({
    age: 30,
    state: "Maharashtra",
    registrationStatus: "registered",
    scenario: "regular_registered",
    hasAddressProof: true
  });
  assert.ok(output.keyInsight.includes("electoral roll"));
  assert.ok(output.practicalTip.length > 10);
});
