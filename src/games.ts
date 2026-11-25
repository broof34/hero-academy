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
    preview: "art/kart-gameplay.jpg",
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
    preview: "art/patrol-gameplay.jpg",
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
};
