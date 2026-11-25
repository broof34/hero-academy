import { Calculator, SpellCheck, BookOpen } from "lucide-react";
export function MissionArt({
  kind,
}: {
  kind: "math" | "spelling" | "reading";
}) {
  const Icon =
    kind === "math" ? Calculator : kind === "spelling" ? SpellCheck : BookOpen;
  return (
    <svg viewBox="0 0 220 140" aria-hidden="true">
      <defs>
        <pattern
          id={"dots-" + kind}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".18" />
        </pattern>
      </defs>
      <path
        d="M67 17h87l33 53-33 53H67L34 70z"
        fill="currentColor"
        opacity=".055"
      />
      <path
        d="M67 17h87l33 53-33 53H67L34 70z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".35"
      />
      <path
        d="M33 40h28m99 60h28M45 100h25m95-63h30"
        stroke="currentColor"
        opacity=".3"
        strokeWidth="3"
      />
      <rect
        x="70"
        y="26"
        width="80"
        height="88"
        fill={"url(#dots-" + kind + ")"}
      />
      <Icon
        x="78"
        y="38"
        width="64"
        height="64"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
