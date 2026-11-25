import type {
  WeeklyData,
  WeeklyList,
  WeeklyWord,
  PracticeMode,
  TurnMode,
  EvidenceKind,
  WordProgress,
} from "./types";
export const modes: PracticeMode[] = [
  "flashcards",
  "builder",
  "missing",
  "cover",
  "listen",
  "test",
  "tricky",
  "mixed",
];
const turnModes: TurnMode[] = [
  "flashcards",
  "builder",
  "missing",
  "cover",
  "listen",
  "test",
];
const kinds: EvidenceKind[] = [
  "recognition",
  "assisted",
  "independent",
  "test",
];
export const cleanWord = (value: string) =>
  value
    .normalize("NFC")
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑–—]/g, "-")
    .trim()
    .replace(/\s+/g, " ");
export const normalizeWord = (value: string) => cleanWord(value).toLowerCase();
export function validWord(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Array.from(value).length <= 100 &&
    /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(cleanWord(value))
  );
}
export function validDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function normalizeEntries(
  entries: { text: string; sentence?: string }[],
): { text: string; sentence: string }[] {
  if (entries.length > 100) throw new Error("Use up to 100 words per list.");
  const seen = new Map<string, { text: string; sentence: string }>();
  for (const entry of entries) {
    if (!validWord(entry.text))
      throw new Error(
        "Use words with letters, spaces, apostrophes or hyphens (up to 100 letters).",
      );
    const text = cleanWord(entry.text),
      key = normalizeWord(text);
    const sentence = (entry.sentence ?? "").trim();
    if (sentence.length > 400)
      throw new Error("Keep sentences under 400 characters.");
    const old = seen.get(key);
    if (old) {
      if (!old.sentence) old.sentence = sentence;
    } else seen.set(key, { text, sentence });
  }
  if (seen.size === 0) throw new Error("Add at least one spelling word.");
  return [...seen.values()];
}
export const parseWords = (text: string) =>
  normalizeEntries(
    text
      .split(/[,\n\r]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((text) => ({ text })),
  );
export function exportList(list: WeeklyList): string {
  return JSON.stringify(
    {
      type: "hero-academy-spelling-list",
      version: 1,
      name: list.name,
      testDate: list.testDate,
      words: list.words.map(({ text, sentence }) => ({ text, sentence })),
    },
    null,
    2,
  );
}
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = 200): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= max;
const count = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export function parseListFile(text: string): {
  name: string;
  testDate: string;
  words: { text: string; sentence: string }[];
} {
  if (text.length > 200000) throw new Error("This list file is too large.");
  const v: unknown = JSON.parse(text);
  if (
    !obj(v) ||
    v.type !== "hero-academy-spelling-list" ||
    v.version !== 1 ||
    !str(v.name, 80) ||
    !Array.isArray(v.words) ||
    typeof v.testDate !== "string" ||
    !validDate(v.testDate)
  )
    throw new Error(
      "Choose a Hero Academy spelling-list JSON file (version 1).",
    );
  const entries = v.words.map((w) => {
    if (typeof w === "string") return { text: w };
    if (
      !obj(w) ||
      typeof w.text !== "string" ||
      (w.sentence !== undefined && typeof w.sentence !== "string")
    )
      throw new Error("Invalid word in the list file.");
    return { text: w.text, sentence: w.sentence as string | undefined };
  });
  return {
    name: v.name.trim(),
    testDate: v.testDate,
    words: normalizeEntries(entries),
  };
}
function validWordRecord(v: unknown): v is WeeklyWord {
  return (
    obj(v) &&
    str(v.id) &&
    validWord(v.text) &&
    typeof v.sentence === "string" &&
    v.sentence.length <= 400
  );
}
function validResult(v: unknown): boolean {
  return (
    obj(v) &&
    validWord(v.word) &&
    typeof v.answer === "string" &&
    v.answer.length <= 300 &&
    typeof v.correct === "boolean" &&
    kinds.includes(v.kind as EvidenceKind) &&
    count(v.at)
  );
}
function validProgress(v: unknown): v is WordProgress {
  if (
    !obj(v) ||
    !count(v.recognition) ||
    !count(v.lastSeen) ||
    !count(v.lastMissed) ||
    !count(v.nextReview) ||
    !Array.isArray(v.independentHistory) ||
    v.independentHistory.length > 12
  )
    return false;
  for (const k of ["assisted", "independent", "test"]) {
    const x = v[k];
    if (
      !obj(x) ||
      !count(x.attempts) ||
      !count(x.correct) ||
      x.correct > x.attempts
    )
      return false;
  }
  return v.independentHistory.every(
    (h) =>
      obj(h) &&
      str(h.sessionId) &&
      count(h.at) &&
      typeof h.correct === "boolean",
  );
}
export function hydrateWeekly(raw: unknown): WeeklyData {
  if (
    !obj(raw) ||
    raw.version !== 1 ||
    !Array.isArray(raw.lists) ||
    raw.lists.length > 100 ||
    !obj(raw.progress) ||
    !Array.isArray(raw.results) ||
    raw.results.length > 50
  )
    throw new Error("Invalid weekly spelling save.");
  for (const list of raw.lists) {
    if (
      !obj(list) ||
      !str(list.id) ||
      !str(list.name, 80) ||
      !count(list.createdAt) ||
      typeof list.archived !== "boolean" ||
      typeof list.testDate !== "string" ||
      !validDate(list.testDate) ||
      !Array.isArray(list.words) ||
      list.words.length < 1 ||
      list.words.length > 100 ||
      !list.words.every(validWordRecord) ||
      new Set(list.words.map((w) => normalizeWord(w.text))).size !==
        list.words.length
    )
      throw new Error("Invalid weekly spelling list.");
  }
  if (new Set(raw.lists.map((l) => l.id)).size !== raw.lists.length)
    throw new Error("Duplicate spelling list IDs.");
  if (
    raw.activeListId !== null &&
    (!str(raw.activeListId) ||
      !raw.lists.some((l) => l.id === raw.activeListId && !l.archived))
  )
    throw new Error("Invalid active spelling list.");
  for (const [word, progress] of Object.entries(raw.progress))
    if (
      !validWord(word) ||
      normalizeWord(word) !== word ||
      !validProgress(progress)
    )
      throw new Error("Invalid per-word spelling progress.");
  for (const r of raw.results)
    if (
      !obj(r) ||
      !str(r.id) ||
      !str(r.listId) ||
      !str(r.listName, 80) ||
      !modes.includes(r.mode as PracticeMode) ||
      !count(r.finishedAt) ||
      !count(r.stars) ||
      !Array.isArray(r.results) ||
      r.results.length > 100 ||
      !r.results.every(validResult)
    )
      throw new Error("Invalid spelling results.");
  const current = raw.current;
  if (current !== null) {
    if (
      !obj(current) ||
      !str(current.id) ||
      !str(current.listId) ||
      !str(current.listName, 80) ||
      !modes.includes(current.mode as PracticeMode) ||
      !count(current.index) ||
      !count(current.startedAt) ||
      !Array.isArray(current.items) ||
      current.items.length < 1 ||
      current.items.length > 100 ||
      current.index >= current.items.length ||
      !current.items.every(
        (x) =>
          obj(x) &&
          validWordRecord(x.word) &&
          str(x.listId) &&
          turnModes.includes(x.mode as TurnMode),
      ) ||
      !Array.isArray(current.assistedIndices) ||
      !current.assistedIndices.every(
        (i) => count(i) && i < (current.items as unknown[]).length,
      ) ||
      !Array.isArray(current.results) ||
      current.results.length !== current.index ||
      !current.results.every(validResult)
    )
      throw new Error("Invalid spelling session.");
  }
  return raw as unknown as WeeklyData;
}
