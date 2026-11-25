import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
const output = process.env.HERO_REVIEW_DIR || "/tmp/hero-academy-v41-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" }),
  page = await browser.newPage();
await page.goto("http://127.0.0.1:5174/hero-academy/");
const samples = await page.evaluate(async () => {
  const { soundRecipe } = await import("/hero-academy/src/audio.ts");
  const ctx = new OfflineAudioContext(1, 44100 * 12, 44100);
  const cues = [
    "navigate",
    "tap",
    "correct",
    "retry",
    "fire",
    "electric",
    "star",
    "reward",
    "legendary",
    "victory",
  ];
  for (let i = 0; i < cues.length; i++) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4200;
    const master = ctx.createGain();
    master.gain.value = 0.65;
    filter.connect(master);
    master.connect(ctx.destination);
    for (const n of soundRecipe(cues[i], i)) {
      const o = ctx.createOscillator(),
        g = ctx.createGain(),
        start = i * 1.15 + n.at,
        end = start + n.duration;
      o.type = n.wave;
      o.frequency.setValueAtTime(n.hz, start);
      if (n.end) o.frequency.exponentialRampToValueAtTime(n.end, end);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(n.gain, start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      o.connect(g);
      g.connect(filter);
      o.start(start);
      o.stop(end + 0.02);
    }
    if (["fire", "electric", "legendary", "victory"].includes(cues[i])) {
      const b = ctx.createBuffer(
          1,
          Math.ceil(ctx.sampleRate * 0.12),
          ctx.sampleRate,
        ),
        d = b.getChannelData(0);
      for (let j = 0; j < d.length; j++)
        d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 3) * 0.045;
      const source = ctx.createBufferSource();
      source.buffer = b;
      source.connect(filter);
      source.start(i * 1.15);
    }
  }
  return Array.from((await ctx.startRendering()).getChannelData(0));
});
const wav = Buffer.alloc(44 + samples.length * 2);
wav.write("RIFF", 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(44100, 24);
wav.writeUInt32LE(88200, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(samples.length * 2, 40);
for (let i = 0; i < samples.length; i++)
  wav.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767),
    44 + i * 2,
  );
await writeFile(`${output}/sound-palette.wav`, wav);
await browser.close();
console.log(
  JSON.stringify({
    file: `${output}/sound-palette.wav`,
    peak: Math.max(...samples.map(Math.abs).slice(0, 10000)),
  }),
);
