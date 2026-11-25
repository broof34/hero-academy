import type { Settings } from "./model";
import type { Question } from "./learning";
import type { TurnMode } from "./spelling/types";
import { sounds } from "./audio";
let generation = 0;
export const speechVersion = () => generation;
export function cancelSpeech() {
  generation++;
  if (typeof window !== "undefined" && "speechSynthesis" in window)
    window.speechSynthesis.cancel();
  sounds.duck(false);
}
export function spokenMath(text: string) {
  return text
    .replace(/\+/g, " plus ")
    .replace(/[−–]/g, " minus ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 minus $2")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/=/g, " equals ")
    .replace(/\?/g, " what number? ")
    .replace(/_{2,}/g, " blank ")
    .replace(/\s+/g, " ")
    .trim();
}
export function questionInstruction(q: Question) {
  return [
    q.passage,
    q.prompt.replace(/_{2,}/g, " blank "),
    q.equation ? spokenMath(q.equation) : "",
  ]
    .filter(Boolean)
    .join(". ");
}
export function spellingInstruction(mode: TurnMode, covered = false) {
  if (mode === "flashcards")
    return "Look at the word. Tap Hear word to listen. Then tap I have studied this word.";
  if (mode === "builder")
    return "Tap the letter tiles to build the word, or type it. Then check spelling.";
  if (mode === "missing")
    return "Fill in the missing letters. You can tap Hear word, then type and check spelling.";
  if (mode === "cover")
    return covered
      ? "Spell the word from memory. Then check spelling."
      : "Look at the word. When you are ready, tap Cover the word.";
  return mode === "test"
    ? "Tap Hear word. Type the word you hear, then save your test answer. Results appear at the end."
    : "Tap Hear word. Type the word you hear, then check spelling.";
}
/** Explicit dictation may speak the target; instruction/automatic speech never receives it. */
export function wordStimulus(mode: TurnMode, word: string, sentence: string) {
  return ["flashcards", "builder"].includes(mode) && sentence
    ? `${word}. ${sentence.trim().replace(/[.!?]+$/, "")}. ${word}.`
    : word;
}
export function speak(
  text: string,
  settings: Settings | boolean,
  onError?: (message: string) => void,
): string {
  const enabled =
    typeof settings === "boolean"
      ? settings
      : settings.sound && !settings.audioMuted;
  if (!enabled) return "Turn on spoken instructions in the grown-up zone.";
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window))
    return "This browser does not support read aloud.";
  const volume = typeof settings === "boolean" ? 0.8 : settings.speechVolume;
  if (volume === 0)
    return "Speech volume is set to zero. Open Audio settings to turn it up.";
  try {
    cancelSpeech();
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.localService && v.lang.toLowerCase().startsWith("en"));
    if (!voice)
      return "No local English voice is available on this device yet. Try again in a moment or ask a grown-up to read.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = typeof settings === "boolean" ? 0.85 : settings.speechRate;
    utterance.volume = volume;
    const current = generation;
    sounds.duck(true);
    utterance.onend = () => {
      if (current === generation) sounds.duck(false);
    };
    utterance.onerror = () => {
      if (current === generation) {
        sounds.duck(false);
        onError?.(
          "Read aloud could not start. Tap the speaker again or ask a grown-up to help.",
        );
      }
    };
    speechSynthesis.speak(utterance);
    return "";
  } catch {
    sounds.duck(false);
    return "Read aloud is unavailable right now. Ask a grown-up to help.";
  }
}
