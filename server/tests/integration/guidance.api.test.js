import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../../src/app.js";

const app = createApp();

test("validates required fields", async () => {
  const res = await request(app).post("/api/guidance/generate").send({});
  assert.equal(res.status, 422);
});

test("case 1: tamil nadu first-time flow", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 22,
    state: "Tamil Nadu",
    registrationStatus: "not_registered",
    scenario: "first_time",
    movedRecently: true
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.requiredActions.join(" ").includes("Form 6"));
  assert.ok(res.body.importantDeadlines.join(" ").includes("upcoming election cycle"));
});

test("case 2: karnataka lost id flow", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 45,
    state: "Karnataka",
    registrationStatus: "registered",
    scenario: "lost_id"
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.requiredActions.join(" ").includes("Form 8"));
  assert.ok(res.body.requiredActions.join(" ").includes("electoral roll"));
});

test("case 3: maharashtra unsure flow", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 30,
    state: "Maharashtra",
    registrationStatus: "unsure",
    scenario: "unknown_status"
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.requiredActions.join(" ").includes("electoral roll"));
});

test("edge case: missing address proof returns predictive risk guidance", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 24,
    state: "Tamil Nadu",
    registrationStatus: "not_registered",
    scenario: "first_time_migrated",
    hasAddressProof: false
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.documentsNeeded.join(" ").includes("Hostel letter"));
});

test("regular registered flow includes insight layer", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 33,
    state: "Karnataka",
    registrationStatus: "registered",
    scenario: "regular_registered",
    intent: "I just want to confirm voting process"
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.keyInsight.includes("electoral roll"));
  assert.ok(res.body.practicalTip.includes("polling day"));
});

test("registered booth check flow is prioritized correctly", async () => {
  const res = await request(app).post("/api/guidance/generate").send({
    age: 40,
    state: "Maharashtra",
    registrationStatus: "registered",
    scenario: "unknown_status",
    intent: "I want to check booth details"
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.userStatus.join(" ").includes("registered_check_booth"));
});
