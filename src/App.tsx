import { useEffect, useState } from "react";
import {
  Zap,
  House,
  Rocket,
  Gamepad2,
  Timer,
  Star,
  Ticket,
  ShieldCheck,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  LockKeyhole,
  Coffee,
  Trophy,
} from "lucide-react";
import {
  freshState,
  hydrate,
  STORAGE_KEY,
  redeemTicket,
  startSession,
  type State,
  type Subject,
  type GameId,
} from "./model";
import { makeQuestion, type Question } from "./learning";
import { MissionArt } from "./Art";
import { AdultGate, Parent, exportFile } from "./Parent";
import { SkillChooser, Mission, Homework, BreakTime } from "./Activities";
import { games } from "./games";
import { GameBriefing, GamePreview, GameSession } from "./Arcade";
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return {
      state: raw ? hydrate(JSON.parse(raw)) : freshState(),
      error: "",
      raw: raw || "",
    };
  } catch (e) {
    let raw = "";
    try {
      raw = localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      /* Storage unavailable. */
    }
    return {
      state: freshState(),
      error: e instanceof Error ? e.message : "Storage unavailable",
      raw,
    };
  }
}
const subjects: Subject[] = ["math", "spelling", "reading"];
const labels = { math: "Math", spelling: "Spelling", reading: "Reading" };
const descriptions = {
  math: "Small numbers. Super powers.",
  spelling: "Build words. Unlock possibilities.",
  reading: "Big adventures in little stories.",
};
const names = {
  math: "Number Ops",
  spelling: "Word Lab",
  reading: "Story Files",
};
type Screen =
  | "home"
  | "missions"
  | "briefing"
  | "arcade"
  | "homework"
  | "parent"
  | "choose"
  | "mission"
  | "complete"
  | "break";
