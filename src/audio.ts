import type { Settings } from "./model";
export type SoundCue =
  | "tap"
  | "navigate"
  | "correct"
  | "retry"
  | "fire"
  | "electric"
  | "legendary"
  | "star"
  | "reward"
  | "victory";
type Note = {
  hz: number;
  end?: number;
  at: number;
  duration: number;
  gain: number;
  wave?: OscillatorType;
};
/** Original bounded synth recipes, never samples or network requests. */
export function soundRecipe(cue: SoundCue, variation = 0): Note[] {
  const lift = [1, 1.0595, 0.9439][variation % 3];
  const note = (
    hz: number,
    at = 0,
    duration = 0.09,
    gain = 0.045,
    end?: number,
    wave: OscillatorType = "triangle",
  ): Note => ({
    hz: hz * lift,
    at,
    duration,
    gain,
    end: end ? end * lift : undefined,
    wave,
  });
  switch (cue) {
    case "tap":
      return [note(270, 0, 0.035, 0.018, 180)];
    case "navigate":
      return [note(330, 0, 0.065, 0.025), note(495, 0.045, 0.08, 0.025)];
    case "retry":
      return [note(294, 0, 0.12, 0.025), note(330, 0.1, 0.15, 0.02)];
    case "star":
      return [note(1175, 0, 0.13, 0.02, 1568, "sine")];
    case "correct":
      return [
        note(523, 0, 0.08),
        note(784, 0.07, 0.13),
        note(1318, 0.16, 0.12, 0.018, 1568, "sine"),
      ];
    case "fire":
      return [
        note(196, 0, 0.18, 0.025, 392, "sawtooth"),
        note(659, 0.05, 0.1),
        note(988, 0.14, 0.18, 0.035),
      ];
    case "electric":
      return [
        note(220, 0, 0.12, 0.025, 880, "sawtooth"),
        note(784, 0.08, 0.1, 0.03),
        note(1175, 0.17, 0.22, 0.035),
      ];
    case "reward":
      return [
        note(440, 0, 0.09),
        note(554, 0.08, 0.1),
        note(659, 0.16, 0.12),
        note(880, 0.25, 0.24, 0.035),
      ];
    case "legendary":
    case "victory":
      return [
        note(262, 0, 0.25, 0.025),
        note(523, 0, 0.13),
        note(659, 0.11, 0.13),
        note(784, 0.22, 0.13),
        note(1047, 0.34, 0.36, 0.04),
        note(1318, 0.34, 0.3, 0.015, undefined, "sine"),
      ];
  }
}
export class SoundEngine {
  private context: AudioContext | null = null;
  private volume = 0.45;
  private enabled = false;
  private quiet = false;
  private active = new Set<AudioScheduledSourceNode>();
  private masters = new Set<GainNode>();
  private variation = 0;
  private lastUi = 0;
  private ducked = false;
  configure(settings: Settings) {
    this.enabled = settings.effectsSound && !settings.audioMuted;
    this.volume = settings.effectsVolume;
    if (!this.enabled || this.volume === 0) this.stop();
    else this.updateGain();
  }
  setQuiet(value: boolean) {
    this.quiet = value;
    if (value) this.stop();
  }
  unlock() {
    if (this.quiet || !this.enabled || this.volume === 0) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch {
      /* Optional audio. */
    }
  }
  private updateGain() {
    if (!this.context) return;
    for (const gain of this.masters)
      gain.gain.setTargetAtTime(
        this.volume * (this.ducked ? 0.16 : 1),
        this.context.currentTime,
        0.015,
      );
  }
  duck(value: boolean) {
    this.ducked = value;
    this.updateGain();
  }
  preview(cue: SoundCue, settings: Settings) {
    const enabled = this.enabled,
      volume = this.volume,
      quiet = this.quiet;
    this.quiet = false;
    this.enabled = settings.effectsSound && !settings.audioMuted;
    this.volume = settings.effectsVolume;
    this.play(cue);
    this.enabled = enabled;
    this.volume = volume;
    this.quiet = quiet;
  }
  play(cue: SoundCue) {
    if (
      this.quiet ||
      !this.enabled ||
      this.volume === 0 ||
      typeof document === "undefined" ||
      document.hidden
    )
      return;
    const now = performance.now();
    if ((cue === "tap" || cue === "navigate") && now - this.lastUi < 100)
      return;
    if (cue === "tap" || cue === "navigate") this.lastUi = now;
    this.unlock();
    const context = this.context;
    if (!context || context.state === "closed") return;
    if (this.active.size > 20) this.stop(false);
    try {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 4200;
      const master = context.createGain();
      master.gain.value = this.volume * (this.ducked ? 0.16 : 1);
      this.masters.add(master);
      filter.connect(master);
      master.connect(context.destination);
      const recipe = soundRecipe(cue, this.variation++);
      let finish = context.currentTime;
      for (const n of recipe) {
        const oscillator = context.createOscillator(),
          envelope = context.createGain();
        oscillator.type = n.wave ?? "triangle";
        const start = context.currentTime + n.at,
          end = start + n.duration;
        finish = Math.max(finish, end);
        oscillator.frequency.setValueAtTime(n.hz, start);
        if (n.end)
          oscillator.frequency.exponentialRampToValueAtTime(n.end, end);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(n.gain, start + 0.008);
        envelope.gain.exponentialRampToValueAtTime(0.0001, end);
        oscillator.connect(envelope);
        envelope.connect(filter);
        this.active.add(oscillator);
        oscillator.onended = () => {
          this.active.delete(oscillator);
          oscillator.disconnect();
          envelope.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(end + 0.02);
      }
      // Filtered short noise adds a paper/energy transient without loud explosions.
      if (["fire", "electric", "legendary", "victory"].includes(cue)) {
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * 0.12),
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
          data[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3) * 0.045;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(filter);
        this.active.add(source);
        source.onended = () => {
          this.active.delete(source);
          source.disconnect();
        };
        source.start();
      }
      // An inaudible scheduled source releases the graph after the last note, without a JS timer.
      const release = context.createOscillator();
      const silent = context.createGain();
      silent.gain.value = 0;
      release.connect(silent);
      silent.connect(context.destination);
      this.active.add(release);
      release.onended = () => {
        this.active.delete(release);
        release.disconnect();
        silent.disconnect();
        filter.disconnect();
        master.disconnect();
        this.masters.delete(master);
      };
      release.start();
      release.stop(finish + 0.05);
    } catch {
      /* Browser audio failure must not interrupt learning. */
    }
  }
  stop(suspend = true) {
    for (const source of this.active) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.active.clear();
    if (suspend && this.context && this.context.state !== "closed")
      void this.context.suspend().catch(() => {});
  }
  dispose() {
    this.stop();
    void this.context?.close().catch(() => {});
    this.context = null;
    for (const gain of this.masters) gain.disconnect();
    this.masters.clear();
  }
}
export const sounds = new SoundEngine();
