import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkValue } from "./Cup";
it("renders an accessible spatial slash-over marking, keeping WC as the underlying code", () => {
  render(
    <MarkValue
      mark={{
        code: "WC",
        meaning: "Whipped Cream",
        reason: "No whipped cream requested",
        modifier: "/",
        placement: "over",
      }}
    />,
  );
  const code = screen.getByLabelText("slash over WC");
  expect(code).toHaveTextContent("WC");
  expect(code.querySelector("i")).toHaveTextContent("/");
  expect(code.querySelector("i")).toHaveAttribute("aria-hidden", "true");
});
it("shows a neutral blank when no marking is justified", () => {
  render(<MarkValue />);
  expect(screen.getByText("Blank")).toBeVisible();
});
