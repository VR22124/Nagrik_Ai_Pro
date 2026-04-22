import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("NagrikAI Pro E2E Workflow Test", () => {
  it("executes the full T20-style primary AI flow (form input -> complete structured guidance)", async () => {
    // 1. Emulate the frontend's static dependency execution
    const { default: request } = await import("supertest");
    const { createApp } = await import("../../src/app.js");
    const app = createApp();

    // 2. Transmit complex hybrid state equivalent to browser Form hook
    const testPayload = {
      age: 22,
      state: "Tamil Nadu",
      registrationStatus: "not_registered",
      scenario: "first_time_migrated",
      hasAddressProof: false,
      movedRecently: true,
      migrationType: "inter_state",
      intent: "I moved to Chennai for college and need voter registration help"
    };

    // 3. E2E Network invocation over internal express server mapping
    const res = await request(app)
      .post("/api/guidance/generate")
      .send(testPayload)
      .set("Accept", "application/json");

    // 4. Assert exact structure definitions outputted to the UI Client
    assert.strictEqual(res.status, 200, "Should succeed with a 200 HTTP OK");
    const guidance = res.body;

    assert.ok(guidance.userStatus.length > 0, "Guidance should include parsed user status array");
    assert.ok(guidance.requiredActions.length > 0, "Guidance must map actions");
    assert.ok(guidance.documentsNeeded.length > 0, "Guidance should map document recommendations");
    assert.ok(guidance.importantDeadlines !== undefined, "System should process semantic deadlines");

    // Check specific logic assertions (First-time migrant -> Form 6 instruction)
    const requiredStr = guidance.requiredActions.join(" ").toLowerCase();
    assert.ok(
      requiredStr.includes("form 6"), 
      "Rules Engine must dynamically inject Form 6 requirement"
    );
  });
});
