import rows from "./catalog.json";
import type { Field } from "../domain/types";
export interface CodeEntry {
  id: string;
  field: string;
  category: string;
  code: string;
  meaning: string;
  status: string;
  sourceLine: number;
}
export const catalog: CodeEntry[] = rows;
export function lookup(field: Field, code: string, category?: string) {
  const entry = catalog.find(
    (row) =>
      row.field === field &&
      row.code === code &&
      row.status === "active" &&
      (!category || row.category === category),
  );
  if (!entry)
    throw new Error(
      `No active manual definition: ${field}/${category ?? "*"}/${code}`,
    );
  return entry;
}
export const combinedExamples = [
  { fields: "Syrup C + Drink M", meaning: "Caramel Mocha" },
  { fields: "Syrup C + Drink CJF", meaning: "Caramel Coffee Jelly" },
  {
    fields: "Custom CJ + Drink VCFGMTL",
    meaning: "Vanilla Cold Foam Golden Monkey Tea Latte with Coffee Jelly",
  },
  {
    fields: "Custom CJ + Drink VCFBTL",
    meaning: "Vanilla Cold Foam Black Tea Latte with Coffee Jelly",
  },
  {
    fields: "Syrup V / LS",
    meaning:
      "Vanilla Less Sweet. V is supplied by this example only; no separate Vanilla row exists.",
  },
];
