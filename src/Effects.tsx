import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Star } from "lucide-react";
import {
  advanceStreak,
  feedbackFor,
  type ImpactLabel,
  type Tier,
} from "./feedback";
import { ComicBurst } from "./ComicBurst";
import { sounds } from "./audio";
import { speak } from "./speech";
import type { Settings } from "./model";
type Kind = "correct" | "victory" | "reward";
type Effect = {
  kind: Kind;
  combo: number;
  id: number;
  x: number;
  y: number;
  label: ImpactLabel | "UNLOCKED!";
  tier: Tier;
  variant: number;
};
const eventName = "academy-celebrate",
  clearName = "academy-clear-effects";
let streak = 0;
let frame: number | undefined;
export function clearEffects() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  window.dispatchEvent(new Event(clearName));
}
export function celebrate(kind: Kind, combo = 0) {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = undefined;
    window.dispatchEvent(
      new CustomEvent(eventName, { detail: { kind, combo } }),
    );
  });
}
export function recordAnswer(correct: boolean, firstAttempt = true) {
  streak = advanceStreak(streak, correct, firstAttempt);
  if (correct) celebrate("correct", streak);
  else sounds.play("retry");
  return streak;
}
export function EffectLayer({
  settings,
  quiet,
  route,
}: {
  settings: Settings;
  quiet: boolean;
  route: string;
}) {
  const [effect, setEffect] = useState<Effect | null>(null);
  const [osReduced, setOsReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    sequence = useRef(0);
  const reduced = settings.reducedMotion || osReduced;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOsReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    function receive(event: Event) {
      if (quiet || document.hidden) return;
      const { kind, combo } = (
        event as CustomEvent<{ kind: Kind; combo: number }>
      ).detail;
      const chosen = feedbackFor(combo, sequence.current++);
      const target = document
        .querySelector('[data-testid="star-balance"]')
        ?.getBoundingClientRect();
      const tier = kind === "correct" ? chosen.tier : "legendary";
      setEffect({
        kind,
        combo,
        id: sequence.current,
        x: (target?.x ?? innerWidth - 70) + (target?.width ?? 0) / 2,
        y: (target?.y ?? 35) + (target?.height ?? 0) / 2,
        label:
          kind === "reward"
            ? "UNLOCKED!"
            : kind === "victory"
              ? "AWESOME!"
              : chosen.label,
        tier,
        variant: kind === "reward" ? 3 : chosen.variant,
      });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => setEffect(null),
        kind === "correct" ? (tier === "impact" ? 850 : 1150) : 1650,
      );
      sounds.play(
        kind === "correct" ? (tier === "impact" ? "correct" : tier) : kind,
      );
      if (settings.spokenEncouragement && settings.sound)
        speak(
          kind === "correct"
            ? "You did it! Tap next when you are ready."
            : kind === "reward"
              ? "Ticket unlocked. Choose a game in the arcade."
              : "Mission complete. Great effort, hero.",
          settings,
        );
    }
    const clear = () => {
      setEffect(null);
      if (timer.current) clearTimeout(timer.current);
    };
    window.addEventListener(eventName, receive);
    window.addEventListener(clearName, clear);
    const hidden = () => {
      if (document.hidden) clear();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener(eventName, receive);
      window.removeEventListener(clearName, clear);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [quiet, settings]);
  useEffect(() => {
    setEffect(null);
    if (timer.current) clearTimeout(timer.current);
  }, [route]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (frame !== undefined) cancelAnimationFrame(frame);
    },
    [],
  );
  if (!effect || quiet || reduced) return null;
  const major = effect.tier !== "impact";
  return (
    <div
      className={`effect-layer fx-${effect.kind} tier-${effect.tier}`}
      data-tier={effect.tier}
      key={effect.id}
      aria-hidden="true"
    >
      <div
        className={
          effect.kind === "correct"
            ? "fx-impact graphic-impact"
            : "fx-victory-stamp graphic-victory"
        }
      >
        <ComicBurst label={effect.label} variant={effect.variant} />
      </div>
      <div className="fx-shockwave" />
      <svg className="fx-splash" viewBox="0 0 300 200">
        <path d="m52 93 20-8-13-28 35 17 21-46 16 45 28-18-4 33 58-8-38 28 40 31-55-5 5 35-31-22-16 30-7-43-40 12 20-26z" />
        <circle cx="204" cy="56" r="6" />
        <circle cx="58" cy="150" r="4" />
        <circle cx="232" cy="110" r="3" />
      </svg>
      {major && (
        <svg
          className="fx-electric"
          viewBox="0 0 800 500"
          preserveAspectRatio="none"
        >
          <path d="M15 180 80 150 55 190 150 90 130 150 245 25M555 475 660 365 640 420 745 310 720 375 790 320" />
        </svg>
      )}
      {effect.kind !== "correct" && <div className="fx-hero-reaction" />}
      {effect.kind !== "reward" &&
        Array.from({ length: major ? 5 : 3 }, (_, i) => (
          <Star
            key={i}
            className="fx-flight"
            fill="currentColor"
            style={
              {
                "--tx": `${effect.x - innerWidth * 0.5}px`,
                "--ty": `${effect.y - innerHeight * 0.6}px`,
                "--delay": `${i * 65}ms`,
              } as CSSProperties
            }
          />
        ))}
      {(effect.kind !== "correct" || effect.tier === "legendary") &&
        Array.from({ length: 24 }, (_, i) => (
          <i
            key={i}
            className="fx-confetti"
            style={
              {
                "--angle": `${i * 137.5}deg`,
                "--distance": `${140 + (i % 5) * 38}px`,
                "--color": ["#ff3856", "#55dfff", "#bd8aff", "#ffad45"][i % 4],
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}
