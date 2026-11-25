import { useEffect, useState } from "react";
import {
  Zap,
  House,
  BookOpen,
  Gamepad2,
  Star,
  Ticket,
  ShieldCheck,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Settings,
  Coffee,
  SlidersHorizontal,
} from "lucide-react";
import { HomeMenu, LearnMenu, Rewards } from "./Menu";
import { AudioDialog } from "./AudioControls";
import { useAudio } from "./useAudio";
import { ReadAloud } from "./ReadAloud";
import { updateSettings } from "./model";
import { cancelSpeech } from "./speech";
import { EffectLayer, celebrate } from "./Effects";
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
import { AdultGate, Parent, exportFile } from "./Parent";
import { SkillChooser, Mission, Homework, BreakTime } from "./Activities";
import { games } from "./games";
import { WeeklyHQ } from "./spelling/WeeklyHQ";
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
type Screen =
  | "home"
  | "spelling-hq"
  | "missions"
  | "rewards"
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
  const [audioOpen, setAudioOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [resumeWeekly, setResumeWeekly] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId>("racer");
  const [screen, setScreen] = useState<Screen>("home"),
    [subject, setSubject] = useState<Subject>("math"),
    [questions, setQuestions] = useState<Question[]>([]),
    [gate, setGate] = useState(false),
    [message, setMessage] = useState("");
  useAudio(
    state.settings,
    !!state.session || gate || screen === "parent",
    screen,
  );
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
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      // Preserve auto-focused spelling fields when resuming a saved session.
      if (
        !main?.contains(document.activeElement) ||
        !document.activeElement?.matches("input, textarea, select")
      )
        main?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [screen, !!state.session]);
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
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="game-header">
        <button
          className="punk-brand"
          onClick={() => navigate("home")}
          aria-label="Hero Academy home"
        >
          <span>HERO</span>
          <strong>ACADEMY</strong>
          <small>MULTIVERSE EDITION</small>
        </button>
        <nav className="primary-nav" aria-label="Main navigation">
          {(
            [
              { id: "home", label: "Home", icon: House },
              { id: "missions", label: "Learn", icon: BookOpen },
              { id: "arcade", label: "Arcade", icon: Gamepad2 },
              { id: "rewards", label: "Rewards", icon: Trophy },
              { id: "parent", label: "Grown-ups", icon: Settings },
            ] as const
          ).map((n) => {
            const active =
              n.id === screen ||
              (n.id === "missions" &&
                ["choose", "mission", "complete", "homework", "break"].includes(
                  screen,
                )) ||
              (n.id === "arcade" && (screen === "briefing" || !!state.session));
            return (
              <button
                key={n.id}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() =>
                  n.id === "parent" ? setGate(true) : navigate(n.id)
                }
              >
                <n.icon aria-hidden="true" />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-balances">
          <div className="balance" aria-label={`${state.stars} stars`}>
            <Star fill="currentColor" />
            <strong data-testid="star-balance">{state.stars}</strong>
          </div>
          <div
            className="ticket-balance"
            aria-label={`${state.tickets} game tickets`}
          >
            <Ticket />
            <strong>{state.tickets}</strong>
          </div>
          <button
            className="icon-button"
            aria-label={
              !state.settings.audioMuted &&
              (state.settings.sound ||
                state.settings.effectsSound ||
                state.settings.musicSound)
                ? "Turn sound off"
                : "Turn sound on"
            }
            onClick={() => {
              cancelSpeech();
              setState((s) => {
                const selected =
                  s.settings.sound ||
                  s.settings.effectsSound ||
                  s.settings.musicSound;
                const audible = selected && !s.settings.audioMuted;
                return {
                  ...s,
                  settings: {
                    ...s.settings,
                    audioMuted: audible,
                    ...(!selected ? { sound: true, effectsSound: true } : {}),
                  },
                };
              });
            }}
          >
            {!state.settings.audioMuted &&
            (state.settings.sound ||
              state.settings.effectsSound ||
              state.settings.musicSound) ? (
              <Volume2 />
            ) : (
              <VolumeX />
            )}
          </button>
          <button
            className="icon-button mix-button"
            aria-label="Audio settings"
            onClick={() => setAudioOpen(true)}
          >
            <SlidersHorizontal />
          </button>
        </div>
      </header>
      <div className="main-shell">
        <main id="main-content" tabIndex={-1} className={`screen-${screen}`}>
          {savedNotice && (
            <div className="notice-banner" role="status">
              Settings saved on this device.
              <button
                className="text-button"
                onClick={() => setSavedNotice(false)}
              >
                Dismiss
              </button>
            </div>
          )}
          {!state.session &&
            ["home", "missions", "arcade", "rewards", "complete"].includes(
              screen,
            ) && (
              <ReadAloud
                text={
                  screen === "home"
                    ? "Welcome to Hero Academy. Tap Continue learning, or choose Spelling, Math, Reading or Games."
                    : screen === "missions"
                      ? "Choose a subject to practice. Spelling HQ has your school words. Homework starts a focus timer."
                      : screen === "arcade"
                        ? "Choose a game to see how to play. You need one ticket to launch a game."
                        : screen === "rewards"
                          ? "Earn stars by practicing. Trade stars for a game ticket when it is ready."
                          : screen === "complete"
                            ? "Mission complete. Tap Back to base to choose your next activity."
                            : "Choose a training mode for your school words. Tap Hear instructions in an activity for help."
                }
                settings={state.settings}
                auto={screen !== "spelling-hq"}
              />
            )}
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
              {screen === "home" && (
                <HomeMenu
                  state={state}
                  choose={choose}
                  spelling={() => {
                    setResumeWeekly(false);
                    navigate("spelling-hq");
                  }}
                  arcade={() => navigate("arcade")}
                  homework={() => navigate("homework")}
                  takeBreak={() => navigate("break")}
                  learn={() => navigate("missions")}
                  resume={() => {
                    setResumeWeekly(true);
                    navigate("spelling-hq");
                  }}
                />
              )}
              {screen === "missions" && (
                <LearnMenu
                  state={state}
                  choose={choose}
                  spelling={() => {
                    setResumeWeekly(false);
                    navigate("spelling-hq");
                  }}
                  arcade={() => navigate("arcade")}
                  homework={() => navigate("homework")}
                  takeBreak={() => navigate("break")}
                />
              )}
              {screen === "rewards" && (
                <Rewards
                  state={state}
                  change={setState}
                  arcade={() => navigate("arcade")}
                />
              )}
              {screen === "spelling-hq" && (
                <WeeklyHQ
                  state={state}
                  change={setState}
                  autoResume={resumeWeekly}
                  onGeneral={() => choose("spelling")}
                  onManage={() => setGate(true)}
                />
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
                      onClick={() => {
                        setState((s) => redeemTicket(s));
                        celebrate("reward");
                      }}
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
                  onDone={() => {
                    navigate("complete");
                    celebrate("victory");
                  }}
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
                  settings={state.settings}
                  onDone={() => navigate("home")}
                />
              )}
              {screen === "parent" && (
                <Parent
                  state={state}
                  change={setState}
                  onDone={() => {
                    setSavedNotice(true);
                    navigate("home");
                  }}
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
            YOUR PACE. YOUR POWER.{" "}
            <a
              href={import.meta.env.BASE_URL + "licenses/THIRD_PARTY.txt"}
              target="_blank"
              rel="noreferrer"
            >
              Credits & open source
            </a>
          </span>
        </footer>
      </div>
      <EffectLayer
        settings={state.settings}
        quiet={screen === "parent" || gate || !!state.session}
        route={screen}
      />
      {audioOpen && (
        <AudioDialog
          settings={state.settings}
          onChange={(patch) => setState((s) => updateSettings(s, patch))}
          onClose={() => setAudioOpen(false)}
        />
      )}
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
