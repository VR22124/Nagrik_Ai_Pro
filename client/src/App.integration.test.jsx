import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import App from "./App";
import { fetchGuidance } from "./services/guidanceApi";

// Mock API and Services
vi.mock("./services/guidanceApi", () => ({
  fetchGuidance: vi.fn()
}));

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

describe("App Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("submits the form and displays generated guidance", async () => {
    // Mock the backend response
    fetchGuidance.mockResolvedValueOnce({
      userStatus: ["You are an eligible voter."],
      requiredActions: ["Please submit Form 6."],
      importantDeadlines: ["Deadline: Do not wait until the last day."],
      documentsNeeded: ["Aadhar Card"]
    });

    render(<App />);

    // 1. Initial State: The form should be visible
    expect(await screen.findByText("Start Your Journey")).toBeDefined();

    // 2. Change an input value (Age)
    const ageInput = screen.getByLabelText(/Age/i);
    fireEvent.change(ageInput, { target: { value: "25" } });
    expect(ageInput.value).toBe("25");

    // 3. Submit the form
    const submitButton = screen.getByRole("button", { name: "Get My Next Step" });
    fireEvent.click(submitButton);

    // 4. Verify API was called correctly
    await waitFor(() => {
      expect(fetchGuidance).toHaveBeenCalledTimes(1);
    });

    // 5. Verify the guidance is painted to the DOM
    // The "SummaryHeader" renders userStatus combined
    await waitFor(() => {
      expect(screen.getByText(/You are eligible but not registered/i)).toBeDefined();
    });

    // The "DoThisNow" component renders the requiredActions
    expect(screen.getByText(/Please submit Form 6./i)).toBeDefined();
    expect(screen.getByText(/Deadline: Do not wait until the last day./i)).toBeDefined();
  });
});
