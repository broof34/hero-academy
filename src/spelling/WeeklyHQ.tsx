import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Blocks,
  Type,
  Eye,
  Headphones,
  ClipboardList,
  Target,
  Shuffle,
  Star,
  ArrowLeft,
  Volume2,
  ShieldCheck,
  Check,
  CalendarDays,
  X,
  Delete,
} from "lucide-react";
import type { State } from "../model";
import { AdultGate, type Change } from "../Parent";
import { speak } from "../Activities";
import type {
  PracticeMode,
  PracticeItem,
  WeeklySession,
  SessionResult,
  WordResult,
  WeeklyData,
} from "./types";
import {
  weeklyData,
  wordProgress,
  isMastered,
  independentStreak,
  beginPractice,
  submitTurn,
  abandonPractice,
  markAssisted,
  missingLetters,
  fillMissing,
  normalizeWord,
} from "./engine";
import { shuffle } from "./adaptive";
const modeInfo = [
  {
    id: "flashcards",
    name: "Flashcards",
    icon: BookOpen,
    description: "Discover the word. Hear its secret code.",
  },
  {
    id: "builder",
    name: "Word Builder",
    icon: Blocks,
    description: "Put every letter in its place.",
  },
  {
    id: "missing",
    name: "Missing Letters",
    icon: Type,
    description: "Restore the missing parts of the code.",
  },
  {
    id: "cover",
    name: "Look, Cover, Spell, Check",
    icon: Eye,
    description: "Study it. Hide it. Remember it.",
  },
  {
    id: "listen",
    name: "Listen and Spell",
    icon: Headphones,
    description: "Hear a transmission. Spell it on your own.",
  },
  {
    id: "test",
    name: "Practice Test",
    icon: ClipboardList,
    description: "All your words. Results when you finish.",
  },
  {
    id: "tricky",
    name: "Tricky Word Review",
    icon: Target,
    description: "Give your tricky words another try.",
  },
  {
    id: "mixed",
    name: "Mixed Training",
    icon: Shuffle,
    description: "A mission chosen from your word progress.",
  },
] as const;
const modeName = (mode: PracticeMode) =>
  modeInfo.find((m) => m.id === mode)!.name;
