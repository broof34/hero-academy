import { grantStars, type State } from "../model";
import type {
  WeeklyData,
  WordProgress,
  WeeklyList,
  PracticeMode,
  PracticeItem,
  TurnMode,
  EvidenceKind,
  WordResult,
  SessionResult,
} from "./types";
import {
  normalizeWord,
  normalizeEntries,
  parseWords,
  validDate,
  parseListFile,
} from "./data";
import { shuffle, isMastered, reviewPriority, nextReviewAt } from "./adaptive";
export { parseWords, normalizeWord, exportList } from "./data";
export { isMastered, independentStreak } from "./adaptive";
export const emptyWeekly = (): WeeklyData => ({
  version: 1,
  lists: [],
  activeListId: null,
  progress: {},
  current: null,
  results: [],
});
export const weeklyData = (s: State): WeeklyData =>
  s.weeklySpelling ?? emptyWeekly();
export const blankProgress = (): WordProgress => ({
  recognition: 0,
  assisted: { attempts: 0, correct: 0 },
  independent: { attempts: 0, correct: 0 },
  test: { attempts: 0, correct: 0 },
  independentHistory: [],
  lastSeen: 0,
  lastMissed: 0,
  nextReview: 0,
});
export const wordProgress = (data: WeeklyData, word: string): WordProgress =>
  Object.hasOwn(data.progress, normalizeWord(word))
    ? data.progress[normalizeWord(word)]
    : blankProgress();
