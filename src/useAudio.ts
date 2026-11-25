import { useEffect, useLayoutEffect } from "react";
import type { Settings } from "./model";
import { sounds } from "./audio";
import { cancelSpeech } from "./speech";
export function useAudio(settings: Settings, quiet: boolean, route: string) {
  useEffect(() => {
    sounds.configure(settings);
    if (!settings.sound || settings.audioMuted || settings.speechVolume === 0)
      cancelSpeech();
  }, [settings]);
  useEffect(() => {
    const unlock = () => {
      if (!quiet) sounds.unlock();
    };
    const click = (event: MouseEvent) => {
      if (quiet || !(event.target instanceof Element)) return;
      const button = event.target.closest("button");
      if (
        !button ||
        button.disabled ||
        button.closest(
          ".question-panel,.weekly-turn,.audio-dialog,.game-session,.header-balances",
        )
      )
        return;
      sounds.play(
        button.closest(".primary-nav,.subject-tiles") ? "navigate" : "tap",
      );
    };
    const hide = () => {
      if (document.hidden) {
        sounds.stop();
        cancelSpeech();
      }
    };
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock);
    document.addEventListener("click", click);
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [quiet]);
  useLayoutEffect(() => {
    cancelSpeech();
    sounds.setQuiet(quiet);
  }, [quiet, route]);
  useEffect(
    () => () => {
      sounds.dispose();
      cancelSpeech();
    },
    [],
  );
}
