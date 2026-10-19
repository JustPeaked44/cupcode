import { readFileSync, writeFileSync } from "node:fs";
const manual = readFileSync(
  new URL("../docs/beverage-id-codes.md", import.meta.url),
  "utf8",
);
const entries = [];
let section = "",
  field = "";
for (const [index, line] of manual.split(/\r?\n/).entries()) {
  const heading = line.match(/^### (\d+\.\d+) (.+)/);
  if (heading) {
    section = heading[2];
    field = heading[1].startsWith("2.")
      ? "Drink"
      : section === "Sauce"
        ? "Syrup"
        : section;
  }
  const row = line.match(
    /^\| `([^`]+)` \| ([^|]+) \| (Shown normally|Crossed out in source) \|/,
  );
  if (row)
    entries.push({
      id: `manual-${index + 1}`,
      field,
      category: section,
      code: row[1],
      meaning: row[2].trim(),
      status: row[3] === "Shown normally" ? "active" : "crossed-out",
      sourceLine: index + 1,
    });
}
writeFileSync(
  new URL("../src/data/catalog.json", import.meta.url),
  JSON.stringify(entries, null, 2) + "\n",
);
console.log(
  `Parsed ${entries.length} source rows; ${entries.filter((e) => e.status === "crossed-out").length} crossed-out entries retained.`,
);
