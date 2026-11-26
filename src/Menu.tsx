import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  Coffee,
  Gamepad2,
  Play,
  SpellCheck,
  Star,
  Ticket,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import type { State, Subject } from "./model";
import { redeemTicket } from "./model";
import type { Change } from "./Parent";
import { weeklyData } from "./spelling/engine";
import { celebrate } from "./Effects";
import { ReadAloud } from "./ReadAloud";

const subjects = [
  { id: "spelling", label: "Spelling", icon: SpellCheck },
  { id: "math", label: "Math", icon: Calculator },
  { id: "reading", label: "Reading", icon: BookOpen },
] as const;
type MenuProps = {
  state: State;
  choose: (s: Subject) => void;
  spelling: () => void;
  arcade: () => void;
  homework: () => void;
  takeBreak: () => void;
};
function SubjectTiles({
  state,
  choose,
  arcade,
}: Pick<MenuProps, "state" | "choose" | "arcade">) {
  return (
    <div className="subject-tiles">
      {subjects
        .filter((s) => state.settings.subjects.includes(s.id))
        .map((s) => (
          <button
            key={s.id}
            className={`subject-tile tile-${s.id}`}
            aria-label={`Start ${s.label} mission`}
            onClick={() => choose(s.id)}
          >
            <s.icon
              className="tile-icon"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <strong>{s.label}</strong>
            <ArrowUpRight className="tile-arrow" aria-hidden="true" />
          </button>
        ))}
      <button
        className="subject-tile tile-arcade"
        onClick={arcade}
        aria-label="Explore games"
      >
        <Gamepad2 className="tile-icon" strokeWidth={1.7} aria-hidden="true" />
        <strong>Games</strong>
        <ArrowUpRight className="tile-arrow" aria-hidden="true" />
      </button>
    </div>
  );
}
export function HomeMenu(
  props: MenuProps & { learn: () => void; resume: () => void },
) {
  const data = weeklyData(props.state);
  const canSpell = props.state.settings.subjects.includes("spelling");
  return (
    <div className="home-menu">
      <section className="home-scene" aria-labelledby="home-title">
        <ReadAloud
          text="Welcome to Hero Academy. Tap Continue learning, or choose Spelling, Math, Reading or Games."
          settings={props.state.settings}
        />
        <img
          className="multiverse-art"
          src={import.meta.env.BASE_URL + "art/rebel-cover.webp"}
          srcSet={`${import.meta.env.BASE_URL}art/rebel-cover-small.webp 720w, ${import.meta.env.BASE_URL}art/rebel-cover.webp 1440w`}
          sizes="100vw"
          width="1440"
          height="810"
          alt="A boy hero with colorful goggles holding a radio on a rooftop"
          fetchPriority="high"
        />
        <div className="scene-shade" />
        <div className="scene-copy">
          <p className="edition-label">
            <Zap size={14} aria-hidden="true" /> PROJECT REBEL
          </p>
          <h1 id="home-title">
            YOUR WORLD.
            <br />
            <span>
              YOUR <em>POWER.</em>
            </span>
          </h1>
          <p className="scene-line">Every hero starts somewhere.</p>
          <button
            className="continue-button"
            onClick={canSpell && data.current ? props.resume : props.learn}
          >
            <span>
              {canSpell && data.current ? "RESUME" : "CONTINUE"}
              <br />
              LEARNING
            </span>
            <Play fill="currentColor" aria-hidden="true" />
          </button>
        </div>
      </section>
      <section
        className="home-selection"
        aria-label="Choose your next adventure"
      >
        <h2 className="selection-heading">Choose your next move</h2>
        <SubjectTiles {...props} />
      </section>
      <div className="menu-utilities">
        {canSpell && (
          <button onClick={props.spelling}>
            <SpellCheck size={20} />
            <span>Spelling HQ</span>
            <ArrowUpRight size={16} />
          </button>
        )}
        <button onClick={props.homework}>
          <Timer size={20} />
          <span>Homework</span>
        </button>
        <button onClick={props.takeBreak}>
          <Coffee size={20} />
          <span>Take a break</span>
        </button>
      </div>
    </div>
  );
}
export function LearnMenu(props: MenuProps) {
  const canSpell = props.state.settings.subjects.includes("spelling");
  return (
    <div className="learn-menu">
      <header className="page-title">
        <div>
          <p className="eyebrow">TRAINING GROUNDS</p>
          <h1>Pick your power.</h1>
          <p>Five questions. Your pace.</p>
        </div>
        <Zap size={44} aria-hidden="true" />
      </header>
      <SubjectTiles {...props} />
      <div className="learn-extras">
        {canSpell && (
          <button
            className="learn-feature spelling-feature"
            onClick={props.spelling}
          >
            <SpellCheck size={40} />
            <span>
              <small>YOUR SCHOOL WORDS</small>
              <strong>Spelling HQ</strong>
              <span>Eight ways to train.</span>
            </span>
            <ArrowUpRight />
          </button>
        )}
        <button
          className="learn-feature"
          onClick={props.homework}
          aria-label="Homework"
        >
          <Timer size={40} />
          <span>
            <small>FOCUS MODE</small>
            <strong>Homework</strong>
            <span>One thing at a time.</span>
          </span>
          <ArrowUpRight />
        </button>
        <button className="learn-feature" onClick={props.takeBreak}>
          <Coffee size={40} />
          <span>
            <small>RECHARGE</small>
            <strong>Take a break</strong>
            <span>Step away. Come back stronger.</span>
          </span>
          <ArrowUpRight />
        </button>
      </div>
    </div>
  );
}
export function Rewards({
  state,
  change,
  arcade,
}: {
  state: State;
  change: Change;
  arcade: () => void;
}) {
  const needed = Math.max(0, state.settings.starCost - state.stars);
  return (
    <div className="rewards-screen">
      <header className="page-title">
        <div>
          <p className="eyebrow">STARS & TICKETS</p>
          <h1>Your rewards.</h1>
        </div>
        <Trophy size={46} aria-hidden="true" />
      </header>
      <div className="rewards-layout">
        <section className="reward-vault panel">
          <div className="vault-symbol" aria-hidden="true">
            <Star fill="currentColor" />
          </div>
          <h2>Stars into play.</h2>
          <div className="wallet-totals">
            <span>
              <Star /> <b>{state.stars}</b> stars
            </span>
            <span>
              <Ticket /> <b>{state.tickets}</b> tickets
            </span>
          </div>
          <div className="progress-track gold">
            <div
              style={{
                width: `${Math.min(100, (state.stars / state.settings.starCost) * 100)}%`,
              }}
            />
          </div>
          <p>
            {needed
              ? `${needed} more stars to your next ticket.`
              : "Your next game ticket is ready."}
          </p>
          <button
            className="primary"
            disabled={needed > 0}
            onClick={() => {
              if (needed) return;
              change((s) => redeemTicket(s));
              celebrate("reward");
            }}
          >
            <Ticket size={22} /> Get a game ticket
          </button>
          <small>
            {state.settings.starCost} stars = 1 ticket ·{" "}
            {state.settings.gameMinutes} minutes of play
          </small>
        </section>
        <section className="reward-record panel">
          <p className="eyebrow">YOUR HERO RECORD</p>
          <h2>Look how far you've come.</h2>
          <div className="record-total">
            <strong>{state.totalStars}</strong>
            <span>stars earned, ever</span>
          </div>
          {subjects
            .filter((s) => state.settings.subjects.includes(s.id))
            .map((s) => (
              <div className="record-subject" key={s.id}>
                <s.icon />
                <span>{s.label}</span>
                <strong>{state.stats[s.id].correct}</strong>
                <small>solved</small>
              </div>
            ))}
          <button className="secondary full" onClick={arcade}>
            <Gamepad2 /> Visit arcade <ArrowUpRight size={18} />
          </button>
        </section>
      </div>
    </div>
  );
}
