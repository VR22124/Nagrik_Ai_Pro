import { expect, test, describe } from "vitest";
import {
  getSummaryLine,
  compactWords,
  shortenLine
} from "./guidanceHelpers.js";

describe("guidanceHelpers", () => {
  test("compactWords cuts off text at exact word limit and appends ellipsis", () => {
    const text = "one two three four five six";
    const compacted = compactWords(text, 3);
    expect(compacted).toBe("one two three...");
  });

  test("compactWords returns original text if under word limit", () => {
    const text = "one two three";
    const compacted = compactWords(text, 5);
    expect(compacted).toBe("one two three");
  });

  test("shortenLine cuts off at character limit", () => {
    const text = "This is a very long string that should be cut";
    const shortened = shortenLine(text, 10);
    expect(shortened).toBe("This is a...");
  });

  test("shortenLine returns original if under limit", () => {
    const text = "Short";
    const shortened = shortenLine(text, 20);
    expect(shortened).toBe("Short");
  });

  test("getSummaryLine returns accurate registration status text", () => {
    const mockGuidance = {};
    const mockForm = { registrationStatus: "not_registered" };
    const summary = getSummaryLine(mockGuidance, mockForm);
    expect(summary).toBe("You are eligible but not registered. You need to register to vote.");
  });
});