const formatDate = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
const tricky = (d: WeeklyData, word: string) => {
  const p = wordProgress(d, word);
  return p.lastMissed > 0 && (p.lastMissed >= p.lastSeen || !isMastered(p));
};
export function WeeklyHQ({
  state,
  change,
  onGeneral,
  onManage,
}: {
  state: State;
  change: Change;
  onGeneral: () => void;
  onManage: () => void;
}) {
  const data = weeklyData(state),
    list = data.lists.find((l) => l.id === data.activeListId && !l.archived);
  const [viewId, setViewId] = useState<string | null>(null);
  function start(mode: PracticeMode) {
    if (!list) return;
    const next = beginPractice(state, list.id, mode);
    const session = weeklyData(next).current;
    if (!session) return;
    change(() => next);
    setViewId(session.id);
  }
  if (viewId)
    return (
      <PracticeSession
        state={state}
        change={change}
        sessionId={viewId}
        onBack={() => setViewId(null)}
        onReview={() => {
          setViewId(null);
          start("tricky");
        }}
      />
    );
  const mastered =
    list?.words.filter((w) => isMastered(wordProgress(data, w.text))).length ??
    0;
  const difficult = list?.words.filter((w) => tricky(data, w.text)).length ?? 0;
  const recommended: PracticeMode = difficult
    ? "tricky"
    : list?.words.some(
          (w) =>
            wordProgress(data, w.text).recognition === 0 &&
            wordProgress(data, w.text).lastSeen === 0,
        )
      ? "flashcards"
      : "mixed";
  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">HERO ACADEMY · SECRET CODE DIVISION</p>
          <h1>Spelling HQ</h1>
          <p>Your school words. Your next superpower.</p>
        </div>
        <button className="secondary" onClick={onGeneral}>
          General spelling practice
        </button>
      </header>
      {data.current && (
        <section className="notice-banner weekly-resume">
          <div>
            <strong>Your mission is saved.</strong>
            <p>
              {data.current.listName} · {modeName(data.current.mode)} ·{" "}
              {data.current.index} of {data.current.items.length} words complete
            </p>
          </div>
          <button
            className="primary"
            onClick={() => setViewId(data.current!.id)}
          >
            Resume spelling mission
          </button>
          <button
            className="text-button"
            onClick={() => {
              if (
                confirm(
                  "End this spelling session? Stars already earned stay safe.",
                )
              )
                change(abandonPractice);
            }}
          >
            End this session
          </button>
        </section>
      )}
      {!list ? (
        <section className="panel weekly-empty">
          <div className="round-icon">
            <BookOpen />
          </div>
          <h2>Your weekly codes await.</h2>
          <p>
            Ask your grown-up to add this week’s school spelling words. They’ll
            become flashcards, word-building missions, listening practice, and a
            practice test.
          </p>
          <button className="primary" onClick={onManage}>
            <ShieldCheck size={18} /> Ask a grown-up to add a list
          </button>
          <button className="text-button" onClick={onGeneral}>
            Train with general spelling instead
          </button>
        </section>
      ) : (
        <>
          <section className="weekly-hero panel">
            <div>
              <p className="eyebrow">THIS WEEK’S SECRET CODES</p>
              <h2>{list.name}</h2>
              <p>
                {list.words.length} {list.words.length === 1 ? "word" : "words"}{" "}
                to train
                {list.testDate && (
                  <>
                    {" "}
                    · <CalendarDays size={16} /> Test:{" "}
                    {formatDate(list.testDate)}
                  </>
                )}
              </p>
              <button
                className="primary"
                disabled={!!data.current}
                onClick={() => start(recommended)}
              >
                Recommended: {modeName(recommended)}
              </button>
            </div>
            <div className="weekly-mastery">
              <strong>
                {mastered}
                <span> / {list.words.length}</span>
              </strong>
              <p>words mastered</p>
              <div className="progress-track">
                <div
                  style={{ width: `${(mastered / list.words.length) * 100}%` }}
                />
              </div>
              <small>
                Three independent successes,
                <br />
                in three separate sessions.
              </small>
            </div>
          </section>
          <div className="section-heading">
            <h2>
              <Target size={21} /> Choose your training
            </h2>
            <span>No timer. Every try matters.</span>
          </div>
          <div className="weekly-mode-grid">
            {modeInfo.map((mode) => (
              <button
                key={mode.id}
                className={`weekly-mode mode-${mode.id}`}
                aria-label={`Start ${mode.name}`}
                disabled={
                  !!data.current || (mode.id === "tricky" && difficult === 0)
                }
                onClick={() => start(mode.id)}
              >
                <mode.icon size={27} />
                <strong>{mode.name}</strong>
                <span>{mode.description}</span>
                <small>
                  {mode.id === "test"
                    ? `${list.words.length} words · +2 effort stars`
                    : mode.id === "tricky"
                      ? `${difficult} words need attention`
                      : "Up to 8 words · stars for practice"}
                </small>
              </button>
            ))}
          </div>
          <section className="panel weekly-words">
            <div className="section-heading">
              <h2>This week’s words</h2>
              <span>
                {difficult} tricky · {mastered} mastered
              </span>
            </div>
            <div className="weekly-word-grid">
              {list.words.map((w) => {
                const p = wordProgress(data, w.text),
                  streak = independentStreak(p.independentHistory);
                return (
                  <div className="weekly-word" key={w.id}>
                    <strong>{w.text}</strong>
                    <span>
                      {isMastered(p) ? (
                        <>
                          <Check size={15} /> Mastered
                        </>
                      ) : tricky(data, w.text) ? (
                        "Review next"
                      ) : p.lastSeen ? (
                        `${Math.min(3, streak)}/3 independent sessions`
                      ) : (
                        "New code"
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="fine-print">
              Flashcards, building, missing letters, look/cover, and
              adult-assisted turns help you learn. Only independent listening
              and test answers count toward mastery.
            </p>
          </section>
          <section className="panel weekly-history">
            <h2>Previous practice tests</h2>
            {data.results.filter(
              (r) => r.listId === list.id && r.mode === "test",
            ).length ? (
              data.results
                .filter((r) => r.listId === list.id && r.mode === "test")
                .slice(0, 5)
                .map((r) => (
                  <details key={r.id}>
                    <summary>
                      {new Date(r.finishedAt).toLocaleDateString()} ·{" "}
                      {r.results.filter((x) => x.correct).length}/
                      {r.results.length} correct ·{" "}
                      {r.results.filter((x) => x.kind === "assisted").length}{" "}
                      assisted
                    </summary>
                    <ResultRows result={r} />
                  </details>
                ))
            ) : (
              <p>Your completed practice-test results will appear here.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
function PracticeSession({
  state,
  change,
  sessionId,
  onBack,
  onReview,
}: {
  state: State;
  change: Change;
  sessionId: string;
  onBack: () => void;
  onReview: () => void;
}) {
  const data = weeklyData(state),
    session = data.current?.id === sessionId ? data.current : null,
    result = data.results.find((r) => r.id === sessionId);
  const [feedback, setFeedback] = useState<{
    result: WordResult;
    test: boolean;
    last: boolean;
  } | null>(null);
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    },
    [],
  );
  if (feedback)
    return (
      <div className="focused weekly-session">
        <section className="panel weekly-feedback">
          <p className="eyebrow">
            {feedback.test ? "TRANSMISSION SAVED" : "TRAINING REPORT"}
          </p>
          <h1>
            {feedback.test
              ? "Answer saved."
              : feedback.result.kind === "recognition"
                ? "Code studied!"
                : feedback.result.correct
                  ? "Code cracked!"
                  : "Good effort, hero."}
          </h1>
          {!feedback.test && (
            <>
              <p>
                {feedback.result.correct
                  ? "You gave your brain a little training."
                  : "Let’s look at this word together. You can give it another try in review."}
              </p>
              <div className="study-word">{feedback.result.word}</div>
            </>
          )}
          <button className="primary" onClick={() => setFeedback(null)}>
            {feedback.last
              ? feedback.test
                ? "See test results"
                : "See session results"
              : "Next word"}
          </button>
          <button className="text-button" onClick={onBack}>
            Save & leave
          </button>
        </section>
      </div>
    );
  if (result)
    return (
      <div className="weekly-results">
        <section className="panel celebration">
          <p className="eyebrow">HERO TRAINING REPORT</p>
          <h1>
            {result.mode === "test"
              ? "Practice test complete!"
              : "Training complete!"}
          </h1>
          {result.mode !== "flashcards" && (
            <h2>
              {result.results.filter((r) => r.correct).length} of{" "}
              {result.results.length} correct
            </h2>
          )}
          <p>
            {result.mode === "flashcards"
              ? "You studied your secret codes."
              : "Every try helps. Your tricky words are ready for more training."}
          </p>
          <div className="earned-stars">
            <Star fill="currentColor" /> {result.stars} stars earned
          </div>
          {result.results.some((r) => r.kind === "assisted") && (
            <p className="fine-print">
              Assisted turns help you learn and earn stars. They do not count as
              independent mastery.
            </p>
          )}
          <div className="button-row center">
            <button className="primary" onClick={onBack}>
              Back to Spelling HQ
            </button>
            {result.results.some((r) => !r.correct) && (
              <button className="secondary" onClick={onReview}>
                Review missed words
              </button>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Your word report</h2>
          <ResultRows result={result} />
        </section>
      </div>
    );
  if (!session)
    return (
      <section className="panel">
        <h2>Your practice is saved.</h2>
        <button className="primary" onClick={onBack}>
          Back to Spelling HQ
        </button>
      </section>
    );
  const item = session.items[session.index];
  function answer(value: string, assisted: boolean) {
    if (!session) return;
    const correct =
      item.mode === "flashcards" ||
      normalizeWord(value) === normalizeWord(item.word.text);
    const kind =
      item.mode === "flashcards"
        ? "recognition"
        : assisted ||
            session.assistedIndices.includes(session.index) ||
            ["builder", "missing", "cover"].includes(item.mode)
          ? "assisted"
          : item.mode === "test"
            ? "test"
            : "independent";
    setFeedback({
      test: session.mode === "test",
      last: session.index === session.items.length - 1,
      result: {
        word: item.word.text,
        answer: value,
        correct,
        kind,
        at: Date.now(),
      },
    });
    change((s) => submitTurn(s, session.id, session.index, value, assisted));
  }
  return (
    <div className="focused weekly-session">
      <div className="mission-top">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={17} /> Save & leave
        </button>
        <span>
          {session.index + 1} of {session.items.length} words
        </span>
        <span>{modeName(session.mode)}</span>
      </div>
      <div className="progress-track">
        <div
          style={{ width: `${(session.index / session.items.length) * 100}%` }}
        />
      </div>
      <SpellingTurn
        key={`${session.id}:${session.index}`}
        item={item}
        session={session}
        state={state}
        change={change}
        onAnswer={answer}
      />
    </div>
  );
}
function ResultRows({ result }: { result: SessionResult }) {
  return (
    <div className="word-progress-scroll">
      <table className="word-progress-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Your answer</th>
            <th>Result</th>
            <th>Practice type</th>
          </tr>
        </thead>
        <tbody>
          {result.results.map((r, i) => (
            <tr key={i}>
              <th>{r.word}</th>
              <td>
                {r.kind === "recognition" ? "Studied" : r.answer || "Skipped"}
              </td>
              <td>{r.correct ? "✓ Correct" : "Review next"}</td>
              <td>
                {r.kind === "recognition"
                  ? "Study"
                  : r.kind === "test"
                    ? "Independent test"
                    : r.kind === "assisted"
                      ? "Assisted"
                      : "Independent"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SpellingTurn({
  item,
  session,
  state,
  change,
  onAnswer,
}: {
  item: PracticeItem;
  session: WeeklySession;
  state: State;
  change: Change;
  onAnswer: (value: string, assisted: boolean) => void;
}) {
  const word = item.word.text,
    mode = item.mode,
    isIndependent = mode === "listen" || mode === "test";
  const [value, setValue] = useState(""),
    [covered, setCovered] = useState(false),
    [used, setUsed] = useState<number[]>([]),
    [tiles] = useState(() => shuffle(Array.from(word))),
    [speechNote, setSpeechNote] = useState(""),
    [gate, setGate] = useState(false),
    [reader, setReader] = useState(false);
  const locked = useRef(false),
    input = useRef<HTMLInputElement>(null);
  const assisted = session.assistedIndices.includes(session.index);
  const canAnswer = mode !== "cover" || covered;
  function send() {
    if (locked.current) return;
    locked.current = true;
    onAnswer(
      mode === "flashcards"
        ? word
        : mode === "missing"
          ? fillMissing(word, value)
          : value,
      assisted,
    );
  }
  const hear = () =>
    setSpeechNote(
      speak(
        [word, item.word.sentence, word].filter(Boolean).join(". "),
        state.settings.sound,
      ),
    );
  return (
    <section className="panel weekly-turn">
      <p className="eyebrow">
        {isIndependent
          ? "SECRET TRANSMISSION · LISTEN CAREFULLY"
          : "SECRET CODE TRAINING"}
      </p>
      <h1>
        {mode === "flashcards"
          ? "Meet your secret code."
          : mode === "builder"
            ? "Build the secret code."
            : mode === "missing"
              ? "Find the missing letters."
              : mode === "cover"
                ? covered
                  ? "Spell it from memory."
                  : "Look closely. Remember the code."
                : "Secret transmission"}
      </h1>
      {assisted && (
        <p className="assisted-badge">
          Adult-assisted turn · learning credit, not independent mastery
        </p>
      )}
      {(mode === "flashcards" || (mode === "cover" && !covered)) && (
        <div className="study-word" data-testid="study-word">
          {word}
        </div>
      )}
      {(item.mode === "flashcards" ||
        item.mode === "builder" ||
        (item.mode === "cover" && !covered)) &&
        item.word.sentence && (
          <p className="word-sentence">{item.word.sentence}</p>
        )}
      {mode === "missing" && (
        <div className="missing-word" data-testid="missing-word">
          {missingLetters(word).display}
        </div>
      )}
      <div className="button-row center">
        <button className="secondary" onClick={hear}>
          <Volume2 size={20} /> Hear word
        </button>
        {mode === "cover" && !covered && (
          <button
            className="primary"
            onClick={() => {
              setCovered(true);
              setValue("");
            }}
          >
            Cover the word
          </button>
        )}
      </div>
      {speechNote && (
        <p className="hint" role="status">
          {speechNote}{" "}
          {isIndependent
            ? "Ask a grown-up to read the private card below."
            : ""}
        </p>
      )}
      {isIndependent && (
        <button
          className="text-button reader-help"
          onClick={() => setGate(true)}
        >
          <ShieldCheck size={17} /> Ask a grown-up to read
        </button>
      )}
      {mode === "flashcards" ? (
        <button className="primary study-done" onClick={send}>
          I’ve studied this word
        </button>
      ) : (
        canAnswer && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {mode === "builder" && (
              <div className="word-tiles" role="group" aria-label="Word tiles">
                {tiles.map((c, i) => (
                  <button
                    type="button"
                    key={i}
                    disabled={used.includes(i)}
                    aria-label={`${c === " " ? "space" : c} tile ${i + 1}`}
                    onClick={() => {
                      setValue((v) => v + c);
                      setUsed((v) => [...v, i]);
                    }}
                  >
                    {c === " " ? "␣" : c}
                  </button>
                ))}
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setValue("");
                    setUsed([]);
                  }}
                >
                  Clear tiles
                </button>
              </div>
            )}
            <label className="spelling-answer">
              {mode === "missing"
                ? "Type the missing letters (or the whole word)."
                : "Type it or tap the letter buttons."}
              <input
                ref={input}
                aria-label="Your spelling"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setUsed([]);
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoCapitalize="none"
                maxLength={200}
                inputMode="text"
              />
            </label>
            <LetterKeyboard
              extras={weeklyData(state)
                .lists.flatMap((l) => l.words.map((w) => w.text))
                .join("")}
              onLetter={(c) => setValue((v) => v + c)}
              onBackspace={() =>
                setValue((v) => Array.from(v).slice(0, -1).join(""))
              }
              onClear={() => {
                setValue("");
                setUsed([]);
              }}
            />
            <button
              className="primary check-spelling"
              disabled={!value.trim()}
              type="submit"
            >
              {mode === "test" ? "Save test answer" : "Check spelling"}
            </button>
            <button
              className="text-button skip-spelling"
              type="button"
              onClick={() => {
                setValue("");
                locked.current = true;
                onAnswer("", assisted);
              }}
            >
              I don’t know yet · skip
            </button>
          </form>
        )
      )}
      <p className="calm-note">
        No rush. No stars lost. Every try is training.
      </p>
      {gate && (
        <AdultGate
          confirmLabel="Open reading card"
          onCancel={() => setGate(false)}
          onAccept={() => {
            change((s) => markAssisted(s, session.id, session.index));
            setGate(false);
            setReader(true);
          }}
        />
      )}
      {reader && (
        <ReadingCard
          word={word}
          sentence={item.word.sentence}
          onClose={() => setReader(false)}
        />
      )}
    </section>
  );
}
function LetterKeyboard({
  extras,
  onLetter,
  onBackspace,
  onClear,
}: {
  extras: string;
  onLetter: (c: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}) {
  const standard = Array.from("abcdefghijklmnopqrstuvwxyz");
  const extra = [...new Set(Array.from(extras.toLowerCase()))].filter(
    (c) => /\p{L}/u.test(c) && !standard.includes(c),
  );
  return (
    <div
      className="letter-keyboard"
      role="group"
      aria-label="Spelling keyboard"
    >
      <div className="keyboard-letters">
        {[...standard, ...extra].map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Letter ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onLetter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="keyboard-special">
        {["'", "-", " "].map((c) => (
          <button
            key={c}
            type="button"
            aria-label={
              c === " " ? "Space" : c === "-" ? "Hyphen" : "Apostrophe"
            }
            onClick={() => onLetter(c)}
          >
            {c === " " ? "space" : c}
          </button>
        ))}
        <button type="button" aria-label="Backspace" onClick={onBackspace}>
          <Delete size={18} />
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
function ReadingCard({
  word,
  sentence,
  onClose,
}: {
  word: string;
  sentence: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal-backdrop"
      aria-labelledby="reader-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <section className="modal reading-card">
        <button
          className="icon-button close"
          aria-label="Close reading card"
          onClick={onClose}
        >
          <X />
        </button>
        <ShieldCheck size={34} />
        <p className="eyebrow">GROWN-UP READING CARD</p>
        <h2 id="reader-title">Ask your learner to look away.</h2>
        <p>
          Read this word and sentence aloud. This turn has been marked assisted
          and will not count toward independent mastery.
        </p>
        <div className="study-word">{word}</div>
        {sentence && <p>{sentence}</p>}
        <button className="primary" onClick={onClose}>
          Hide card & continue
        </button>
      </section>
    </dialog>
  );
}
