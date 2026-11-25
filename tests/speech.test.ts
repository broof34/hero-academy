import { describe, expect, it } from "vitest";
import { spokenMath, spellingInstruction, wordStimulus } from "../src/speech";
import { soundRecipe } from "../src/audio";
describe("safe spoken content", () => {
  it("reads math symbols without adding the answer", () => {
    expect(spokenMath("3 + 2 = ?")).toBe("3 plus 2 equals what number?");
    expect(spokenMath("8 − 3 = ?")).toBe("8 minus 3 equals what number?");
  });
  it("keeps hidden targets and sentences out of instructions and dictation examples", () => {
    for (const mode of ["test", "listen", "cover", "missing"] as const) {
      expect(spellingInstruction(mode)).not.toContain("balloon");
      expect(wordStimulus(mode, "balloon", "The balloon is red.")).toBe(
        "balloon",
      );
    }
    expect(wordStimulus("builder", "balloon", "The balloon is red.")).toBe(
      "balloon. The balloon is red. balloon.",
    );
    expect(spellingInstruction("cover", true)).toContain("from memory");
  });
});
describe("original audio recipes", () => {
  it("uses bounded short notes and distinct, varied cues", () => {
    expect(soundRecipe("navigate")).not.toEqual(soundRecipe("correct"));
    expect(soundRecipe("correct", 0)).not.toEqual(soundRecipe("correct", 1));
    for (const cue of [
      "tap",
      "navigate",
      "retry",
      "correct",
      "fire",
      "electric",
      "legendary",
      "star",
      "reward",
      "victory",
    ] as const) {
      for (const note of soundRecipe(cue)) {
        expect(note.hz).toBeGreaterThan(0);
        expect(note.at + note.duration).toBeLessThan(1);
        expect(note.gain).toBeLessThanOrEqual(0.05);
      }
    }
  });
});
