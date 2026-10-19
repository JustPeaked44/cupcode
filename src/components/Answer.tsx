import { Lightbulb, BookOpen } from "lucide-react";
import { fields, type Scenario } from "../domain/types";
import { referenceInfo, studyTips } from "../domain/scenario";
import { MarkValue } from "./Cup";
export function Answer({ scenario }: { scenario: Scenario }) {
  const info = referenceInfo(scenario);
  return (
    <section className="answers appear" aria-labelledby="answer-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LOOK. COMPARE. REMEMBER.</span>
          <h2 id="answer-title">Every mark has a meaning.</h2>
        </div>
        <span className="quiet-label">Self-study, without a score.</span>
      </div>
      <p className="answer-intro">
        Your entries stay on the cups. These are the reference markings for this
        exercise; blank fields do not imply a complete production recipe.
      </p>
      <div className="answer-grid">
        {scenario.beverages.map((beverage, index) => (
          <article className="answer-card" key={beverage.id}>
            <span className="eyebrow">DRINK {index + 1}</span>
            <h3>{beverage.recipe.name}</h3>
            <p className="answer-spec">
              {beverage.size} · {beverage.temperature}
            </p>
            <dl>
              {fields.map((field) => {
                const mark = beverage.markings[field];
                return (
                  <div key={field}>
                    <dt>{field}</dt>
                    <dd>
                      <MarkValue mark={mark} />
                      <p>
                        {mark
                          ? `${mark.meaning}. ${mark.reason}${mark.modifier ? ` Place ${mark.modifier} ${mark.placement === "over" ? "over" : "before"} ${mark.code}.` : ""}`
                          : "No explicit modification to mark in this exercise."}
                      </p>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="answer-info">
              <b>Customer information</b>
              <p>
                Name: {info["Customer Name"]}
                <br />
                Carrier bag:{" "}
                {info["To-Go / Carrier Bag"] || "Blank — no bag requested"}
                <br />
                Other: Blank
              </p>
              {scenario.bag && (
                <small>
                  → Typed as -&gt;. User-defined training convention, not a
                  manual code.
                </small>
              )}
            </div>
            <div className="study-tip">
              <Lightbulb size={18} />
              <div>
                <b>Make it stick</b>
                {studyTips(beverage).map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>
            </div>
            <a
              className="source-link"
              href={beverage.recipe.source}
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen size={14} />
              Recipe source
            </a>
            {beverage.modifications.some((mod) =>
              /about.starbucks/.test(mod.source),
            ) && (
              <p className="assumption-note">
                Includes general customization guidance applied as a training
                assumption; local availability may vary.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
