import { it, expect } from "vitest";
import { makeQuestion, topics } from "../src/learning";
import { freshState } from "../src/model";
it("generates answerable choices for every skill at both levels", () => {
  for (const difficulty of [10, 20] as const)
    for (const subject of ["math", "spelling", "reading"] as const)
      for (const topic of topics[subject])
        for (let i = 0; i < 30; i++) {
          const q = makeQuestion(
            subject,
            topic.id,
            { ...freshState().settings, difficulty },
            [],
            i,
          );
          expect(q.prompt.length).toBeGreaterThan(4);
          expect(q.answer.length).toBeGreaterThan(0);
          if (q.choices) {
            expect(q.choices).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
          }
          if (
            subject === "math" &&
            ["addition", "subtraction"].includes(topic.id)
          )
            expect(Number(q.answer)).toBeLessThanOrEqual(difficulty);
        }
});
it("uses adult custom questions and supplies a safe fallback", () => {
  const q = makeQuestion(
    "math",
    "custom",
    freshState().settings,
    [{ id: "c", subject: "math", prompt: "One plus one?", answer: "2" }],
    0,
  );
  expect(q.prompt).toBe("One plus one?");
  expect(q.answer).toBe("2");
  expect(
    makeQuestion("spelling", "custom", freshState().settings, [], 0).answer,
  ).toBeTruthy();
});
