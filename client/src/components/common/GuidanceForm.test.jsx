import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import GuidanceForm from "./GuidanceForm";

describe("GuidanceForm Component", () => {
  const mockForm = {
    age: "22",
    state: "Tamil Nadu",
    registrationStatus: "not_registered",
    scenario: "first_time",
    migrationType: "unspecified",
    hasAddressProof: true,
    intent: ""
  };

  afterEach(() => {
    cleanup();
  });

  it("renders form inputs with correct values", () => {
    render(<GuidanceForm form={mockForm} setForm={vi.fn()} onSubmit={vi.fn()} loading={false} error="" />);
    
    expect(screen.getByLabelText(/Age/i).value).toBe("22");
    expect(screen.getByLabelText(/State/i).value).toBe("Tamil Nadu");
    expect(screen.getByLabelText(/Scenario/i).value).toBe("first_time");
  });

  it("calls onSubmit when submitted", () => {
    const onSubmitMock = vi.fn((e) => e.preventDefault());
    render(<GuidanceForm form={mockForm} setForm={vi.fn()} onSubmit={onSubmitMock} loading={false} error="" />);
    
    const button = screen.getByRole("button", { name: "Get My Next Step" });
    fireEvent.click(button);
    
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<GuidanceForm form={mockForm} setForm={vi.fn()} onSubmit={vi.fn()} loading={true} error="" />);
    
    const button = screen.getByRole("button");
    expect(button.disabled).toBe(true);
    expect(screen.getByText("Generating Guidance...")).toBeDefined();
  });

  it("displays error message if provided", () => {
    render(<GuidanceForm form={mockForm} setForm={vi.fn()} onSubmit={vi.fn()} loading={false} error="API Error 500" />);
    
    expect(screen.getByRole("alert").textContent).toBe("API Error 500");
  });
});
