import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Check,
  ChevronRight,
  Coffee,
  Eye,
  Headphones,
  Leaf,
  LogOut,
  PencilLine,
  RotateCcw,
  Shuffle,
  Square,
  Volume2,
} from "lucide-react";
import { Cup, HeroCup } from "./components/Cup";
import { Answer } from "./components/Answer";
import { Reference } from "./components/Reference";
import { generateScenario, blankAttempt } from "./domain/scenario";
import type { Attempt, InputField, Scenario } from "./domain/types";
import { useSpeech } from "./audio/useSpeech";
import type { VoicePreference } from "./audio/speech";
type Page = "home" | "practice" | "reference";
const readPage = (): Page =>
  location.hash === "#practice"
    ? "practice"
    : location.hash === "#reference"
      ? "reference"
      : "home";
export default function App() {
  const [page, setPage] = useState<Page>(readPage);
  const [scenario, setScenario] = useState<Scenario | null>(() =>
    readPage() === "practice" ? generateScenario() : null,
  );
  const currentScenario = useRef(scenario);
  const [attempts, setAttempts] = useState<Attempt[]>(
    () => scenario?.beverages.map(blankAttempt) || [],
  );
  const [revealed, setRevealed] = useState(false);
  const [mode, setMode] = useState<"typing" | "mental">("typing");
  const [help, setHelp] = useState(false);
  const speech = useSpeech();
  const workspace = useRef<HTMLDivElement>(null);
  const [visibleCup, setVisibleCup] = useState(0);
  function reset(next: Scenario) {
    currentScenario.current = next;
    setScenario(next);
    setAttempts(next.beverages.map(blankAttempt));
    setRevealed(false);
    setVisibleCup(0);
    workspace.current?.scrollTo({ left: 0 });
  }
  function navigate(next: Page) {
    if (next !== "practice") {
      speech.stop();
      currentScenario.current = null;
      setScenario(null);
      setAttempts([]);
      setRevealed(false);
      setMode("typing");
    }
    setPage(next);
    location.hash = next === "home" ? "" : next;
  }
  function start() {
    const next = generateScenario();
    reset(next);
    navigate("practice");
    speech.play(next.dialogue, next.voiceVariant);
  }
  function nextOrder() {
    const next = generateScenario(
      Math.random,
      currentScenario.current || undefined,
    );
    reset(next);
    speech.play(next.dialogue, next.voiceVariant);
  }
  function retry() {
    if (!scenario) return;
    reset(scenario);
    speech.play(scenario.dialogue, scenario.voiceVariant);
  }
  function change(index: number, field: InputField, value: string) {
    setAttempts((previous) =>
      previous.map((attempt, i) =>
        i === index ? { ...attempt, [field]: value } : attempt,
      ),
    );
  }
  useEffect(() => {
    function onHash() {
      const next = readPage();
      setPage(next);
      if (next !== "practice") {
        speech.stop();
        currentScenario.current = null;
        setScenario(null);
        setAttempts([]);
        setRevealed(false);
        setMode("typing");
      } else if (!currentScenario.current) reset(generateScenario());
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // Speech is triggered by actions, never by render or scenario effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    document.title = `${page === "practice" ? "Practice" : page === "reference" ? "Code Library" : "Barista Cup-Marking Trainer"} — CupCode`;
    document
      .querySelector<HTMLElement>("main h1")
      ?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [page]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.querySelector("main");
          if (main) {
            main.tabIndex = -1;
            main.focus();
          }
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              navigate("home");
            }}
            aria-label="CupCode home"
          >
            <span className="brand-icon">
              <Coffee size={23} strokeWidth={1.7} />
            </span>
            <span>
              cupcode<span className="brand-dot">.</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a
              className={page === "reference" ? "nav-link active" : "nav-link"}
              href="#reference"
              onClick={(event) => {
                event.preventDefault();
                navigate("reference");
              }}
            >
              <BookOpen size={16} />
              <span>Code library</span>
            </a>
            {page === "practice" ? (
              <button className="nav-link" onClick={() => navigate("home")}>
                <LogOut size={16} />
                Exit
              </button>
            ) : (
              <button className="header-start" onClick={start}>
                Practice <ArrowUpRight size={16} />
              </button>
            )}
          </nav>
        </div>
      </header>
      {page === "home" && (
        <main id="main" className="home appear">
          <section className="hero">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span />A LITTLE PRACTICE, EVERY DAY.
              </div>
              <h1 tabIndex={-1}>
                Hear the order.
                <br />
                Mark the cup.
                <br />
                <span>Master the codes.</span>
              </h1>
              <p className="hero-subtitle">Barista Cup-Marking Trainer</p>
              <p className="hero-description">
                Build confidence before your next shift. Realistic orders, a cup
                to make your own, and the meaning behind every mark.
              </p>
              <button className="button primary start-button" onClick={start}>
                Start Practice <ArrowRight size={19} />
              </button>
              <p className="start-note">
                No account. No scores. Just you and the next cup.
              </p>
            </div>
            <HeroCup />
          </section>
          <section className="how-section" aria-label="How practice works">
            <div className="how-intro">
              <span className="eyebrow">YOUR DAILY REPS</span>
              <h2>Find your flow.</h2>
              <p>
                A familiar routine.
                <br />A little more confidence each time.
              </p>
            </div>
            {[
              {
                number: "01",
                Icon: Headphones,
                title: "Take the order",
                text: "Listen to your customer, or read at your own pace.",
              },
              {
                number: "02",
                Icon: PencilLine,
                title: "Make your mark",
                text: "Type directly on the cup, or practice in your head.",
              },
              {
                number: "03",
                Icon: Eye,
                title: "See it clearly",
                text: "Reveal the codes and learn what each one means.",
              },
            ].map(({ number, Icon, title, text }) => (
              <div className="how-step" key={number}>
                <div className="step-top">
                  <Icon size={22} strokeWidth={1.5} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </section>
          <div className="home-bottom">
            <span>
              <Leaf size={17} />
              Made for a calmer learning curve.
            </span>
            <a
              href="#reference"
              onClick={(e) => {
                e.preventDefault();
                navigate("reference");
              }}
            >
              Get to know the six fields <ArrowRight size={16} />
            </a>
          </div>
        </main>
      )}
      {page === "practice" && scenario && (
        <main id="main" className="practice appear">
          <div className="practice-heading">
            <div>
              <span className="eyebrow">THE PRACTICE COUNTER</span>
              <h1 tabIndex={-1}>One order. A little more confident.</h1>
            </div>
            <span className="session-label">
              <span />
              Your practice stays here, in this session.
            </span>
          </div>
          <section className="order-panel" aria-labelledby="customer-heading">
            <div className="customer-meta">
              <div className="customer-avatar" aria-hidden="true">
                {scenario.customer.slice(0, 1)}
              </div>
              <div>
                <span className="eyebrow">YOUR CUSTOMER</span>
                <h2 id="customer-heading">
                  {scenario.customer}
                  <span>
                    {" "}
                    · {scenario.beverages.length}{" "}
                    {scenario.beverages.length === 1 ? "drink" : "drinks"}
                  </span>
                </h2>
              </div>
              <span className="order-type">
                {scenario.toGo ? "To go" : "For here"}
              </span>
            </div>
            <p className="dialogue">“{scenario.dialogue}”</p>
            <div className="audio-toolbar">
              <div className="audio-buttons">
                <button
                  className="text-button"
                  onClick={() =>
                    speech.play(scenario.dialogue, scenario.voiceVariant)
                  }
                >
                  <Volume2 size={17} />
                  Replay Order
                </button>
                <button
                  className="text-button muted-button"
                  onClick={speech.stop}
                >
                  <Square size={13} />
                  Stop Audio
                </button>
              </div>
              <label className="voice-select">
                Voice{" "}
                <select
                  value={speech.preference}
                  onChange={(e) =>
                    speech.setPreference(e.target.value as VoicePreference)
                  }
                >
                  <option value="varied">Varied</option>
                  <option value="female">Prefer female</option>
                  <option value="male">Prefer male</option>
                </select>
              </label>
            </div>
            <div className="audio-status" role="status">
              <AudioLines
                size={14}
                className={speech.status.speaking ? "speaking" : ""}
              />
              <span>
                {speech.status.text}
                {speech.status.voice ? ` · ${speech.status.voice}` : ""}
              </span>
            </div>
            <p className="voice-note">
              Voice preferences are best effort; your device may provide only
              one voice.{" "}
              {
                speech.voices.filter((voice) => voice.lang.startsWith("en"))
                  .length
              }{" "}
              English voices available.
            </p>
          </section>
          <section
            className="workspace-section"
            aria-labelledby="workspace-heading"
          >
            <div className="workspace-heading">
              <div>
                <span className="eyebrow">
                  {revealed ? "YOUR MARKINGS + REFERENCE" : "YOUR TURN"}
                </span>
                <h2 id="workspace-heading">
                  {mode === "typing"
                    ? "Make your mark."
                    : "Picture your markings."}
                </h2>
              </div>
              <div
                className="mode-switch"
                role="group"
                aria-label="Practice style"
              >
                <button
                  aria-pressed={mode === "typing"}
                  onClick={() => setMode("typing")}
                >
                  <PencilLine size={15} />
                  Typing
                </button>
                <button
                  aria-pressed={mode === "mental"}
                  onClick={() => setMode("mental")}
                >
                  <Eye size={15} />
                  Mental
                </button>
              </div>
            </div>
            <div className="workspace-instruction">
              <p>
                {mode === "typing"
                  ? "Tap a field and type its code. Leave standard, unmodified fields blank."
                  : "Leave the cups blank and work through the order in your head. Reveal whenever you’re ready."}
              </p>
              <button
                className="help-toggle"
                aria-expanded={help}
                onClick={() => setHelp(!help)}
              >
                The six fields{" "}
                <ChevronRight
                  size={15}
                  style={{ transform: help ? "rotate(90deg)" : undefined }}
                />
              </button>
            </div>
            {help && (
              <aside className="field-help">
                <b>Decaf → Shots → Syrup → Milk → Custom → Drink</b>
                <p>
                  Syrup and sauce share one field. Custom is for instructions
                  and toppings. Drink identifies the beverage. Mark only the
                  requested changes in this exercise; do not infer default
                  quantities. For “no,” the answer places a slash over the
                  affected code.
                </p>
                <button className="text-button" onClick={() => setHelp(false)}>
                  Got it <Check size={14} />
                </button>
              </aside>
            )}
            <div
              className={`cup-workspace count-${scenario.beverages.length}`}
              ref={workspace}
              tabIndex={0}
              aria-label={`${scenario.beverages.length} cups. Scroll horizontally on mobile to reach each drink.`}
              onScroll={() => {
                const container = workspace.current;
                if (container?.firstElementChild)
                  setVisibleCup(
                    Math.round(
                      container.scrollLeft /
                        (container.firstElementChild.getBoundingClientRect()
                          .width +
                          24),
                    ),
                  );
              }}
            >
              {scenario.beverages.map((beverage, index) => (
                <Cup
                  key={`${scenario.id}-${beverage.id}`}
                  beverage={beverage}
                  index={index}
                  attempt={attempts[index] || blankAttempt()}
                  onChange={(field, value) => change(index, field, value)}
                  revealed={revealed}
                  scenario={scenario}
                />
              ))}
            </div>
            {scenario.beverages.length > 1 && (
              <div className="cup-navigation">
                <span>
                  All {scenario.beverages.length} cups belong to this order
                </span>
                <div>
                  {scenario.beverages.map((beverage, index) => (
                    <button
                      key={beverage.id}
                      className={visibleCup === index ? "selected" : ""}
                      aria-label={`Go to Drink ${index + 1}`}
                      onClick={() => {
                        workspace.current?.children[index]?.scrollIntoView({
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)",
                          ).matches
                            ? "instant"
                            : "smooth",
                          block: "nearest",
                          inline: "start",
                        });
                        setVisibleCup(index);
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <span className="swipe-hint">
                  Swipe for more <ArrowRight size={13} />
                </span>
              </div>
            )}
            <div className="practice-actions">
              <button
                className="button primary"
                disabled={revealed}
                onClick={() => {
                  speech.stop();
                  setRevealed(true);
                }}
              >
                <Eye size={18} />
                {revealed ? "Answer Revealed" : "Show Answer"}
              </button>
              <button className="button secondary" onClick={retry}>
                <RotateCcw size={17} />
                Try Again
              </button>
              <button className="button generate" onClick={nextOrder}>
                <Shuffle size={17} />
                Generate Order <ArrowRight size={16} />
              </button>
            </div>
            <p className="practice-footnote">
              {revealed
                ? "Compare at your own pace. Try Again repeats this exact customer order."
                : "No pressure to fill every field. This is practice, not a test."}
            </p>
          </section>
          {revealed && <Answer scenario={scenario} />}
        </main>
      )}
      {page === "reference" && (
        <div id="main">
          <Reference />
        </div>
      )}
      <footer className="site-footer">
        <div>
          <span className="footer-brand">cupcode.</span>
          <p>
            Independent educational tool. Not affiliated with or endorsed by
            Starbucks.
          </p>
        </div>
        <span>Made for practice, one cup at a time.</span>
      </footer>
    </>
  );
}