export type ListDraft = {
  id?: string;
  name: string;
  text?: string;
  words?: { text: string; sentence?: string }[];
  testDate: string;
};
export function upsertList(
  s: State,
  draft: ListDraft,
  now = Date.now(),
): State {
  const d = weeklyData(s);
  if (!draft.name.trim() || draft.name.trim().length > 80)
    throw new Error("Name your list using up to 80 characters.");
  if (!validDate(draft.testDate))
    throw new Error("Choose a valid test date, or leave it blank.");
  const existing = d.lists.find((l) => l.id === draft.id);
  if (!existing && d.lists.length >= 100)
    throw new Error("This browser already has 100 spelling lists.");
  const entries = draft.words
    ? normalizeEntries(draft.words)
    : parseWords(draft.text ?? "");
  const list: WeeklyList = {
    id: existing?.id ?? crypto.randomUUID(),
    name: draft.name.trim(),
    testDate: draft.testDate,
    createdAt: existing?.createdAt ?? now,
    archived: existing?.archived ?? false,
    words: entries.map((w) => ({
      ...w,
      id:
        existing?.words.find(
          (old) => normalizeWord(old.text) === normalizeWord(w.text),
        )?.id ?? crypto.randomUUID(),
    })),
  };
  return {
    ...s,
    weeklySpelling: {
      ...d,
      lists: existing
        ? d.lists.map((l) => (l.id === list.id ? list : l))
        : [list, ...d.lists],
      activeListId: d.activeListId ?? (!list.archived ? list.id : null),
    },
  };
}
export function activateList(s: State, id: string): State {
  const d = weeklyData(s);
  if (!d.lists.some((l) => l.id === id)) return s;
  return {
    ...s,
    weeklySpelling: {
      ...d,
      activeListId: id,
      lists: d.lists.map((l) => (l.id === id ? { ...l, archived: false } : l)),
    },
  };
}
export function archiveList(s: State, id: string, archived: boolean): State {
  const d = weeklyData(s);
  return {
    ...s,
    weeklySpelling: {
      ...d,
      activeListId: d.activeListId === id && archived ? null : d.activeListId,
      lists: d.lists.map((l) => (l.id === id ? { ...l, archived } : l)),
    },
  };
}
export function importList(s: State, text: string, now = Date.now()): State {
  const imported = upsertList(s, parseListFile(text), now);
  return activateList(imported, weeklyData(imported).lists[0].id);
}
export function revisionQueue(
  data: WeeklyData,
  listId: string,
  now = Date.now(),
  limit = 8,
  includeOlder = false,
): PracticeItem[] {
  const list = data.lists.find((l) => l.id === listId && !l.archived);
  if (!list) return [];
  const ordered = (items: PracticeItem[]) =>
    shuffle(items).sort((a, b) => {
      const x = wordProgress(data, a.word.text),
        y = wordProgress(data, b.word.text);
      return (
        reviewPriority(x, now) - reviewPriority(y, now) ||
        x.nextReview - y.nextReview
      );
    });
  const current = ordered(
    list.words.map((word) => ({ word, listId, mode: "listen" as const })),
  );
  let older: PracticeItem[] = [];
  if (includeOlder) {
    const used = new Set(current.map((i) => normalizeWord(i.word.text)));
    older = ordered(
      data.lists
        .filter((l) => !l.archived && l.id !== listId)
        .flatMap((l) =>
          l.words
            .filter(
              (w) =>
                !used.has(normalizeWord(w.text)) &&
                wordProgress(data, w.text).lastSeen > 0 &&
                wordProgress(data, w.text).nextReview <= now,
            )
            .map((word) => {
              used.add(normalizeWord(word.text));
              return { word, listId: l.id, mode: "listen" as const };
            }),
        ),
    ).slice(0, 2);
  }
  return [
    ...current.slice(0, Math.max(1, limit - older.length)),
    ...older,
  ].slice(0, limit);
}
export function beginPractice(
  s: State,
  listId: string,
  mode: PracticeMode,
  now = Date.now(),
): State {
  const data = weeklyData(s),
    list = data.lists.find((l) => l.id === listId && !l.archived);
  if (data.current || !list) return s;
  let items =
    mode === "test"
      ? shuffle(list.words).map((word) => ({
          word,
          listId,
          mode: "test" as TurnMode,
        }))
      : revisionQueue(
          data,
          listId,
          now,
          mode === "tricky" ? 100 : 8,
          mode === "mixed",
        );
  if (mode === "tricky")
    items = items
      .filter((i) => {
        const p = wordProgress(data, i.word.text);
        return (
          p.lastMissed > 0 && (p.lastMissed >= p.lastSeen || !isMastered(p))
        );
      })
      .slice(0, 8);
  items = items.map((item) => {
    const p = wordProgress(data, item.word.text);
    const turn: TurnMode =
      mode === "mixed"
        ? p.recognition === 0 &&
          p.assisted.attempts === 0 &&
          p.independent.attempts === 0 &&
          p.test.attempts === 0
          ? "flashcards"
          : p.assisted.correct === 0 && !isMastered(p)
            ? "builder"
            : "listen"
        : mode === "tricky"
          ? "listen"
          : (mode as TurnMode);
    return { ...item, mode: turn };
  });
  if (!items.length) return s;
  return {
    ...s,
    weeklySpelling: {
      ...data,
      current: {
        id: crypto.randomUUID(),
        listId,
        listName: list.name,
        mode,
        items,
        index: 0,
        results: [],
        startedAt: now,
        assistedIndices: [],
      },
    },
  };
}
function recordEvidence(
  s: State,
  data: WeeklyData,
  result: WordResult,
  sessionId: string,
): { state: State; data: WeeklyData } {
  const old = wordProgress(data, result.word);
  const progress: WordProgress = {
    ...old,
    lastSeen: result.at,
    lastMissed: result.correct ? old.lastMissed : result.at,
  };
  if (result.kind === "recognition") progress.recognition++;
  else
    progress[result.kind] = {
      attempts: old[result.kind].attempts + 1,
      correct: old[result.kind].correct + Number(result.correct),
    };
  if (
    (result.kind === "independent" || result.kind === "test") &&
    !old.independentHistory.some((h) => h.sessionId === sessionId)
  )
    progress.independentHistory = [
      { sessionId, at: result.at, correct: result.correct },
      ...old.independentHistory,
    ].slice(0, 12);
  progress.nextReview = nextReviewAt(
    result.at,
    result.kind,
    result.correct,
    progress.independentHistory,
  );
  const state =
    result.kind === "recognition"
      ? s
      : {
          ...s,
          stats: {
            ...s.stats,
            spelling: {
              attempts: s.stats.spelling.attempts + 1,
              correct: s.stats.spelling.correct + Number(result.correct),
            },
          },
        };
  return {
    state,
    data: {
      ...data,
      progress: { ...data.progress, [normalizeWord(result.word)]: progress },
    },
  };
}
export function submitTurn(
  s: State,
  sessionId: string,
  index: number,
  answer: string,
  assisted: boolean,
  now = Date.now(),
): State {
  const data = weeklyData(s),
    session = data.current;
  if (!session || session.id !== sessionId || session.index !== index) return s;
  const item = session.items[index],
    key = normalizeWord(item.word.text),
    correct = item.mode === "flashcards" || normalizeWord(answer) === key;
  const kind: EvidenceKind =
    item.mode === "flashcards"
      ? "recognition"
      : assisted ||
          session.assistedIndices.includes(index) ||
          ["builder", "missing", "cover"].includes(item.mode)
        ? "assisted"
        : item.mode === "test"
          ? "test"
          : "independent";
  const result: WordResult = {
      word: item.word.text,
      answer: answer.slice(0, 300),
      correct,
      kind,
      at: now,
    },
    results = [...session.results, result];
  let next = s;
  let weekly: WeeklyData = {
    ...data,
    current: { ...session, index: index + 1, results },
  };
  // Test answers remain staged until the final submission, including rewards and evidence.
  const completed = index === session.items.length - 1;
  const evidence =
    session.mode === "test" ? (completed ? results : []) : [result];
  for (const entry of evidence) {
    const recorded = recordEvidence(next, weekly, entry, sessionId);
    next = recorded.state;
    weekly = recorded.data;
    if (entry.correct && entry.kind !== "recognition")
      next = grantStars(next, 1, "spelling");
  }
  if (index === session.items.length - 1) {
    const bonus = session.mode === "test" ? 2 : 1;
    next = grantStars(next, bonus, "spelling");
    const finished: SessionResult = {
      id: session.id,
      listId: session.listId,
      listName: session.listName,
      mode: session.mode,
      results,
      finishedAt: now,
      stars:
        results.filter((r) => r.correct && r.kind !== "recognition").length +
        bonus,
    };
    weekly = {
      ...weekly,
      current: null,
      results: [finished, ...data.results].slice(0, 50),
    };
  }
  return { ...next, weeklySpelling: weekly };
}
export function abandonPractice(s: State): State {
  const d = weeklyData(s);
  return { ...s, weeklySpelling: { ...d, current: null } };
}
export function missingLetters(word: string): {
  display: string;
  answer: string;
  indices: number[];
} {
  const chars = Array.from(word),
    letters = chars
      .map((c, i) => (/\p{L}/u.test(c) ? i : -1))
      .filter((i) => i >= 0);
  const indices = letters.filter((_, i) => letters.length === 1 || i % 2 === 1);
  if (!indices.length && letters.length) indices.push(letters[0]);
  return {
    display: chars
      .map((c, i) => (indices.includes(i) ? "_" : c === " " ? " / " : c))
      .join(" "),
    answer: indices.map((i) => chars[i]).join(""),
    indices,
  };
}
export function fillMissing(word: string, answer: string): string {
  if (normalizeWord(answer) === normalizeWord(word)) return answer;
  const mask = missingLetters(word),
    chars = Array.from(word),
    entered = Array.from(answer.normalize("NFC"));
  if (entered.length !== mask.indices.length) return answer;
  mask.indices.forEach((at, i) => (chars[at] = entered[i]));
  return chars.join("");
}
export function markAssisted(s: State, id: string, index: number): State {
  const d = weeklyData(s),
    x = d.current;
  if (
    !x ||
    x.id !== id ||
    x.index !== index ||
    x.assistedIndices.includes(index)
  )
    return s;
  return {
    ...s,
    weeklySpelling: {
      ...d,
      current: { ...x, assistedIndices: [...x.assistedIndices, index] },
    },
  };
}
