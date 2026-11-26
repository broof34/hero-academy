import { useEffect, useState } from "react";
import {
  Lightbulb,
  Star,
  Check,
  Timer,
  BookOpen,
  ArrowLeft,
  Coffee,
} from "lucide-react";
import {
  clock,
  type State,
  type Subject,
  grantStars,
  submitAnswer,
} from "./model";
import { topics, type Question } from "./learning";
import { MissionArt } from "./Art";
import { recordAnswer, clearEffects } from "./Effects";
import { ComboBadge } from "./ComicBurst";
import { ReadAloud } from "./ReadAloud";
import { cancelSpeech, questionInstruction, speak } from "./speech";
import { AdultGate, type Change } from "./Parent";
export { speak } from "./speech";
export function SkillChooser({
  subject,
  state,
  onStart,
  onBack,
}: {
  subject: Subject;
  state: State;
  onStart: (topic: string) => void;
  onBack: () => void;
}) {
  const [topic, setTopic] = useState("mix");
  return (
    <div className="focused" data-subject={subject}>
      <button className="text-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to base
      </button>
      <section className="mission-intro panel">
        <MissionArt kind={subject} />
        <p className="eyebrow">MISSION BRIEFING</p>
        <h1>
          {subject === "math"
            ? "Number Ops"
            : subject === "spelling"
              ? "Word Lab"
              : "Story Files"}
        </h1>
        <p>Five questions. Take your time. You can always ask for a hint.</p>
        <ReadAloud
          settings={state.settings}
          text="Choose a skill, then tap Let's go. There are five questions. Take your time. Hints and retries are always available."
        />
        <label>
          Choose a skill
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="mix">A little of everything</option>
            {topics[subject].map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            {state.custom.some((c) => c.subject === subject) && (
              <option value="custom">My grown-up’s questions</option>
            )}
          </select>
        </label>
        <button className="primary" onClick={() => onStart(topic)}>
          Let’s go
        </button>
        <small>★ Earn 1 star for each answer you solve</small>
      </section>
    </div>
  );
}
export function Mission({
  questions,
  state,
  change,
  onDone,
  onBack,
}: {
  questions: Question[];
  state: State;
  change: Change;
  onDone: () => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState(""),
    [hint, setHint] = useState(false),
    [solved, setSolved] = useState(false),
    [tiles, setTiles] = useState<number[]>([]);
  const [combo, setCombo] = useState(0);
  const [hadMiss, setHadMiss] = useState(false);
  const q = questions[index];
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document
      .querySelector<HTMLElement>(".question-panel h1")
      ?.focus({ preventScroll: true });
  }, [index]);
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    },
    [],
  );
  function check(value: string) {
    if (solved || !value.trim()) return;
    change((s) => submitAnswer(s, q, value));
    if (value.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
      setSolved(true);
      setFeedback("You did it! +1 star");
      setCombo(recordAnswer(true, !hadMiss));
    } else {
      setFeedback("Good effort! Try again.");
      setCombo(0);
      setHadMiss(true);
      recordAnswer(false);
      if (state.settings.spokenEncouragement)
        speak("Good effort. Try again, or tap I need a hint.", state.settings);
    }
  }
  function next() {
    clearEffects();
    cancelSpeech();
    if (index === questions.length - 1) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setAnswer("");
    setFeedback("");
    setHint(false);
    setSolved(false);
    setHadMiss(false);
    setTiles([]);
  }
  return (
    <div className="focused" data-subject={q.subject}>
      <div className="mission-top">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={18} /> Save & leave
        </button>
        <span>
          {index + 1} of {questions.length} questions
        </span>
        <span className="star-chip">
          <Star size={17} /> {index + Number(solved)} earned
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Mission progress"
        aria-valuenow={index + Number(solved)}
        aria-valuemin={0}
        aria-valuemax={questions.length}
      >
        <div
          style={{
            width: `${((index + Number(solved)) / questions.length) * 100}%`,
          }}
        />
      </div>
      <ComboBadge streak={combo} />
      <section className="question-panel panel">
        <ReadAloud
          settings={state.settings}
          text={questionInstruction(q)}
          label="Read aloud"
        />
        <p className="eyebrow">
          {q.subject.toUpperCase()} MISSION · ONE SMALL STEP
        </p>
        {q.passage && (
          <div className="passage">
            <BookOpen />
            {q.passage}
          </div>
        )}
        {q.picture && (
          <div
            className="picture"
            role="img"
            aria-label={
              q.answer.length > 1 && q.tiles
                ? "Word picture"
                : "Learning picture"
            }
          >
            {q.picture}
          </div>
        )}
        <h1 tabIndex={-1}>{q.prompt}</h1>
        {q.equation && (
          <div className="equation" data-testid="equation">
            {q.equation}
          </div>
        )}
        {(hint || q.prompt.includes("stars can")) &&
          q.objects !== undefined && (
            <div
              className="counting-aid"
              aria-label={`${q.objects} counting stars`}
            >
              {Array.from({ length: q.objects }, (_, i) => (
                <Star key={i} fill="currentColor" size={27} />
              ))}
            </div>
          )}
        {q.choices ? (
          <div className="answer-grid" role="group" aria-label="Answer choices">
            {q.choices.map((c) => (
              <button
                className={`answer ${solved && c === q.answer ? "correct" : ""}`}
                key={c}
                disabled={solved}
                onClick={() => check(c)}
              >
                {c}
                {solved && c === q.answer && <Check size={23} />}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              check(answer);
            }}
          >
            {q.tiles && (
              <div className="tiles" role="group" aria-label="Letter tiles">
                {q.tiles.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={solved || tiles.includes(i)}
                    onClick={() => {
                      setTiles([...tiles, i]);
                      setAnswer(answer + c);
                    }}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  className="text-button"
                  disabled={solved}
                  onClick={() => {
                    setTiles([]);
                    setAnswer("");
                  }}
                >
                  Clear
                </button>
              </div>
            )}
            <label className="answer-label">
              Your answer
              <input
                autoComplete="off"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={solved}
                maxLength={100}
              />
            </label>
            <button
              className="primary"
              disabled={solved || !answer.trim()}
              type="submit"
            >
              Check answer
            </button>
          </form>
        )}
        <div
          role="status"
          aria-live="polite"
          className={`feedback ${solved ? "success" : ""}`}
        >
          {feedback}
        </div>
        {hint && (
          <p className="hint">
            <Lightbulb size={20} />
            {q.hint}
          </p>
        )}
        <div className="question-tools">
          <button className="text-button" onClick={() => setHint(!hint)}>
            <Lightbulb size={19} />
            {hint ? "Hide hint" : "I need a hint"}
          </button>
        </div>
        {solved && (
          <button className="primary next" onClick={next}>
            {index === questions.length - 1
              ? "Finish mission"
              : "Next question"}
          </button>
        )}
      </section>
      <p className="calm-note">
        There’s no rush. Every try helps your brain grow.
      </p>
    </div>
  );
}
export function Homework({ state, change }: { state: State; change: Change }) {
  const [phase, setPhase] = useState<
    "ready" | "focus" | "paused" | "check" | "break" | "done"
  >("ready");
  const [seconds, setSeconds] = useState(state.settings.focusMinutes * 60);
  const [deadline, setDeadline] = useState(0),
    [gate, setGate] = useState(false);
  useEffect(() => {
    if (phase !== "focus" && phase !== "break") return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) setPhase(phase === "focus" ? "check" : "done");
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [phase, deadline]);
  function start() {
    setDeadline(Date.now() + seconds * 1000);
    setPhase("focus");
  }
  return (
    <div className="focused">
      <section className="panel homework-panel">
        <ReadAloud
          settings={state.settings}
          text={
            phase === "check"
              ? "Focus time finished. Ask a grown-up to confirm your effort."
              : phase === "break"
                ? "Take a break. Step away, stretch and get a drink."
                : phase === "done"
                  ? "Your focus round is complete. Great effort."
                  : "Choose one small piece of homework. Tap Start focus time. You can pause or ask your grown-up for help."
          }
        />
        <div className="round-icon">
          <Timer />
        </div>
        <p className="eyebrow">HOMEWORK HEADQUARTERS</p>
        <h1>
          {phase === "break"
            ? "Time to recharge."
            : phase === "done"
              ? "Look at your effort!"
              : "One little focus mission."}
        </h1>
        <p>
          {phase === "check"
            ? "Ask a grown-up to check your effort."
            : phase === "break"
              ? "Step away, stretch, and get a drink. Your brain deserves a rest."
              : phase === "done"
                ? "You showed up and tried. That’s what heroes do."
                : "Pick one small piece of homework. Clear a little space. You’ve got this."}
        </p>
        <div className="focus-clock">{clock(seconds)}</div>
        <p className="fine-print">
          {phase === "ready"
            ? "Your grown-up can adjust focus and break time in settings."
            : "The timer keeps going if you switch tabs. Stay on this screen to keep this focus round."}
        </p>
        <div className="button-row center">
          {phase === "ready" && (
            <button className="primary" onClick={start}>
              Start focus time
            </button>
          )}
          {phase === "focus" && (
            <button
              className="secondary"
              onClick={() => {
                setSeconds(
                  Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
                );
                setPhase("paused");
              }}
            >
              Pause
            </button>
          )}
          {phase === "paused" && (
            <button className="primary" onClick={start}>
              Keep going
            </button>
          )}
          {phase === "check" && (
            <button className="primary" onClick={() => setGate(true)}>
              Confirm effort · +3 stars
            </button>
          )}
          {phase === "done" && (
            <button
              className="primary"
              onClick={() => {
                setSeconds(state.settings.focusMinutes * 60);
                setPhase("ready");
              }}
            >
              Another focus mission
            </button>
          )}
        </div>
        {["ready", "focus", "paused"].includes(phase) && (
          <button className="text-button" onClick={() => setGate(true)}>
            Grown-up: reward persistence
          </button>
        )}
        {gate && (
          <AdultGate
            effort
            onCancel={() => setGate(false)}
            onAccept={() => {
              change((s) => grantStars(s, 3));
              setGate(false);
              setSeconds(state.settings.breakMinutes * 60);
              setDeadline(Date.now() + state.settings.breakMinutes * 60000);
              setPhase("break");
            }}
          />
        )}
      </section>
      <div className="tip-strip">
        <Lightbulb />
        <p>
          <strong>Effort counts.</strong> Trying, asking for help, and taking a
          break are all part of learning.
        </p>
      </div>
    </div>
  );
}
export function BreakTime({
  minutes,
  onDone,
  settings,
}: {
  minutes: number;
  settings?: State["settings"];
  onDone: () => void;
}) {
  const [deadline] = useState(() => Date.now() + minutes * 60000),
    [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const id = setInterval(
      () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))),
      250,
    );
    return () => clearInterval(id);
  }, [deadline]);
  return (
    <div className="focused">
      <section className="panel homework-panel">
        {settings && (
          <ReadAloud
            settings={settings}
            text="Take a screen-free break. Stretch, breathe and get a drink. Tap Back to base when you are ready."
          />
        )}
        <div className="round-icon">
          <Coffee />
        </div>
        <p className="eyebrow">A LITTLE RESET</p>
        <h1>{seconds ? "Even heroes take breaks." : "Ready when you are."}</h1>
        <p>
          Look away from the screen. Stretch up to the sky, sip some water, or
          find five blue things in the room.
        </p>
        <div className="focus-clock">{clock(seconds)}</div>
        <button className="primary" onClick={onDone}>
          Back to base
        </button>
      </section>
    </div>
  );
}
