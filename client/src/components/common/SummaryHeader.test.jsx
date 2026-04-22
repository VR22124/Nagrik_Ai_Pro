import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import SummaryHeader from "./SummaryHeader";

describe("SummaryHeader Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null when no summary is provided", () => {
    const { container } = render(<SummaryHeader summary={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the summary text when provided", () => {
    render(<SummaryHeader summary="This is a test summary." />);
    expect(screen.getByText("Summary")).toBeDefined();
    expect(screen.getByText("This is a test summary.")).toBeDefined();
  });
});
