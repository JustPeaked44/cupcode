import { useState } from "react";
import { Search, BookOpen, ArrowUpRight } from "lucide-react";
import { catalog, combinedExamples } from "../data/catalog";
import { fields } from "../domain/types";
export function Reference() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All");
  const entries = catalog.filter(
    (entry) =>
      (field === "All" || entry.field === field) &&
      `${entry.code} ${entry.meaning} ${entry.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="reference-page appear">
      <span className="eyebrow">THE REFERENCE LIBRARY</span>
      <h1 tabIndex={-1}>
        Small codes.
        <br />
        Clear meanings.
      </h1>
      <p className="lead">
        The full FY25 manual catalog, kept in its original field context.
      </p>
      <div className="reference-warning">
        <BookOpen size={20} />
        <p>
          Source appearance does not confirm current availability. Crossed-out
          entries are retained for reference and excluded from practice.
          Duplicate source rows are preserved.
        </p>
      </div>
      <div className="reference-controls">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Search beverage codes"
            placeholder="Search a code, drink, or meaning…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="filter-label">
          Field{" "}
          <select value={field} onChange={(e) => setField(e.target.value)}>
            {["All", ...fields].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="result-count" role="status">
        {entries.length} source entries
      </p>
      <div className="catalog-grid">
        {entries.map((entry) => (
          <article
            className={`catalog-entry ${entry.status === "crossed-out" ? "retired" : ""}`}
            key={entry.id}
          >
            <div>
              <span className="code-symbol">{entry.code}</span>
              <span className="field-tag">{entry.field}</span>
            </div>
            <h2>{entry.meaning}</h2>
            <span className="catalog-category">
              {entry.category} · manual line {entry.sourceLine}
            </span>
            {entry.status === "crossed-out" && (
              <strong>Crossed out in source · reference only</strong>
            )}
          </article>
        ))}
      </div>
      {!entries.length && (
        <p className="empty-state">
          No matching codes. Try another term or select All fields.
        </p>
      )}
      <section className="notation-guide">
        <h2>Placement is part of the code.</h2>
        <p>
          <b>Lt</b> before a code means Light. <b>X</b> before a code means
          Extra. A <b>slash over</b> a code means No; it does not replace the
          underlying code. Type your attempt in any readable notation; the
          reveal illustrates the placement.
        </p>
        <p>
          Syrup and Sauce share the Syrup field. LS and NS are marked together
          with the syrup ID. The slash in the printed V / LS example is
          preserved, separately from the Custom slash-over instruction.
        </p>
        <div className="combined-examples">
          {combinedExamples.map((example) => (
            <div key={example.fields}>
              <b>{example.fields}</b>
              <p>{example.meaning}</p>
            </div>
          ))}
        </div>
        <a href="/beverage-id-codes.md" target="_blank" rel="noreferrer">
          Read the supplied manual transcription <ArrowUpRight size={15} />
        </a>
      </section>
    </main>
  );
}
