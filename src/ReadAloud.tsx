import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import type { Settings } from "./model";
import { cancelSpeech, speak, speechVersion } from "./speech";
export function ReadAloud({
  text,
  settings,
  label = "Hear instructions",
  auto = true,
}: {
  text: string;
  settings: Settings;
  label?: string;
  auto?: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    setNote("");
    if (auto && settings.autoRead && settings.sound) {
      // Delay a little to let route cleanup finish; canceled on every turn/route change.
      const version = speechVersion();
      const timer = setTimeout(() => {
        if (
          version === speechVersion() &&
          !document.hidden &&
          !document.querySelector("dialog[open]")
        )
          setNote(speak(text, settings, setNote));
      }, 180);
      return () => {
        clearTimeout(timer);
        cancelSpeech();
      };
    }
    return () => cancelSpeech();
  }, [
    text,
    auto,
    settings.autoRead,
    settings.sound,
    settings.audioMuted,
    settings.speechRate,
    settings.speechVolume,
  ]);
  return (
    <div className="read-aloud">
      <button
        type="button"
        className="text-button speech-replay"
        onClick={() => setNote(speak(text, settings, setNote))}
      >
        <Volume2 size={21} aria-hidden="true" />
        <span className="replay-label">{label}</span>
      </button>
      {note && (
        <p className="fine-print" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
