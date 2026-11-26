import type { GameId } from "./model";
export type GameDefinition = {
  title: string;
  description: string;
  path: string;
  tag: string;
  preview: string;
  controls: { key: string; action: string }[];
  touch: string;
  brief: string;
  features: string[];
  fallbackPath?: string;
};
// Keep these V1 identifiers: old saves and active deadlines remain valid.
export const games: Record<GameId, GameDefinition> = {
  racer: {
    title: "Super Kart 3D",
    description:
      "Six racers. Two circuits. One epic race. Drift into the lead and leave your rivals in the dust.",
    path: "games/kart/index.html",
    tag: "3D KART RACING",
    preview: "art/kart-gameplay.webp",
    brief: "Before you race",
    features: ["AI rivals", "Drift & boost", "Touch controls"],
    controls: [
      { key: "↑ / W", action: "Accelerate (auto-go is on)" },
      { key: "← → / A D", action: "Steer your kart" },
      { key: "SHIFT", action: "Hold to drift" },
      { key: "SPACE", action: "Use your power-up" },
    ],
    touch:
      "Use LEFT and RIGHT to steer. Hold DRIFT through a turn. Tap ITEM when you collect a power-up. Auto-go and steering help start on.",
    fallbackPath: "games/racer/index.html",
  },
  space: {
    title: "Galactic Patrol",
    description:
      "Pilot a starfighter through enemy waves. Collect power-ups. Keep the galaxy safe.",
    path: "games/galactic/index.html",
    tag: "SPACE ACTION",
    preview: "art/patrol-gameplay.webp",
    brief: "Before you fly",
    features: ["Enemy waves", "Ship upgrades", "Auto-fire"],
    controls: [
      { key: "↑ ↓ / W S", action: "Fly up and down" },
      { key: "SPACE", action: "Fire (auto-fire is on)" },
      { key: "P", action: "Pause the action" },
    ],
    touch:
      "Drag your ship up and down, or hold the UP and DOWN buttons. Your ship fires for you. Line up with enemy ships and collect the glowing power-ups.",
    fallbackPath: "games/space/index.html",
  },
  rooftop: {
    title: "Rooftop Rush",
    description: "Race across the skyline and leap over hazards on the rooftops.",
    path: "games/rooftop/index.html",
    preview: "art/rooftop-gameplay.webp",
    tag: "ENDLESS RUNNER",
    brief: "Before you run",
    features: ["One-button jumps", "Gentle speed ramp"],
    controls: [{ key: "SPACE / ↑", action: "Jump" }],
    touch: "Tap the rooftop or the Jump button. Wait until a barrier is close, then leap over it.",
  },
  smash: {
    title: "Power Smash",
    description: "Bounce a zap ball off your shield and crack every energy brick.",
    path: "games/smash/index.html",
    preview: "art/smash-gameplay.webp",
    tag: "BRICK BREAKER",
    brief: "Before you smash",
    features: ["Wide shield", "Three tries per round"],
    controls: [
      { key: "← →", action: "Move your shield" },
      { key: "SPACE", action: "Serve the zap ball" },
    ],
    touch: "Tap or drag on the court to move your shield. You can also use the arrow buttons. Tap Serve to send the ball flying.",
  },
  flight: {
    title: "Hero Flight",
    description: "Boost through the gaps between sky gates and see how far you can fly.",
    path: "games/flight/index.html",
    preview: "art/flight-gameplay.webp",
    tag: "ONE-TOUCH FLIGHT",
    brief: "Before you fly",
    features: ["Wide gates", "One-button boost"],
    controls: [{ key: "SPACE / ↑", action: "Boost up. Let go to glide down." }],
    touch: "Tap the sky or Boost to rise. Tap again as you drift below the middle of the gap.",
  },
  merge: {
    title: "Power Merge",
    description: "Slide matching power tiles together. Build your first 64, then see how high you can go.",
    path: "games/merge/index.html",
    preview: "art/merge-gameplay.webp",
    tag: "MERGE PUZZLE",
    brief: "Before you merge",
    features: ["Play at your pace", "Numbers and symbols"],
    controls: [{ key: "↑ → ↓ ←", action: "Slide all tiles that way" }],
    touch: "Swipe the board or tap an arrow button. When equal numbers meet, they join into a bigger power tile.",
  },
};
