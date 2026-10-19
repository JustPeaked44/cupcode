import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";
beforeEach(() => {
  history.replaceState(null, "", "/");
  vi.spyOn(Math, "random").mockReturnValue(0.7);
});
function start() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Start Practice" }));
}
describe("practice flow", () => {
  it("starts, reveals without grading, preserves inputs, retries and generates a fresh order", () => {
    start();
    const dialogue = document.querySelector(".dialogue")!.textContent;
    expect(screen.getAllByRole("article", { name: /workspace/ })).toHaveLength(
      3,
    );
    const input = screen.getByRole("textbox", { name: "Drink 1 Milk" });
    fireEvent.change(input, { target: { value: "A / 50%" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Drink 1 Other" }), {
      target: { value: "own note" },
    });
    expect(screen.getByRole("textbox", { name: "Drink 2 Milk" })).toHaveValue(
      "",
    );
    fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));
    expect(input).toHaveValue("A / 50%");
    expect(screen.getByRole("textbox", { name: "Drink 1 Other" })).toHaveValue(
      "own note",
    );
    expect(
      screen.getByRole("heading", { name: "Every mark has a meaning." }),
    ).toBeVisible();
    expect(screen.getAllByText("Make it stick")).toHaveLength(3);
    expect(document.querySelector(".answers")!.textContent).not.toMatch(
      /incorrect|correct!|pass|fail|\d+%/i,
    );
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(document.querySelector(".dialogue")!.textContent).toBe(dialogue);
    expect(input).toHaveValue("");
    expect(document.querySelector(".answers")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Generate Order" }));
    expect(document.querySelector(".dialogue")!.textContent).not.toBe(dialogue);
    expect(screen.getByRole("textbox", { name: "Drink 1 Milk" })).toHaveValue(
      "",
    );
    fireEvent.click(screen.getByRole("button", { name: "Exit" }));
    expect(
      screen.getByRole("button", { name: "Start Practice" }),
    ).toBeVisible();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
  it("allows empty mental practice and keeps the scenario on replay or stop", () => {
    start();
    const dialogue = document.querySelector(".dialogue")!.textContent;
    fireEvent.click(screen.getByRole("button", { name: "Mental" }));
    expect(
      screen.getByRole("heading", { name: "Picture your markings." }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Replay Order" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop Audio" }));
    expect(document.querySelector(".dialogue")!.textContent).toBe(dialogue);
    fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));
    expect(screen.getAllByText("Make it stick").length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox", { name: "Drink 1 Drink" })).toHaveValue(
      "",
    );
  });
  it("opens and dismisses help and searches contextual source entries", () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "The six fields" }));
    expect(screen.getByRole("button", { name: "Got it" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("button", { name: "Got it" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Code library" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search beverage codes" }),
      { target: { value: "no whipped" } },
    );
    const entries = document.querySelectorAll(".catalog-entry");
    expect(entries).toHaveLength(1);
    expect(
      within(entries[0] as HTMLElement).getByText(
        "Crossed out in source · reference only",
      ),
    ).toBeVisible();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search beverage codes" }),
      { target: { value: "does-not-exist" } },
    );
    expect(screen.getByText(/No matching codes/)).toBeVisible();
  });
});
