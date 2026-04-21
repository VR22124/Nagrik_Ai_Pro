import { getStatesConfig } from "../../src/data/states.config.js";

describe("states config cache", () => {
  it("should return the same object within cache TTL", () => {
    const a = getStatesConfig();
    const b = getStatesConfig();
    expect(a).toBe(b);
  });
});
