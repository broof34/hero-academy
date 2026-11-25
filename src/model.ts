import type { WeeklyData } from "./spelling/types";
import { hydrateWeekly } from "./spelling/data";
export type Subject = "math" | "spelling" | "reading";
export type GameId = "space" | "racer";
export type Settings = {
  subjects: Subject[];
  difficulty: 10 | 20;
  starCost: number;
  gameMinutes: number;
  focusMinutes: number;
  breakMinutes: number;
  sound: boolean;
  reducedMotion: boolean;
};
export type Session = { game: GameId; endsAt: number };
export type CustomQuestion = {
  id: string;
  subject: "math" | "spelling";
  prompt: string;
  answer: string;
};
export type Stats = { attempts: number; correct: number };
export type State = {
  version: 1;
  stars: number;
  totalStars: number;
  tickets: number;
  stats: Record<Subject, Stats>;
  completed: string[];
  history: { subject: Subject | "effort"; stars: number; at: number }[];
  settings: Settings;
  custom: CustomQuestion[];
  session: Session | null;
  weeklySpelling?: WeeklyData;
};
export const STORAGE_KEY = "hero-academy:v1";
export const freshState = (): State => ({
  version: 1,
  stars: 0,
  totalStars: 0,
  tickets: 0,
  stats: {
    math: { attempts: 0, correct: 0 },
    spelling: { attempts: 0, correct: 0 },
    reading: { attempts: 0, correct: 0 },
  },
  completed: [],
  history: [],
  custom: [],
  session: null,
  settings: {
    subjects: ["math", "spelling", "reading"],
    difficulty: 10,
    starCost: 10,
    gameMinutes: 3,
    focusMinutes: 10,
    breakMinutes: 3,
    sound: false,
    reducedMotion: false,
  },
});
const bounded = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : min;
export function updateSettings(s: State, patch: Partial<Settings>): State {
  const v = { ...s.settings, ...patch };
  const subjects = v.subjects.filter((x) =>
    ["math", "spelling", "reading"].includes(x),
  );
  return {
    ...s,
    settings: {
      ...v,
      subjects: subjects.length ? subjects : ["math"],
      difficulty: v.difficulty === 20 ? 20 : 10,
      starCost: bounded(v.starCost, 1, 100),
      gameMinutes: bounded(v.gameMinutes, 1, 15),
      focusMinutes: bounded(v.focusMinutes, 1, 60),
      breakMinutes: bounded(v.breakMinutes, 1, 30),
      sound: v.sound === true,
      reducedMotion: v.reducedMotion === true,
    },
  };
}
export function grantStars(
  s: State,
  n: number,
  subject: Subject | "effort" = "effort",
): State {
  const amount = bounded(n, 0, 100);
  return {
    ...s,
    stars: s.stars + amount,
    totalStars: s.totalStars + amount,
    history: [{ subject, stars: amount, at: Date.now() }, ...s.history].slice(
      0,
      100,
    ),
  };
}
export function submitAnswer(
  s: State,
  q: { id: string; subject: Subject; answer: string },
  answer: string,
): State {
  if (!answer.trim() || s.completed.includes(q.id)) return s;
  const correct = answer.trim().toLowerCase() === q.answer.trim().toLowerCase();
  let next = {
    ...s,
    stats: {
      ...s.stats,
      [q.subject]: {
        attempts: s.stats[q.subject].attempts + 1,
        correct: s.stats[q.subject].correct + Number(correct),
      },
    },
  };
  if (correct)
    next = {
      ...grantStars(next, 1, q.subject),
      completed: [...s.completed, q.id].slice(-2000),
    };
  return next;
}
export function redeemTicket(s: State): State {
  return s.stars < s.settings.starCost
    ? s
    : { ...s, stars: s.stars - s.settings.starCost, tickets: s.tickets + 1 };
}
export function startSession(s: State, game: GameId, now = Date.now()): State {
  return s.session || s.tickets < 1
    ? s
    : {
        ...s,
        tickets: s.tickets - 1,
        session: { game, endsAt: now + s.settings.gameMinutes * 60000 },
      };
}
export const remainingSeconds = (session: Session | null, now = Date.now()) =>
  session ? Math.max(0, Math.ceil((session.endsAt - now) / 1000)) : 0;
export const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function hydrate(raw: unknown): State {
  if (!object(raw) || raw.version !== 1)
    throw new Error("Unrecognized save version.");
  const s = freshState();
  for (const key of ["stars", "totalStars", "tickets"] as const) {
    const v = raw[key];
    if (v !== undefined) {
      if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0)
        throw new Error("Invalid progress.");
      s[key] = v;
    }
  }
  if (raw.settings !== undefined) {
    if (!object(raw.settings)) throw new Error("Invalid settings.");
    const r = raw.settings;
    if (
      r.subjects !== undefined &&
      (!Array.isArray(r.subjects) ||
        r.subjects.some((x) => typeof x !== "string"))
    )
      throw new Error("Invalid subjects.");
    s.settings = updateSettings(s, r as Partial<Settings>).settings;
  }
  if (raw.stats !== undefined) {
    if (!object(raw.stats)) throw new Error("Invalid statistics.");
    for (const sub of ["math", "spelling", "reading"] as const) {
      const v = raw.stats[sub];
      if (v !== undefined) {
        if (
          !object(v) ||
          !Number.isSafeInteger(v.attempts) ||
          !Number.isSafeInteger(v.correct) ||
          (v.attempts as number) < (v.correct as number) ||
          (v.correct as number) < 0
        )
          throw new Error("Invalid statistics.");
        s.stats[sub] = v as Stats;
      }
    }
  }
  if (Array.isArray(raw.completed))
    s.completed = raw.completed
      .filter((x): x is string => typeof x === "string")
      .slice(-2000);
  if (Array.isArray(raw.history))
    s.history = raw.history
      .filter(
        (x): x is State["history"][number] =>
          object(x) &&
          ["math", "spelling", "reading", "effort"].includes(
            x.subject as string,
          ) &&
          typeof x.stars === "number" &&
          typeof x.at === "number",
      )
      .slice(0, 100);
  if (Array.isArray(raw.custom))
    s.custom = raw.custom
      .filter(
        (x): x is CustomQuestion =>
          object(x) &&
          typeof x.id === "string" &&
          ["math", "spelling"].includes(x.subject as string) &&
          typeof x.prompt === "string" &&
          typeof x.answer === "string",
      )
      .slice(0, 100);
  if (raw.session !== undefined && raw.session !== null) {
    const v = raw.session;
    if (
      !object(v) ||
      !["space", "racer"].includes(v.game as string) ||
      typeof v.endsAt !== "number" ||
      !Number.isFinite(v.endsAt)
    )
      throw new Error("Invalid arcade session.");
    s.session = v as Session;
  }
  if (raw.weeklySpelling !== undefined)
    s.weeklySpelling = hydrateWeekly(raw.weeklySpelling);
  return s;
}
