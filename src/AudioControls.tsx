import { useRef, useId, useState } from "react";
import { Volume2, X } from "lucide-react";
import type { Settings } from "./model";
import { useModalFocus } from "./useModalFocus";
import { sounds } from "./audio";
import { speak } from "./speech";
export function AudioFields({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const id = useId();
  const [voiceNote, setVoiceNote] = useState("");
  return (
    <div className="audio-fields">
      <label className="check-label master-audio">
        <input
          type="checkbox"
          checked={settings.audioMuted}
          onChange={(e) => onChange({ audioMuted: e.target.checked })}
        />
        Mute all audio
      </label>
      <fieldset>
        <legend>Sound effects</legend>
        <label className="check-label">
          <input
            type="checkbox"
            aria-label="Sound effects"
            checked={settings.effectsSound}
            onChange={(e) =>
              onChange({
                effectsSound: e.target.checked,
                ...(e.target.checked ? { audioMuted: false } : {}),
              })
            }
          />
          Enable sound effects
        </label>
        <label htmlFor={id + "-effects"}>
          Effects volume{" "}
          <output>{Math.round(settings.effectsVolume * 100)}%</output>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            id={id + "-effects"}
            aria-label="Effects volume"
            value={settings.effectsVolume}
            onChange={(e) =>
              onChange({ effectsVolume: Number(e.target.value) })
            }
          />
        </label>
        <button
          type="button"
          className="secondary"
          disabled={
            settings.audioMuted ||
            !settings.effectsSound ||
            settings.effectsVolume === 0
          }
          onClick={() => sounds.preview("correct", settings)}
        >
          <Volume2 size={18} />
          Preview effect
        </button>
      </fieldset>
      <fieldset>
        <legend>Read aloud</legend>
        <label className="check-label">
          <input
            type="checkbox"
            aria-label="Spoken instructions"
            checked={settings.sound}
            onChange={(e) =>
              onChange({
                sound: e.target.checked,
                ...(e.target.checked ? { audioMuted: false } : {}),
              })
            }
          />
          Enable spoken instructions
        </label>
        <label htmlFor={id + "-speech-volume"}>
          Speech volume{" "}
          <output>{Math.round(settings.speechVolume * 100)}%</output>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            id={id + "-speech-volume"}
            aria-label="Speech volume"
            value={settings.speechVolume}
            onChange={(e) => onChange({ speechVolume: Number(e.target.value) })}
          />
        </label>
        <label htmlFor={id + "-speech-rate"}>
          Speech speed <output>{settings.speechRate.toFixed(2)}×</output>
          <input
            type="range"
            min="0.6"
            max="1.2"
            step="0.05"
            id={id + "-speech-rate"}
            aria-label="Speech speed"
            value={settings.speechRate}
            onChange={(e) => onChange({ speechRate: Number(e.target.value) })}
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={settings.autoRead}
            onChange={(e) => onChange({ autoRead: e.target.checked })}
          />
          Read instructions automatically
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={settings.spokenEncouragement}
            onChange={(e) =>
              onChange({ spokenEncouragement: e.target.checked })
            }
          />
          Spoken encouragement
        </label>
        <button
          type="button"
          className="secondary"
          disabled={
            settings.audioMuted ||
            !settings.sound ||
            settings.speechVolume === 0
          }
          onClick={() =>
            setVoiceNote(
              speak(
                "Your pace. Your power. Ready for your next mission?",
                settings,
                setVoiceNote,
              ),
            )
          }
        >
          <Volume2 size={18} />
          Preview voice
        </button>
        {voiceNote && (
          <p role="status" className="fine-print">
            {voiceNote}
          </p>
        )}
      </fieldset>
      <fieldset className="music-fields">
        <legend>Arcade music</legend>
        <label className="check-label">
          <input
            type="checkbox"
            aria-label="Arcade music"
            checked={settings.musicSound}
            onChange={(e) =>
              onChange({
                musicSound: e.target.checked,
                ...(e.target.checked ? { audioMuted: false } : {}),
              })
            }
          />
          Enable kart music
        </label>
        <label htmlFor={id + "-music"}>
          Music volume{" "}
          <output>{Math.round(settings.musicVolume * 100)}%</output>
          <input
            id={id + "-music"}
            aria-label="Music volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(e) => onChange({ musicVolume: Number(e.target.value) })}
          />
        </label>
        <p className="fine-print">
          For Super Kart only. Learning screens stay music-free.
        </p>
      </fieldset>
      <p className="fine-print">
        Read aloud uses an English voice installed on this device. If none is
        available, a grown-up can help.
      </p>
    </div>
  );
}
export function AudioDialog({
  settings,
  onChange,
  onClose,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useModalFocus(dialog);
  return (
    <dialog
      ref={dialog}
      className="modal-backdrop"
      aria-labelledby="audio-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <section className="modal audio-dialog">
        <button
          className="icon-button close"
          aria-label="Close audio settings"
          onClick={onClose}
        >
          <X />
        </button>
        <p className="eyebrow">YOUR MIX</p>
        <h2 id="audio-title">Audio settings</h2>
        <div className="audio-dialog-scroll">
          <AudioFields settings={settings} onChange={onChange} />
        </div>
        <div className="audio-dialog-footer">
          <p className="audio-saved" role="status">
            Changes saved on this device.
          </p>
          <button className="primary full" onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    </dialog>
  );
}
