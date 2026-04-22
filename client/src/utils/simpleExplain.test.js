import { simplifyGuidance } from "./simpleExplain";
import { describe, it, expect } from "vitest";

describe("simplifyGuidance Logic", () => {
  it("returns null if no guidance is provided", () => {
    expect(simplifyGuidance(null)).toBeNull();
  });

  it("simplifies complex bureaucratic terms", () => {
    const input = {
      userStatus: ["You are on the electoral roll in this constituency."],
      requiredActions: ["Complete registration verification."],
      documentsNeeded: ["Bring your acknowledgment slip."]
    };

    const output = simplifyGuidance(input);

    expect(output.userStatus[0]).toBe("You are on the voter list in this area.");
    expect(output.requiredActions[0]).toBe("Complete sign-up checking.");
    expect(output.documentsNeeded[0]).toBe("Bring your tracking number slip.");
  });

  it("preserves guidance keys that are undefined", () => {
    const input = {
      userStatus: ["Something"]
      // omitting requiredActions entirely
    };

    const output = simplifyGuidance(input);
    expect(output.requiredActions).toEqual([]);
    expect(output.userStatus[0]).toBe("Something");
  });
});
