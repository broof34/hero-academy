/* Adapted from SchoolWordList lib/mastery.ts & revisionList.ts (MIT, 2026 J. Fang)
 * and Brightleap engine/spacedRep.js & shuffle.js (MIT, 2026 Brightleap).
 * Full notices: vendor/school-word-list/LICENSE and vendor/brightleap/LICENSE. */
import type { WordProgress, IndependentEvidence } from "./types";
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function independentStreak(attempts: IndependentEvidence[]): number {
  const sorted = [...attempts].sort((a, b) => b.at - a.at),
    seen = new Set<string>();
  let count = 0;
  for (const attempt of sorted) {
    if (seen.has(attempt.sessionId)) continue;
    seen.add(attempt.sessionId);
    if (!attempt.correct) break;
    count++;
  }
  return count;
}
export const isMastered = (progress: WordProgress) =>
  independentStreak(progress.independentHistory) >= 3;
export function reviewPriority(progress: WordProgress, now: number): number {
  if (progress.lastMissed > 0 && progress.lastMissed >= progress.lastSeen)
    return 0;
  if (progress.lastSeen === 0) return 2;
  return now >= progress.nextReview ? 1 : 3;
}
export const nextReviewAt = (
  now: number,
  kind: string,
  correct: boolean,
  history: IndependentEvidence[],
) =>
  !correct
    ? now
    : now +
      (kind === "recognition"
        ? 3600000
        : kind === "assisted"
          ? 21600000
          : Math.min(14, 2 ** Math.max(0, independentStreak(history) - 1)) *
            86400000);
