import test from "node:test";
import assert from "node:assert/strict";
import { recommendScenario } from "../../src/services/scenario.service.js";

test("recommends lost_id by intent keyword", () => {
  assert.equal(recommendScenario("registered", "I lost my voter card"), "lost_id_registered");
});

test("recommends unknown_status when status unsure", () => {
  assert.equal(recommendScenario("unsure", ""), "unknown_status");
});

test("recommends first_time_migrated when moved and unregistered", () => {
  assert.equal(recommendScenario("not_registered", "I moved to a new city"), "first_time_migrated");
});

test("recommends booth-check flow for registered voter", () => {
  assert.equal(recommendScenario("registered", "I want booth details"), "registered_check_booth");
});

test("recommends regular registered flow when no issue", () => {
  assert.equal(recommendScenario("registered", "all good"), "regular_registered");
});
