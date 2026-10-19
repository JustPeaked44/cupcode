import { recipes, modifications } from "../data/recipes";
import { lookup } from "../data/catalog";
import {
  fields,
  infoFields,
  type Attempt,
  type Beverage,
  type Mark,
  type Scenario,
} from "./types";
const names = [
  "Alex",
  "Bea",
  "Carlo",
  "Dani",
  "Eli",
  "Faye",
  "Gab",
  "Isabel",
  "Jules",
  "Kai",
  "Luca",
  "Mika",
  "Nico",
  "Pia",
  "Rafa",
  "Sam",
];
export const blankAttempt = (): Attempt =>
  Object.fromEntries(
    [...fields, ...infoFields].map((field) => [field, ""]),
  ) as Attempt;
export function formatMark(mark?: Mark) {
  return mark
    ? mark.placement === "over"
      ? `${mark.code} (slash over)`
      : [mark.modifier, mark.code].filter(Boolean).join(" ")
    : "";
}
export function generateScenario(
  random: () => number = Math.random,
  previous?: Scenario,
): Scenario {
  const pick = <T>(items: readonly T[]): T =>
    items[
      Math.min(
        items.length - 1,
        Math.max(0, Math.floor(random() * items.length)),
      )
    ];
  const customer = pick(names.filter((name) => name !== previous?.customer));
  const count = pick([1, 2, 3]);
  const beverages: Beverage[] = Array.from({ length: count }, (_, index) => {
    const recipe = pick(recipes);
    const temperature = pick(recipe.temperatures);
    const size = pick(recipe.sizes);
    const selected = [];
    const usedFields = new Set();
    for (const id of recipe.modifications) {
      const mod = modifications.find((item) => item.id === id)!;
      if (
        !usedFields.has(mod.field) &&
        (!mod.temperatures || mod.temperatures.includes(temperature)) &&
        random() < 0.17
      ) {
        selected.push(mod);
        usedFields.add(mod.field);
      }
    }
    const drink = lookup("Drink", recipe.code, recipe.category);
    const markings: Beverage["markings"] = {
      Drink: {
        code: recipe.code,
        meaning: drink.meaning,
        reason: `The customer ordered ${recipe.name}.`,
      },
    };
    for (const mod of selected) markings[mod.field] = { ...mod.mark };
    const phrase = `a ${size.toLowerCase()} ${temperature === "Blended" ? "" : `${temperature.toLowerCase()} `}${recipe.name}${selected.length ? `, ${selected.map((mod) => mod.phrase).join(" and ")}` : ""}`;
    return {
      id: `drink-${index + 1}`,
      recipe,
      size,
      temperature,
      modifications: selected,
      markings,
      phrase,
    };
  });
  let signature = JSON.stringify(
    beverages.map((b) => [
      b.recipe.id,
      b.size,
      b.temperature,
      b.modifications.map((m) => m.id),
    ]),
  );
  // Changing a verified size guarantees progress even with a constant injected RNG.
  if (signature === previous?.signature) {
    const first = beverages[0];
    const nextSize =
      first.recipe.sizes[
        (first.recipe.sizes.indexOf(first.size) + 1) % first.recipe.sizes.length
      ];
    first.phrase = first.phrase.replace(
      `a ${first.size.toLowerCase()} `,
      `a ${nextSize.toLowerCase()} `,
    );
    first.size = nextSize;
    signature = JSON.stringify(
      beverages.map((b) => [
        b.recipe.id,
        b.size,
        b.temperature,
        b.modifications.map((m) => m.id),
      ]),
    );
  }
  const toGo = random() < 0.75;
  const bag = toGo && random() < 0.45;
  const opening = pick([
    "Hi! Can I get",
    "Hello! I'd like",
    "Good day! Could I have",
    "Hey there, may I order",
  ]);
  const requests = beverages
    .map((b, index) =>
      index === 0
        ? b.phrase
        : `${pick(["Also,", "And", "I'd also like"])} ${b.phrase}`,
    )
    .join(". ");
  const dialogue = `${opening} ${requests}? The name is ${customer}. ${toGo ? "To go, please." : "For here, please."}${bag ? " Could I have a carrier bag, too?" : ""} ${pick(["That's all, thank you.", "Thanks so much!", "Thank you!"])}`;
  return {
    id: `${previous ? Number(previous.id) + 1 : 1}`,
    customer,
    toGo,
    bag,
    beverages,
    dialogue,
    signature,
    voiceVariant: previous ? previous.voiceVariant + 1 : pick([0, 1, 2, 3]),
  };
}
export function referenceInfo(scenario: Scenario) {
  return {
    "Customer Name": scenario.customer,
    "To-Go / Carrier Bag": scenario.bag ? "->" : "",
    Other: "",
  };
}
export function studyTips(beverage: Beverage) {
  const tips = [
    `${beverage.recipe.code} identifies ${beverage.recipe.name} in the Drink field.`,
  ];
  if (beverage.markings.Milk)
    tips.push(
      `${beverage.markings.Milk.code} means ${beverage.markings.Milk.meaning} in Milk. Field context matters: A in Drink means Caffè Americano.`,
    );
  if (beverage.markings.Custom?.modifier)
    tips.push(
      beverage.markings.Custom.placement === "over"
        ? "No uses a slash over WC. The crossed-out standalone No Whipped Cream entry is not used."
        : `${beverage.markings.Custom.modifier} goes before WC; the modifier changes Whipped Cream.`,
    );
  if (beverage.markings.Syrup)
    tips.push(
      "Syrup and sauce share the Syrup field. A topping belongs in Custom.",
    );
  if (beverage.markings.Shots)
    tips.push(
      "The shot count is the requested total. Do not infer an extra-shot code or an undocumented standard count.",
    );
  if (tips.length === 1)
    tips.push(
      "Blank fields mean no explicit modification to mark in this exercise. Standard recipe quantities are not inferred.",
    );
  return tips;
}
