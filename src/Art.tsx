import { Calculator, SpellCheck, BookOpen } from "lucide-react";
import type { Subject } from "./model";

export function MissionArt({ kind }: { kind: Subject }) {
  const Icon =
    kind === "math" ? Calculator : kind === "spelling" ? SpellCheck : BookOpen;

  return (
    <svg viewBox="0 0 220 140" aria-hidden="true">
      <defs>
        <pattern id={`dots-${kind}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#131018" opacity=".45" />
        </pattern>
        <path
          id={`stock-${kind}`}
          d="m60 26 42 3 35-11 32 5-4 23 17 18-12 14 4 26-31 2-23 14-24-10-40 3 7-24-20-15 16-23Z"
        />
      </defs>
      <path d="m21 43 28 6m-24 49 27-10m122-51 25-10m-17 68 20 7" fill="none" stroke="currentColor" strokeWidth="4" />
      <use href={`#stock-${kind}`} fill="#fff1d7" transform="translate(5 5)" />
      <use href={`#stock-${kind}`} fill="currentColor" stroke="#131018" strokeWidth="3" />
      <use href={`#stock-${kind}`} fill={`url(#dots-${kind})`} />
      <path fill="#fff1d7" stroke="#131018" strokeWidth="3" d="m76 43 66-6 7 65-69 2Z" />
      <Icon x="88" y="47" width="47" height="47" color="#131018" strokeWidth="1.7" />
    </svg>
  );
}
