import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import App from "./App";

vi.mock("./services/firebase", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue("mock-uid"),
  auth: {},
  db: {}
}));

vi.mock("./services/sessionStore", () => ({
  loadSession: vi.fn().mockResolvedValue(null),
  saveSession: vi.fn()
}));

vi.mock("./services/analytics", () => ({
  trackEvent: vi.fn()
}));

describe("App Smoke Test", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    render(<App />);
    expect(screen.getByText("NagrikAI Pro")).toBeDefined();
    expect(screen.getByText("Smart Election Guidance, Step by Step")).toBeDefined();
    
    // Check if the lazy-loaded GuidanceForm eventually renders
    const button = await screen.findByRole("button", { name: "Get My Next Step" });
    expect(button).toBeDefined();
  });
});
