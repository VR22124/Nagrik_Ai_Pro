import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import ActionButtons from "./ActionButtons";

describe("ActionButtons Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null when actions array is empty", () => {
    const { container } = render(<ActionButtons actions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders action buttons with links and helpers", () => {
    const mockActions = [
      { label: "Download Form 6", url: "https://voters.eci.gov.in", helper: "Official portal" }
    ];

    render(<ActionButtons actions={mockActions} />);
    
    const link = screen.getByRole("link", { name: /Download Form 6/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://voters.eci.gov.in");
    expect(screen.getByText("Official portal")).toBeDefined();
  });
});
