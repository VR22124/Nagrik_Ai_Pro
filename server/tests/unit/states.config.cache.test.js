import test from "node:test";
import assert from "node:assert/strict";
import { getStatesConfig } from "../../src/data/states.config.js";

test("states config cache returns same object", () => {
  const a = getStatesConfig();
  const b = getStatesConfig();
  assert.equal(a, b);
});
