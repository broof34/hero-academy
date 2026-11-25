import { useId } from "react";
import { Flame, Zap } from "lucide-react";
import type { ImpactLabel } from "./feedback";
const shapes = [
  "M25 82 76 78 65 35 120 58 144 12 180 52 227 20 238 66 305 42 286 93 346 112 296 145 333 192 272 183 250 228 210 192 164 227 141 185 80 212 82 167 20 168 51 126 8 112Z",
  "M24 69 92 73 83 20 143 57 176 9 204 58 265 19 258 75 335 63 300 108 351 151 290 161 305 213 246 190 216 233 178 192 127 226 113 181 49 202 62 150 8 125 62 111Z",
  "M12 100 74 76 56 27 130 53 168 5 204 56 270 19 266 74 343 81 303 123 347 168 278 172 273 223 211 192 167 235 139 184 65 215 76 159 20 169 52 126Z",
  "M15 75 85 79 65 23 138 52 163 7 205 51 258 17 265 77 344 65 299 120 350 167 276 174 289 219 220 191 183 235 144 190 76 221 78 165 12 161 48 120Z",
];
export function ComicBurst({
  label,
  variant = 0,
}: {
  label: ImpactLabel | "UNLOCKED!";
  variant?: number;
}) {
  const id = useId().replace(/:/g, "");
  const colors = [
    ["#ffe76a", "#ff3b76"],
    ["#ff8b37", "#ffdf76"],
    ["#79edff", "#bc7bff"],
    ["#f1dfad", "#ff3976"],
  ][variant % 4];
  const lines =
    label === "POWER UP!"
      ? ["POWER", "UP!"]
      : label === "ON FIRE!"
        ? ["ON", "FIRE!"]
        : [label];
  return (
    <svg
      className="comic-burst"
      data-label={label}
      viewBox="0 0 360 240"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`dots-${id}`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-12)"
        >
          <circle cx="2" cy="2" r="1.55" fill="#090b21" opacity=".26" />
        </pattern>
        <clipPath id={`clip-${id}`}>
          <path d={shapes[variant % 4]} />
        </clipPath>
      </defs>
      <g
        className="burst-speed-lines"
        fill="none"
        stroke="#090b17"
        strokeWidth="4"
      >
        <path d="M6 42 47 62M323 20l-23 34M332 216l-31-28M17 215l32-28" />
        <path
          d="m12 54 32 17m273-44-21 30m41 148-32-22"
          stroke={colors[0]}
          strokeWidth="3"
        />
      </g>
      <path
        d={shapes[variant % 4]}
        fill={colors[1]}
        stroke="#080a17"
        strokeWidth="10"
        transform="translate(5 5)"
      />
      <path
        d={shapes[variant % 4]}
        fill={colors[0]}
        stroke="#080a17"
        strokeWidth="7"
      />
      <path d={shapes[variant % 4]} fill={`url(#dots-${id})`} />
      <g
        clipPath={`url(#clip-${id})`}
        stroke="#fff6dd"
        strokeWidth="3"
        opacity=".65"
      >
        <path d="M27 130 95 112M270 123l65-12M153 31l13 40M233 186l28 17" />
      </g>
      <g
        transform="rotate(-7 180 120)"
        fontFamily="Academy Display, Impact, sans-serif"
        fontWeight="400"
        textAnchor="middle"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {lines.map((line, i) => (
          <g key={line}>
            <text
              x="185"
              y={lines.length === 1 ? 154 : 104 + i * 66}
              fontSize={lines.length === 1 ? (label.length > 7 ? 62 : 85) : 72}
              fill={colors[1]}
              stroke="#090b17"
              strokeWidth="13"
            >
              {line}
            </text>
            <text
              x="179"
              y={lines.length === 1 ? 148 : 98 + i * 66}
              fontSize={lines.length === 1 ? (label.length > 7 ? 62 : 85) : 72}
              fill={
                variant === 2
                  ? "#f8f2db"
                  : variant === 1
                    ? "#fff0b5"
                    : "#fff8df"
              }
              stroke="#090b17"
              strokeWidth="7"
            >
              {line}
            </text>
          </g>
        ))}
      </g>
      <g fill="#090b17">
        <path d="m38 32 13 4-7 16zM315 178l17 9-18 7zM112 14l6 16-16-7z" />
        <circle cx="331" cy="48" r="4" />
        <circle cx="32" cy="193" r="3" />
      </g>
    </svg>
  );
}
export function ComboBadge({ streak }: { streak: number }) {
  if (streak < 3) return null;
  return (
    <span
      className={`combo-badge ${streak >= 5 ? "combo-electric" : "combo-fire"}`}
      role="status"
      aria-label={`${streak} correct in a row`}
    >
      <span className="combo-energy" aria-hidden="true" />
      {streak >= 5 ? (
        <Zap size={21} fill="currentColor" />
      ) : (
        <Flame size={21} fill="currentColor" />
      )}
      <strong>{streak}</strong>
      <span>IN A ROW</span>
    </span>
  );
}
