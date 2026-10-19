import { Snowflake, Flame, Blend } from "lucide-react";
import {
  fields,
  infoFields,
  type Attempt,
  type Beverage,
  type InputField,
  type Mark,
  type Scenario,
} from "../domain/types";
import { referenceInfo } from "../domain/scenario";
export function MarkValue({ mark }: { mark?: Mark }) {
  if (!mark) return <span className="blank-mark">Blank</span>;
  return (
    <span className="mark-value">
      {mark.placement === "over" ? (
        <span className="slash-code" aria-label={`slash over ${mark.code}`}>
          <i aria-hidden="true">/</i>
          {mark.code}
        </span>
      ) : (
        <>
          {mark.modifier && <span>{mark.modifier} </span>}
          {mark.code}
        </>
      )}
    </span>
  );
}
export function Cup({
  beverage,
  index,
  attempt,
  onChange,
  revealed,
  scenario,
}: {
  beverage: Beverage;
  index: number;
  attempt: Attempt;
  onChange: (field: InputField, value: string) => void;
  revealed: boolean;
  scenario: Scenario;
}) {
  const Icon =
    beverage.temperature === "Hot"
      ? Flame
      : beverage.temperature === "Iced"
        ? Snowflake
        : Blend;
  const info = referenceInfo(scenario);
  return (
    <article
      className="cup-station"
      aria-label={`Drink ${index + 1} workspace`}
    >
      <div className="cup-caption">
        <span className="eyebrow">DRINK {index + 1}</span>
        <span className="temp">
          <Icon size={13} />
          {beverage.size} · {beverage.temperature}
        </span>
      </div>
      <div className={`cup ${beverage.temperature === "Hot" ? "hot" : "cold"}`}>
        <div className="cup-lid" aria-hidden="true" />
        <div className="cup-body" aria-hidden="true" />
        <div className="cup-content">
          <div className="cup-wordmark" aria-hidden="true">
            cupcode<span>THE DAILY PRACTICE</span>
          </div>
          <div className="cup-form">
            <div className="marking-fields">
              {fields.map((field) => (
                <label className="marking-row" key={field}>
                  <span>{field}</span>
                  <span className="input-and-reference">
                    <input
                      aria-label={`Drink ${index + 1} ${field}`}
                      value={attempt[field]}
                      onChange={(event) => onChange(field, event.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {revealed && (
                      <span className="inline-reference">
                        <MarkValue mark={beverage.markings[field]} />
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="customer-lines">
              {infoFields.map((field) => (
                <label key={field}>
                  <span>{field}</span>
                  <input
                    aria-label={`Drink ${index + 1} ${field}`}
                    value={attempt[field]}
                    onChange={(event) => onChange(field, event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {revealed && (
                    <span className="info-reference">
                      {info[field] || "Blank"}
                    </span>
                  )}
                </label>
              ))}
              <span className="cup-line-note">Make it personal.</span>
            </div>
          </div>
          <span className="cup-bottom-note">
            {revealed
              ? "Your entry above · reference below"
              : "A little practice. A lot of confidence."}
          </span>
        </div>
      </div>
    </article>
  );
}
export function HeroCup() {
  return (
    <div
      className="hero-cup-scene"
      aria-label="Illustrated practice cup with six marking fields"
      role="img"
    >
      <div className="orbital-label label-top">
        <span>01</span> Listen closely.
      </div>
      <div className="demo-cup">
        <div className="demo-lid" />
        <div className="demo-body" />
        <div className="demo-print">
          <span className="demo-brand">cupcode</span>
          <div className="demo-fields">
            {fields.map((field) => (
              <div key={field}>
                <span>{field}</span>
                <b>{field === "Milk" ? "O" : field === "Drink" ? "L" : ""}</b>
              </div>
            ))}
          </div>
          <span className="demo-name">Alex ♡</span>
        </div>
      </div>
      <div className="orbital-label label-bottom">
        <span>02</span> Make your mark.<small>One cup at a time.</small>
      </div>
      <div className="scene-caption">YOUR NEXT GOOD HABIT.</div>
    </div>
  );
}
