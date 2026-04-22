import { render, screen, cleanup, act } from "@testing-library/react";
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
    await act(async () => {
      render(<App />);
    });

    // Header renders after Suspense/SessionProvider resolves
    const heading = await screen.findByText("NagrikAI Pro");
    expect(heading).toBeDefined();

    const subheading = await screen.findByText("Smart Election Guidance, Step by Step");
    expect(subheading).toBeDefined();

    // Lazy-loaded GuidanceForm resolves
    const button = await screen.findByRole("button", { name: "Get My Next Step" });
    expect(button).toBeDefined();
  });
});
