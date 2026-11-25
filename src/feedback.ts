export type ImpactLabel =
  | "POW!"
  | "BOOM!"
  | "ZAP!"
  | "AWESOME!"
  | "SMASH!"
  | "NICE!"
  | "SUPER!"
  | "ON FIRE!"
  | "POWER UP!";
export type Tier = "impact" | "fire" | "electric" | "legendary";
const ordinary: ImpactLabel[] = [
  "POW!",
  "ZAP!",
  "NICE!",
  "SUPER!",
  "SMASH!",
  "BOOM!",
];
export function advanceStreak(
  previous: number,
  correct: boolean,
  firstAttempt = true,
) {
  return correct && firstAttempt ? previous + 1 : 0;
}
export function feedbackFor(
  streak: number,
  variation: number,
): { label: ImpactLabel; tier: Tier; variant: number } {
  if (streak > 0 && streak % 10 === 0)
    return { label: "AWESOME!", tier: "legendary", variant: 3 };
  if (streak > 0 && streak % 5 === 0)
    return { label: "POWER UP!", tier: "electric", variant: 2 };
  if (streak === 3) return { label: "ON FIRE!", tier: "fire", variant: 1 };
  return {
    label: ordinary[variation % ordinary.length],
    tier: "impact",
    variant: variation % 4,
  };
}