export default function App() {
  const [loaded] = useState(load);
  const [state, setState] = useState<State>(loaded.state),
    [storageError, setStorageError] = useState(loaded.error);
  const [selectedGame, setSelectedGame] = useState<GameId>("racer");
  const [screen, setScreen] = useState<Screen>("home"),
    [subject, setSubject] = useState<Subject>("math"),
    [questions, setQuestions] = useState<Question[]>([]),
    [gate, setGate] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (loaded.error) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError("");
    } catch {
      setStorageError(
        "Progress cannot be saved in this browser. Export it before leaving.",
      );
    }
  }, [state, loaded.error]);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduced-motion",
      state.settings.reducedMotion,
    );
  }, [state.settings.reducedMotion]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }, [screen]);
  function navigate(to: Screen) {
    setScreen(to);
    setMessage("");
  }
  function choose(s: Subject) {
    setSubject(s);
    navigate("choose");
  }
  function finishGame() {
    setState((s) => ({ ...s, session: null }));
    setScreen("home");
    setMessage("Nice playing, hero! Your next adventure is waiting.");
  }
  function play(game: GameId) {
    setSelectedGame(game);
    navigate("briefing");
  }
  function startMission(topic: string) {
    const offset = Math.floor(Math.random() * 100);
    setQuestions(
      Array.from({ length: 5 }, (_, i) =>
        makeQuestion(subject, topic, state.settings, state.custom, offset + i),
      ),
    );
    navigate("mission");
  }
  const starsNeeded = Math.max(0, state.settings.starCost - state.stars);
  const ticketProgress = Math.min(
    100,
    (state.stars / state.settings.starCost) * 100,
  );
  const totalSolved = subjects.reduce(
    (sum, s) => sum + state.stats[s].correct,
    0,
  );
  if (loaded.error)
    return (
      <main className="recovery panel">
        <ShieldCheck size={48} />
        <h1>Your saved progress needs a check.</h1>
        <p>
          The existing save has been left untouched. Export it before resetting,
          or try reopening this page with browser storage enabled.
        </p>
        <p>{storageError}</p>
        <button
          className="primary"
          onClick={() => exportFile(loaded.raw, "hero-academy-recovery.json")}
        >
          Export original save
        </button>
        <button
          className="secondary"
          onClick={() => {
            if (
              confirm("Reset the unreadable local save? Export a copy first.")
            ) {
              localStorage.removeItem(STORAGE_KEY);
              location.reload();
            }
          }}
        >
          Reset this browser’s save
        </button>
      </main>
    );
  return (
    <div className={`app-shell ${state.session ? "is-playing" : ""}`}>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="Hero Academy home"
        >
          <span className="brand-mark">
            <Zap fill="currentColor" size={26} />
          </span>
          <span>
            HERO<span className="brand-sub">ACADEMY</span>
          </span>
        </button>
        <div className="sidebar-caption">COMMAND CENTER</div>
        <nav aria-label="Main navigation">
          {(
            [
              { id: "home", label: "Your base", icon: House },
              { id: "missions", label: "Missions", icon: Rocket },
              { id: "arcade", label: "Arcade", icon: Gamepad2 },
              { id: "homework", label: "Homework", icon: Timer },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              className={screen === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={21} />
              <span>{n.label}</span>
              {screen === n.id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="hero-reminder">
            <div className="tiny-star">✦</div>
            <strong>
              Little steps.
              <br />
              Super things.
            </strong>
            <p>
              You don’t have to be perfect.
              <br />
              Just give it a try.
            </p>
          </div>
          <button
            className="parent-nav"
            aria-label="Grown-up zone"
            onClick={() => setGate(true)}
          >
            <ShieldCheck size={19} /> Grown-up zone <LockKeyhole size={13} />
          </button>
          <small>Made for curious little heroes.</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Hero Academy <span>/</span>{" "}
            <strong>
              {screen === "home"
                ? "Your base"
                : screen === "parent"
                  ? "Grown-up zone"
                  : screen === "arcade"
                    ? "Arcade"
                    : screen === "homework"
                      ? "Homework"
                      : "Your adventure"}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="balance">
              <Star size={19} fill="currentColor" />
              <strong data-testid="star-balance">{state.stars}</strong>
              <span>stars</span>
            </div>
            <div
              className="ticket-balance"
              aria-label={`${state.tickets} game tickets`}
            >
              <Ticket size={19} />
              <strong>{state.tickets}</strong>
            </div>
            <button
              className="icon-button"
              aria-label={
                state.settings.sound ? "Turn sound off" : "Turn sound on"
              }
              onClick={() => {
                if (state.settings.sound && "speechSynthesis" in window)
                  speechSynthesis.cancel();
                setState((s) => ({
                  ...s,
                  settings: { ...s.settings, sound: !s.settings.sound },
                }));
              }}
            >
              {state.settings.sound ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>
            <button
              className="icon-button mobile-parent"
              aria-label="Grown-up zone"
              onClick={() => setGate(true)}
            >
              <ShieldCheck size={20} />
            </button>
            <div className="avatar" aria-label="Hero profile">
              ⚡
            </div>
          </div>
        </header>
        <main id="main-content">
          {storageError && (
            <div className="warning" role="alert">
              {storageError}{" "}
              <button
                onClick={() => exportFile(JSON.stringify(state, null, 2))}
              >
                Export progress
              </button>
            </div>
          )}
          {message && (
            <div className="notice-banner" role="status">
              <Sparkles size={20} />
              {message}
            </div>
          )}
          {state.session ? (
            <GameSession
              session={state.session}
              onEnd={finishGame}
              settings={state.settings}
            />
          ) : (
            <>
              {(screen === "home" || screen === "missions") && (
                <>
                  <header className="page-title">
                    <div>
                      <p className="eyebrow">YOUR HERO STORY STARTS HERE</p>
                      <h1>
                        {screen === "home"
                          ? "Welcome to Hero HQ."
                          : "Choose your next mission."}{" "}
                        <span className="wave">
                          {screen === "home" ? "✦" : ""}
                        </span>
                      </h1>
                      <p>
                        A little learning. A big adventure. Let’s see what you
                        can do.
                      </p>
                    </div>
                    <div className="grade-pill">
                      <Sparkles size={16} /> FIRST-GRADE EXPLORER
                    </div>
                  </header>
                  {screen === "home" && (
                    <section className="hero-banner">
                      <div className="hero-copy">
                        <span className="banner-label">
                          <span /> THE CITY NEEDS A HERO LIKE YOU
                        </span>
                        <h2>
                          Small missions.
                          <br />
                          <em>Legendary heroes.</em>
                        </h2>
                        <p>
                          Every skill is a superpower.
                          <br />
                          Train today. Unlock your next adventure.
                        </p>
                        <button
                          className="banner-button"
                          onClick={() => choose(state.settings.subjects[0])}
                        >
                          <Zap size={19} fill="currentColor" /> Start a mission
                        </button>
                        <span className="banner-footnote">
                          Five questions. All the time you need.
                        </span>
                      </div>
                      <img
                        className="city-scene"
                        src={import.meta.env.BASE_URL + "art/academy-city.jpg"}
                        alt="An original masked hero swinging above a neon city skyline"
                      />
                      <span className="hero-orbit" />
                    </section>
                  )}
                  <div className="dashboard-grid">
                    <div className="dashboard-main">
                      <div className="section-heading">
                        <h2>
                          <Rocket size={21} /> Choose your mission
                        </h2>
                        <span>Every try makes you stronger</span>
                      </div>
                      <div className="mission-cards">
                        {state.settings.subjects.map((s) => (
                          <article className={`mission-card ${s}`} key={s}>
                            <div className="card-tag">
                              {labels[s].toUpperCase()}
                            </div>
                            <MissionArt kind={s} />
                            <h3>{names[s]}</h3>
                            <p>{descriptions[s]}</p>
                            <div className="mission-meta">
                              <span>
                                <Star size={14} fill="currentColor" /> 5 stars
                                to earn
                              </span>
                              <span>5 questions</span>
                            </div>
                            <button
                              aria-label={`Start ${labels[s]} mission`}
                              onClick={() => choose(s)}
                            >
                              Let’s practice <Zap size={16} />
                            </button>
                          </article>
                        ))}
                      </div>
                      <div className="section-heading arcade-heading">
                        <h2>
                          <Gamepad2 size={22} /> The reward arcade
                        </h2>
                        <button
                          className="text-button"
                          onClick={() => navigate("arcade")}
                        >
                          Visit arcade
                        </button>
                      </div>
                      <div className="game-cards compact">
                        {(Object.keys(games) as GameId[]).map((g) => (
                          <article className="game-card" key={g}>
                            <button
                              className="game-preview-link"
                              aria-label={`View ${games[g].title}`}
                              onClick={() => play(g)}
                            >
                              <GamePreview game={g} />
                            </button>
                            <div className="game-card-info">
                              <div>
                                <h3>{games[g].title}</h3>
                                <span>{games[g].tag}</span>
                              </div>
                              <span className="play-tag">
                                <Ticket size={16} /> 1 ticket
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                    <aside className="dashboard-side">
                      <section className="reward-panel panel">
                        <div className="reward-icon">
                          <Ticket size={29} />
                          <span>✦</span>
                        </div>
                        <p className="eyebrow">YOUR NEXT REWARD</p>
                        <h2>Your next unlock</h2>
                        <p>
                          Turn your learning stars into
                          <br />a little arcade time.
                        </p>
                        <div className="reward-count">
                          <strong>
                            {Math.min(state.stars, state.settings.starCost)}
                          </strong>
                          <span>/ {state.settings.starCost} stars</span>
                        </div>
                        <div className="progress-track gold">
                          <div style={{ width: `${ticketProgress}%` }} />
                        </div>
                        <p className="reward-note">
                          {starsNeeded
                            ? `Just ${starsNeeded} more stars to your next ticket!`
                            : "You’ve earned enough for a game ticket!"}
                        </p>
                        <button
                          className="secondary full"
                          onClick={() => navigate("arcade")}
                        >
                          {starsNeeded
                            ? "Explore rewards"
                            : "Collect your ticket"}{" "}
                          <Ticket size={17} />
                        </button>
                        <div className="session-note">
                          <Timer size={15} />
                          {state.settings.gameMinutes} minutes of play per
                          ticket
                        </div>
                      </section>
                      <section className="progress-panel panel">
                        <div className="section-heading">
                          <h3>Your hero journey</h3>
                          <Trophy size={19} />
                        </div>
                        <div className="journey-stat">
                          <strong>{totalSolved}</strong>
                          <span>questions solved</span>
                        </div>
                        <div className="journey-stat">
                          <strong>{state.totalStars}</strong>
                          <span>stars earned, ever</span>
                        </div>
                        <div className="journey-message">
                          <Check size={17} /> Every small step counts.
                        </div>
                      </section>
                      <button
                        className="break-card"
                        onClick={() => navigate("break")}
                      >
                        <Coffee size={27} />
                        <span>
                          <strong>Need a little reset?</strong>
                          <small>Stretch, breathe, recharge.</small>
                        </span>
                      </button>
                    </aside>
                  </div>
                  <div className="bottom-note">
                    <ShieldCheck size={16} /> A safe little corner of the
                    universe. No ads. No accounts. Just learning.
                  </div>
                </>
              )}
              {screen === "briefing" && (
                <GameBriefing
                  game={selectedGame}
                  state={state}
                  onBack={() => navigate("arcade")}
                  onLaunch={() =>
                    setState((s) => startSession(s, selectedGame))
                  }
                />
              )}
              {screen === "arcade" && (
                <>
                  <header className="page-title">
                    <div>
                      <p className="eyebrow">EARNED THROUGH YOUR EFFORT</p>
                      <h1>The arcade is yours.</h1>
                      <p>
                        One ticket, one game, {state.settings.gameMinutes}{" "}
                        minutes of well-earned fun.
                      </p>
                    </div>
                    <Gamepad2 size={44} />
                  </header>
                  <section className="arcade-wallet panel">
                    <div>
                      <h2>
                        <Star fill="currentColor" /> {state.stars} stars{" "}
                        <span>·</span> <Ticket /> {state.tickets} tickets
                      </h2>
                      <p>
                        Trade {state.settings.starCost} stars for a ticket. Your
                        timer starts when you press Play.
                      </p>
                    </div>
                    <button
                      className="primary"
                      disabled={starsNeeded > 0}
                      onClick={() => setState((s) => redeemTicket(s))}
                    >
                      Get a game ticket
                    </button>
                  </section>
                  {starsNeeded > 0 && state.tickets === 0 && (
                    <p className="hint">
                      You’re {starsNeeded} stars away. Complete a few missions
                      to unlock game time.
                    </p>
                  )}
                  <div className="game-cards arcade-grid">
                    {(Object.keys(games) as GameId[]).map((g) => (
                      <article className="game-card" key={g}>
                        <GamePreview game={g} />
                        <div className="arcade-card-content">
                          <p className="eyebrow">{games[g].tag}</p>
                          <h2>{games[g].title}</h2>
                          <p>{games[g].description}</p>
                          <div className="button-row">
                            <span>
                              <Ticket size={17} /> 1 ticket ·{" "}
                              {state.settings.gameMinutes} min
                            </span>
                            <button
                              className="primary"
                              aria-label={`Play ${games[g].title}`}
                              onClick={() => play(g)}
                            >
                              <Gamepad2 size={18} /> Play
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <section className="tip-strip">
                    <ShieldCheck />
                    <p>
                      These games live inside Hero Academy. A 30-second warning
                      helps you get ready, then the game stops and you return to
                      base.
                    </p>
                  </section>
                  <button
                    className="break-card inline-break"
                    onClick={() => navigate("break")}
                  >
                    <Coffee />
                    <span>
                      <strong>Choose a screen-free break</strong>
                      <small>No stars needed. Breaks are always welcome.</small>
                    </span>
                  </button>
                </>
              )}
              {screen === "choose" && (
                <SkillChooser
                  subject={subject}
                  state={state}
                  onStart={startMission}
                  onBack={() => navigate("home")}
                />
              )}
              {screen === "mission" && (
                <Mission
                  questions={questions}
                  state={state}
                  change={setState}
                  onDone={() => navigate("complete")}
                  onBack={() => navigate("home")}
                />
              )}
              {screen === "complete" && (
                <div className="focused">
                  <section className="panel celebration">
                    <div className="celebration-stars">✦ ★ ✦</div>
                    <p className="eyebrow">LOOK AT YOU GO</p>
                    <h1>Mission complete!</h1>
                    <p>
                      You kept trying and solved five questions.
                      <br />
                      That’s a super thing to do.
                    </p>
                    <div className="earned-stars">
                      <Star fill="currentColor" /> 5 stars earned
                    </div>
                    <button
                      className="primary"
                      onClick={() => navigate("home")}
                    >
                      Back to base
                    </button>
                    <button
                      className="text-button"
                      onClick={() => navigate("break")}
                    >
                      Take a little break
                    </button>
                  </section>
                </div>
              )}
              {screen === "homework" && (
                <Homework state={state} change={setState} />
              )}
              {screen === "break" && (
                <BreakTime
                  minutes={state.settings.breakMinutes}
                  onDone={() => navigate("home")}
                />
              )}
              {screen === "parent" && (
                <Parent
                  state={state}
                  change={setState}
                  onDone={() => navigate("home")}
                />
              )}
            </>
          )}
        </main>
        <footer>
          <span>
            <Zap size={13} /> HERO ACADEMY
          </span>
          <span>
            Built for brave little learners.{" "}
            <a
              href="https://github.com/broof34/hero-academy/blob/codex/hero-academy-v2/THIRD_PARTY.md"
              target="_blank"
              rel="noreferrer"
            >
              Credits & open source
            </a>
          </span>
        </footer>
      </div>
      {gate && (
        <AdultGate
          onCancel={() => setGate(false)}
          onAccept={() => {
            setGate(false);
            navigate("parent");
          }}
        />
      )}
    </div>
  );
}
