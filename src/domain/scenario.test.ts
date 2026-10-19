import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { catalog, combinedExamples, lookup } from "../data/catalog";
import { modifications, recipes } from "../data/recipes";
import {
  blankAttempt,
  formatMark,
  generateScenario,
  referenceInfo,
  studyTips,
} from "./scenario";
import { fields } from "./types";
export function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
describe("manual fidelity", () => {
  it("preserves every source status row and its original line", () => {
    const lines = readFileSync("docs/beverage-id-codes.md", "utf8").split(
      /\r?\n/,
    );
    const sourceRows = lines.filter((line) =>
      /^\| `[^`]+` \| [^|]+ \| (Shown normally|Crossed out in source) \|/.test(
        line,
      ),
    );
    expect(catalog).toHaveLength(sourceRows.length);
    for (const row of catalog) {
      expect(lines[row.sourceLine - 1]).toContain(`\`${row.code}\``);
      expect(lines[row.sourceLine - 1]).toContain(row.meaning);
    }
    expect(catalog.filter((row) => row.status === "crossed-out")).toHaveLength(
      2,
    );
  });
  it("keeps category and field collisions separate", () => {
    expect(lookup("Milk", "A").meaning).toBe("Almond");
    expect(lookup("Syrup", "A").meaning).toBe("Almond");
    expect(lookup("Drink", "A").meaning).toBe("Caffè Americano");
    expect(lookup("Shots", "L").meaning).toBe("Lungo / Long Shot");
    expect(lookup("Drink", "L").meaning).toBe("Caffè Latte");
    expect(lookup("Custom", "MO").meaning).toContain("topping");
    expect(lookup("Syrup", "MO").category).toBe("Sauce");
    expect(
      catalog.filter((row) => row.field === "Drink" && row.code === "CH"),
    ).toHaveLength(2);
  });
  it("does not use crossed-out entries as active definitions", () => {
    expect(() => lookup("Custom", "TOP")).toThrow();
    expect(lookup("Custom", "WC").meaning).toBe("Whipped Cream");
    expect(() => lookup("Syrup", "V")).toThrow();
    expect(combinedExamples).toHaveLength(5);
  });
  it("represents every manual category", () => {
    expect(new Set(catalog.map((row) => row.category)).size).toBe(11);
  });
});
describe("constrained order generation", () => {
  it("is deterministic with an injected RNG", () => {
    expect(generateScenario(seeded(19))).toEqual(generateScenario(seeded(19)));
  });
  it("produces explainable, compatible, dialogue-matched scenarios across 2000 samples", () => {
    const random = seeded(421);
    const counts = new Set();
    const seenRecipes = new Set();
    const seenMods = new Set();
    for (let i = 0; i < 2000; i++) {
      const scenario = generateScenario(random);
      counts.add(scenario.beverages.length);
      expect(scenario.beverages.length).toBeGreaterThanOrEqual(1);
      expect(scenario.beverages.length).toBeLessThanOrEqual(3);
      expect(scenario.dialogue).toContain(`The name is ${scenario.customer}.`);
      expect(scenario.bag).toBe(scenario.toGo && scenario.bag);
      expect(scenario.dialogue.includes("carrier bag")).toBe(scenario.bag);
      expect(scenario.dialogue.includes("To go, please.")).toBe(scenario.toGo);
      expect(scenario.beverages.map((b) => b.id).length).toBe(
        new Set(scenario.beverages.map((b) => b.id)).size,
      );
      for (const beverage of scenario.beverages) {
        seenRecipes.add(beverage.recipe.id);
        expect(recipes).toContain(beverage.recipe);
        expect(beverage.recipe.temperatures).toContain(beverage.temperature);
        expect(beverage.recipe.sizes).toContain(beverage.size);
        expect(scenario.dialogue).toContain(beverage.phrase);
        expect(beverage.phrase).toContain(beverage.size.toLowerCase());
        expect(beverage.markings.Drink?.code).toBe(beverage.recipe.code);
        expect(studyTips(beverage).length).toBeGreaterThanOrEqual(2);
        for (const mod of beverage.modifications) {
          seenMods.add(mod.id);
          expect(beverage.recipe.modifications).toContain(mod.id);
          expect(beverage.phrase).toContain(mod.phrase);
          expect(beverage.markings[mod.field]).toEqual(mod.mark);
          expect(lookup(mod.field, mod.mark.code).status).toBe("active");
        }
        expect(
          new Set(beverage.modifications.map((mod) => mod.field)).size,
        ).toBe(beverage.modifications.length);
        expect(
          Object.keys(beverage.markings).every((field) =>
            fields.includes(field as (typeof fields)[number]),
          ),
        ).toBe(true);
        expect(studyTips(beverage).join(" ")).not.toMatch(
          /incorrect|you got|score/i,
        );
      }
    }
    expect([...counts].sort()).toEqual([1, 2, 3]);
    expect(seenRecipes.size).toBe(recipes.length);
    expect(seenMods.size).toBe(10);
  });
  it("changes identity and recipe signature even with a constant RNG", () => {
    const first = generateScenario(() => 0);
    const second = generateScenario(() => 0, first);
    expect(second.customer).not.toBe(first.customer);
    expect(second.signature).not.toBe(first.signature);
    expect(second.id).not.toBe(first.id);
    expect(second.dialogue).toContain(second.beverages[0].phrase);
  });
  it("keeps independent blank attempts and reference answers", () => {
    const scenario = generateScenario(seeded(93));
    const before = JSON.stringify(scenario);
    const a = blankAttempt();
    const b = blankAttempt();
    a.Milk = "A / 50%";
    a.Other = "anything";
    expect(b.Milk).toBe("");
    expect(Object.keys(a)).toHaveLength(9);
    expect(b.Other).toBe("");
    expect(JSON.stringify(scenario)).toBe(before);
  });
  it("uses the carrier-bag convention only for a bag request", () => {
    const scenario = generateScenario(() => 0);
    expect(referenceInfo(scenario)).toEqual({
      "Customer Name": scenario.customer,
      "To-Go / Carrier Bag": "->",
      Other: "",
    });
    expect(
      referenceInfo({ ...scenario, bag: false })["To-Go / Carrier Bag"],
    ).toBe("");
  });
  it("keeps modifier placement structured and legible", () => {
    expect(
      formatMark(modifications.find((mod) => mod.id === "no-whip")!.mark),
    ).toBe("WC (slash over)");
    expect(
      formatMark(modifications.find((mod) => mod.id === "light-whip")!.mark),
    ).toBe("Lt WC");
    expect(
      formatMark({
        code: "WC",
        meaning: "Whipped Cream",
        reason: "Placement example only",
        modifier: "X",
        placement: "before",
      }),
    ).toBe("X WC");
    expect(formatMark()).toBe("");
  });
});
