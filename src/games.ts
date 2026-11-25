import type { GameId } from "./model";
// Each adapter is a self-contained, sandboxed document. Unmounting stops its world.
export const games: Record<
  GameId,
  { title: string; description: string; path: string; tag: string }
> = {
  space: {
    title: "Star Defender",
    description: "Protect the galaxy, one star at a time.",
    path: "games/space/index.html",
    tag: "SPACE ADVENTURE",
  },
  racer: {
    title: "Cosmic Rally",
    description: "Buckle up for an out-of-this-world lap.",
    path: "games/racer/index.html",
    tag: "RACING",
  },
};
