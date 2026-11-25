import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Gamepad2,
  Ticket,
  Timer,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Keyboard,
  Hand,
  ShieldCheck,
} from "lucide-react";
import { games } from "./games";
import { ReadAloud } from "./ReadAloud";
import {
  clock,
  remainingSeconds,
  type GameId,
  type State,
  type Session,
} from "./model";
export function GamePreview({ game }: { game: GameId }) {
  const g = games[game];
  return (
    <img
      className="game-preview"
      src={import.meta.env.BASE_URL + g.preview}
      alt={`${g.title} actual gameplay`}
      loading="lazy"
    />
  );
}
export function GameBriefing({
  game: id,
  state,
  onLaunch,
  onBack,
}: {
  game: GameId;
  state: State;
  onLaunch: () => void;
  onBack: () => void;
}) {
  const game = games[id];
  return (
    <div className="briefing">
      <ReadAloud
        settings={state.settings}
        text={`${game.title}. ${game.touch} You need one ticket to launch. Your timer starts when you press Launch game.`}
      />
      <button className="text-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to arcade
      </button>
      <section className="briefing-hero panel">
        <GamePreview game={id} />
        <div className="briefing-copy">
          <p className="eyebrow">{game.tag} · MISSION BRIEFING</p>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <div className="game-features">
            {game.features.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </section>
      <div className="briefing-grid">
        <section className="panel">
          <p className="eyebrow">YOUR CONTROLS</p>
          <h2>{game.brief}</h2>
          <h3>
            <Keyboard size={19} /> Keyboard
          </h3>
          <div className="controls-list">
            {game.controls.map((c) => (
              <div key={c.key}>
                <kbd>{c.key}</kbd>
                <span>{c.action}</span>
              </div>
            ))}
          </div>
          <h3>
            <Hand size={19} /> Tablet & touch
          </h3>
          <p>{game.touch}</p>
        </section>
        <section className="panel launch-panel">
          <Ticket size={40} />
          <p className="eyebrow">YOUR ADVENTURE PASS</p>
          <h2>1 ticket. {state.settings.gameMinutes} minutes.</h2>
          <p>
            Your time starts when you launch. A warning appears with 30 seconds
            to go, then you return to the Academy.
          </p>
          <button
            className="primary"
            onClick={onLaunch}
            disabled={state.tickets < 1}
          >
            <Gamepad2 size={20} /> Launch game · 1 ticket
          </button>
          <p className="fine-print">
            {state.tickets} {state.tickets === 1 ? "ticket" : "tickets"} ready ·
            Learning stars stay safe.
          </p>
          <div className="tip-strip">
            <ShieldCheck size={20} />
            <p>
              Pause whenever you need. The session timer keeps counting. Take a
              break when it ends.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
export function GameSession({
  session,
  onEnd,
  settings,
}: {
  session: Session;
  onEnd: () => void;
  settings: State["settings"];
}) {
  const [seconds, setSeconds] = useState(() => remainingSeconds(session));
  const [paused, setPaused] = useState(false),
    [muted, setMuted] = useState(
      settings.audioMuted ||
        (!(settings.effectsSound && settings.effectsVolume > 0) &&
          !(
            session.game === "racer" &&
            settings.musicSound &&
            settings.musicVolume > 0
          )),
    ),
    [expanded, setExpanded] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(false),
    [fallback, setFallback] = useState(false);
  const [gameEffects, setGameEffects] = useState(settings.effectsSound);
  const frame = useRef<HTMLIFrameElement>(null);
  const game = games[session.game];
  const reducedMotion =
    settings.reducedMotion ||
    (typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches);
  const settingsRef = useRef({
    paused,
    muted,
    reducedMotion,
    effectsVolume: gameEffects ? settings.effectsVolume : 0,
    musicVolume: settings.musicSound ? settings.musicVolume : 0,
  });
  settingsRef.current = {
    paused,
    muted,
    reducedMotion,
    effectsVolume: gameEffects ? settings.effectsVolume : 0,
    musicVolume: settings.musicSound ? settings.musicVolume : 0,
  };
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "academy:settings", ...settingsRef.current },
      "*",
    );
  useEffect(() => {
    const tick = () => setSeconds(remainingSeconds(session));
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [session]);
  useEffect(() => {
    if (seconds === 0) onEnd();
  }, [seconds, onEnd]);
  useEffect(() => {
    function receive(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "academy:ready") {
        setReady(true);
        send();
      }
      if (e.data?.type === "academy:error") setError(true);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    send();
  }, [
    paused,
    muted,
    reducedMotion,
    gameEffects,
    settings.effectsVolume,
    settings.musicSound,
    settings.musicVolume,
  ]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("expanded-game", expanded);
    return () => document.body.classList.remove("expanded-game");
  }, [expanded]);
  return (
    <section className={`game-session panel ${expanded ? "expanded" : ""}`}>
      <div className="session-head">
        <div>
          <p className="eyebrow">ADVENTURE IN PROGRESS</p>
          <h1>
            {game.title}
            {fallback ? " · 2D mode" : ""}
          </h1>
        </div>
        <div
          className={`countdown ${seconds <= 30 ? "urgent" : ""}`}
          aria-label="Game time remaining"
        >
          <Timer />
          {clock(seconds)}
        </div>
        <div className="session-actions">
          <button
            className="secondary"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Resume game" : "Pause game"}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}{" "}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            className="icon-button"
            onClick={() => {
              if (
                muted &&
                !gameEffects &&
                !(session.game === "racer" && settings.musicSound)
              )
                setGameEffects(true);
              setMuted(!muted);
            }}
            aria-label={muted ? "Unmute game" : "Mute game"}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <button
            className="icon-button"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Exit expanded view" : "Expand game"}
          >
            {expanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
          <button className="primary" onClick={onEnd}>
            Finish playing
          </button>
        </div>
      </div>
      {seconds <= 30 && seconds > 0 && (
        <p className="warning" role="alert">
          {seconds} seconds left · Get ready to return to the Academy!
        </p>
      )}
      <div className="game-viewport">
        {seconds > 0 && (
          <iframe
            key={fallback ? "fallback" : "main"}
            ref={frame}
            title={game.title}
            src={
              import.meta.env.BASE_URL +
              (fallback ? game.fallbackPath : game.path)
            }
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            onLoad={send}
          />
        )}
        {paused && (
          <div className="game-pause-overlay">
            <Pause size={40} />
            <h2>Take a breath, hero.</h2>
            <p>Your session timer is still running.</p>
            <button className="primary" onClick={() => setPaused(false)}>
              Resume game
            </button>
          </div>
        )}
      </div>
      <div className="session-footer">
        <p className="fine-print">
          {error
            ? "This game could not start. Try 2D mode below."
            : ready
              ? "Controls stay inside your game."
              : "Loading your adventure…"}{" "}
          Pausing and changing modes keep the same deadline.
        </p>
        {game.fallbackPath && !fallback && (
          <button
            className="text-button"
            onClick={() => {
              setFallback(true);
              setReady(true);
              setError(false);
              setPaused(false);
            }}
          >
            Switch to 2D
          </button>
        )}
        <button className="text-button" onClick={onEnd}>
          <ArrowLeft size={16} /> Return to learning
        </button>
      </div>
    </section>
  );
}
