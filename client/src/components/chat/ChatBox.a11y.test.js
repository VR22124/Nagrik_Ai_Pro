import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatBox from "../src/components/chat/ChatBox";

expect.extend(toHaveNoViolations);

test("ChatBox is accessible", async () => {
  const { container } = render(<ChatBox />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
