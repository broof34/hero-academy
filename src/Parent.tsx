import { useRef, useState } from "react";
import { useModalFocus } from "./useModalFocus";
import { AudioFields } from "./AudioControls";
import { WeeklyManager } from "./spelling/WeeklyManager";
import {
  ChartNoAxesColumn,
  Check,
  Download,
  Plus,
  Settings2,
  ShieldCheck,
  SpellCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  freshState,
  MOTO_PROGRESS_KEY,
  grantStars,
  updateSettings,
  type State,
  type Settings,
  type Subject,
} from "./model";
export type Change = (fn: (s: State) => State) => void;
export function AdultGate({
  onAccept,
  onCancel,
  effort = false,
  confirmLabel,
}: {
  onAccept: () => void;
  onCancel: () => void;
  effort?: boolean;
  confirmLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useModalFocus(dialog);
  const [a] = useState(() => Math.floor(Math.random() * 4) + 6),
    [b] = useState(() => Math.floor(Math.random() * 4) + 6);
  const [answer, setAnswer] = useState(""),
    [wrong, setWrong] = useState(false);
  return (
    <dialog
      ref={dialog}
      className="modal-backdrop"
      aria-labelledby="adult-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <section className="modal">
        <button
          className="icon-button close"
          onClick={onCancel}
          aria-label="Close grown-up check"
        >
          <X />
        </button>
        <div className="round-icon">
          <ShieldCheck />
        </div>
        <p className="eyebrow">FOR YOUR GROWN-UP</p>
        <h2 id="adult-title">A quick grown-up check</h2>
        <p>
          Ask an adult to help here. This check keeps settings and effort
          rewards in grown-up hands.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(answer) === a * b) onAccept();
            else setWrong(true);
          }}
        >
          <label htmlFor="adult-answer" data-testid="adult-challenge">
            What is {a} × {b}?
          </label>
          <input
            autoFocus
            id="adult-answer"
            aria-label="Grown-up answer"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          {wrong && <p role="alert">Please ask your grown-up to try again.</p>}
          <button className="primary" type="submit">
            {confirmLabel ?? (effort ? "Confirm effort" : "Unlock settings")}
          </button>
        </form>
        <small>A friendly gate, not a secure parental lock.</small>
      </section>
    </dialog>
  );
}
export function exportFile(
  content: string,
  name = "hero-academy-progress.json",
) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Parent({
  state,
  change,
  onDone,
}: {
  state: State;
  change: Change;
  onDone: () => void;
}) {
  const [settings, setSettings] = useState<Settings>(state.settings);
  const [subject, setSubject] = useState<"math" | "spelling">("math");
  const [prompt, setPrompt] = useState(""),
    [answer, setAnswer] = useState(""),
    [notice, setNotice] = useState(""),
    [reset, setReset] = useState(false);
  const numeric = (
    key: keyof Settings,
    label: string,
    min: number,
    max: number,
  ) => (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={settings[key] as number}
        onChange={(e) =>
          setSettings({ ...settings, [key]: Number(e.target.value) })
        }
      />
    </label>
  );
  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">GROWN-UP ZONE</p>
          <h1>Grown-up dashboard</h1>
          <p>Learning settings, spelling lists, and saved progress.</p>
        </div>
        <ShieldCheck size={42} />
      </header>
      <nav className="adult-jumps" aria-label="Grown-up sections">
        <a href="#adult-settings">
          <Settings2 size={19} aria-hidden="true" /> Learning & rewards
        </a>
        <a href="#adult-spelling">
          <SpellCheck size={19} aria-hidden="true" /> Spelling lists
        </a>
        <a href="#adult-progress">
          <ChartNoAxesColumn size={19} aria-hidden="true" /> Progress
        </a>
        <a href="#adult-data">
          <Download size={19} aria-hidden="true" /> Export & reset
        </a>
      </nav>
      <div className="parent-grid">
        <WeeklyManager state={state} change={change} />
        <section className="panel" id="adult-settings">
          <h2>Learning & rewards</h2>
          <fieldset>
            <legend>Learning subjects</legend>
            {(["math", "spelling", "reading"] as Subject[]).map((s) => (
              <label className="check-label" key={s}>
                <input
                  type="checkbox"
                  checked={settings.subjects.includes(s)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      subjects: e.target.checked
                        ? [...settings.subjects, s]
                        : settings.subjects.filter((v) => v !== s),
                    })
                  }
                />
                {s[0].toUpperCase() + s.slice(1)}
              </label>
            ))}
          </fieldset>
          <label>
            Math difficulty
            <select
              value={settings.difficulty}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  difficulty: Number(e.target.value) as 10 | 20,
                })
              }
            >
              <option value="10">Numbers within 10</option>
              <option value="20">Numbers within 20</option>
            </select>
          </label>
          <div className="form-grid">
            {numeric("starCost", "Stars per ticket", 1, 100)}
            {numeric("gameMinutes", "Game minutes", 1, 15)}
            {numeric("focusMinutes", "Focus minutes", 1, 60)}
            {numeric("breakMinutes", "Break minutes", 1, 30)}
          </div>
          <details className="adult-audio">
            <summary>Sound & read aloud</summary>
            <AudioFields
              settings={state.settings}
              onChange={(patch) => change((s) => updateSettings(s, patch))}
            />
          </details>
          <label className="check-label">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) =>
                setSettings({ ...settings, reducedMotion: e.target.checked })
              }
            />
            Reduce decorative motion
          </label>
          <button
            className="primary"
            onClick={() => {
              const {
                subjects,
                difficulty,
                starCost,
                gameMinutes,
                focusMinutes,
                breakMinutes,
                reducedMotion,
              } = settings;
              change((s) =>
                updateSettings(s, {
                  subjects,
                  difficulty,
                  starCost,
                  gameMinutes,
                  focusMinutes,
                  breakMinutes,
                  reducedMotion,
                }),
              );
              onDone();
            }}
          >
            <Check size={18} /> Save settings
          </button>
          <p className="fine-print">
            One correct answer earns one star. Each ticket starts one timed
            game. Mistakes never take stars away.
          </p>
        </section>
        <div className="stack">
          <section className="panel" id="adult-progress">
            <h2>Look at that progress</h2>
            {(["math", "spelling", "reading"] as Subject[]).map((sub) => {
              const v = state.stats[sub];
              return (
                <div className="stat-line" key={sub}>
                  <strong>{sub[0].toUpperCase() + sub.slice(1)}</strong>
                  <span>
                    {v.correct} correct / {v.attempts} tries ·{" "}
                    {v.attempts
                      ? Math.round((v.correct / v.attempts) * 100)
                      : 0}
                    %
                  </span>
                </div>
              );
            })}
            <p className="fine-print">
              Accuracy includes retries. {state.totalStars} stars earned in
              total.
            </p>
            <h3>Celebrate effort</h3>
            <p>Recognize persistence, helping, or trying something hard.</p>
            <div className="button-row">
              <button
                className="secondary"
                onClick={() => {
                  change((s) => grantStars(s, 3));
                  setNotice("Three effort stars added.");
                }}
              >
                <Plus size={17} /> Grant 3 stars
              </button>
              <button
                className="secondary"
                onClick={() => {
                  change((s) => ({ ...s, tickets: s.tickets + 1 }));
                  setNotice("One game ticket added.");
                }}
              >
                Grant a ticket
              </button>
            </div>
            <p className="notice" role="status">
              {notice}
            </p>
          </section>
          <section className="panel" id="adult-data">
            <h2>Your browser, your data</h2>
            <p>
              No account, ads, or tracking. Progress is saved on this device.
              Clearing browser data clears progress.
            </p>
            <div className="button-row">
              <button
                className="secondary"
                onClick={() => exportFile(JSON.stringify(state, null, 2))}
              >
                <Download size={17} /> Export progress
              </button>
              <button
                className="text-button danger"
                onClick={() => setReset(true)}
              >
                <Trash2 size={17} /> Reset progress
              </button>
            </div>
            {reset && (
              <div className="warning">
                <p>
                  This clears stars, tickets, progress, custom questions, and
                  settings on this browser. Export first if you want a copy.
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    try {
                      localStorage.removeItem(MOTO_PROGRESS_KEY);
                    } catch {
                      // Reset in-memory progress even when browser storage is blocked.
                    }
                    const resetState = freshState();
                    change(() => resetState);
                    setSettings(resetState.settings);
                    setReset(false);
                    setNotice("Local progress reset.");
                  }}
                >
                  Yes, reset everything
                </button>
                <button className="text-button" onClick={() => setReset(false)}>
                  Keep my progress
                </button>
              </div>
            )}
          </section>
        </div>
        <section className="panel custom-panel">
          <h2>A mission of your own</h2>
          <p>
            Add a math question or spelling prompt. Choose “My grown-up’s
            questions” when starting a mission.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!prompt.trim() || !answer.trim()) return;
              change((s) => ({
                ...s,
                custom: [
                  ...s.custom,
                  {
                    id: crypto.randomUUID(),
                    subject,
                    prompt: prompt.trim(),
                    answer: answer.trim(),
                  },
                ].slice(-100),
              }));
              setPrompt("");
              setAnswer("");
              setNotice("Question added.");
            }}
          >
            <div className="custom-form">
              <label>
                Subject
                <select
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value as "math" | "spelling")
                  }
                >
                  <option value="math">Math</option>
                  <option value="spelling">Spelling</option>
                </select>
              </label>
              <label>
                Question
                <input
                  required
                  maxLength={250}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What is 2 plus 3?"
                />
              </label>
              <label>
                Correct answer
                <input
                  required
                  maxLength={50}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="5"
                />
              </label>
              <button className="secondary" type="submit">
                <Plus size={17} /> Add question
              </button>
            </div>
          </form>
          {state.custom.map((q) => (
            <div className="stat-line" key={q.id}>
              <span>
                <strong>{q.subject}</strong> · {q.prompt}{" "}
                <small>Answer: {q.answer}</small>
              </span>
              <button
                className="icon-button"
                aria-label={`Delete ${q.prompt}`}
                onClick={() =>
                  change((s) => ({
                    ...s,
                    custom: s.custom.filter((x) => x.id !== q.id),
                  }))
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </section>
        <section className="panel custom-panel">
          <h2>Recent celebrations</h2>
          {state.history.length ? (
            state.history.slice(0, 10).map((h, i) => (
              <div className="stat-line" key={i}>
                <span>
                  {h.subject === "effort"
                    ? "Effort & persistence"
                    : h.subject[0].toUpperCase() + h.subject.slice(1)}
                </span>
                <span>
                  +{h.stars} ★ · {new Date(h.at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p>Completed learning and effort rewards will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}
