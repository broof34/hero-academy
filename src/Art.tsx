export function HeroArt() {
  return (
    <svg
      viewBox="0 0 460 300"
      role="img"
      aria-label="An original young space hero flying past planets"
    >
      <defs>
        <linearGradient id="cape" x2="1" y2="1">
          <stop stopColor="#ffaf69" />
          <stop offset="1" stopColor="#ed647c" />
        </linearGradient>
        <linearGradient id="suit" x2="1" y2="1">
          <stop stopColor="#9ca1ff" />
          <stop offset="1" stopColor="#6653d8" />
        </linearGradient>
      </defs>
      <g fill="#d2ceff">
        <circle cx="80" cy="55" r="2" />
        <circle cx="390" cy="75" r="3" />
        <circle cx="345" cy="245" r="2" />
        <path d="m110 180 3 9 9 3-9 3-3 9-3-9-9-3 9-3zM365 145l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
      </g>
      <circle cx="341" cy="66" r="29" fill="#a1b5f5" />
      <path
        d="M293 68q48 25 96-2"
        fill="none"
        stroke="#d9cbff"
        strokeWidth="9"
        transform="rotate(-25 341 66)"
      />
      <circle cx="80" cy="233" r="47" fill="#7268b3" />
      <path
        d="M45 221q35-19 72-4M40 238q39-16 86-4"
        fill="none"
        stroke="#8b80ce"
        strokeWidth="9"
      />
      <g transform="rotate(13 235 158)">
        <path
          d="M211 118q-76 16-89 107 41-24 72-5 8-50 45-65z"
          fill="url(#cape)"
        />
        <path
          d="m221 208-4 39q-6 19 10 19h23v-17l-8-4 10-35M265 207l20 36q5 12 18 3l12-12-12-12-9 3-8-34"
          fill="#8e8bea"
          stroke="#383161"
          strokeWidth="4"
        />
        <path
          d="M211 128q37-18 66 4l8 65q-33 32-79 10z"
          fill="url(#suit)"
          stroke="#bdbafa"
          strokeWidth="4"
        />
        <path
          d="m219 141-32 15-20-15"
          fill="none"
          stroke="#b6b9ff"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="m273 140 24 11 19-24"
          fill="none"
          stroke="#b6b9ff"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <circle cx="164" cy="139" r="12" fill="#ffd1a7" />
        <circle cx="318" cy="124" r="12" fill="#ffd1a7" />
        <circle
          cx="246"
          cy="90"
          r="48"
          fill="#c8d9ff"
          stroke="#e9eeff"
          strokeWidth="5"
        />
        <path
          d="M208 92q-3-44 37-41 42 0 40 44v10q-41 31-77-4z"
          fill="#30365a"
        />
        <ellipse cx="246" cy="92" rx="30" ry="31" fill="#f4bb8d" />
        <path
          d="M214 78q4-36 34-30 32 4 31 32-15-1-28-19-10 17-37 17"
          fill="#48334a"
        />
        <path
          d="M222 90q8-9 17 0M253 90q8-9 16 0"
          fill="none"
          stroke="#403451"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M237 104q10 12 20-1"
          fill="white"
          stroke="#bd766e"
          strokeWidth="2"
        />
        <path d="m249 147-18 25h14l-6 20 26-30h-16l8-15z" fill="#ffe78d" />
        <path
          d="M207 200q39 13 76-4"
          stroke="#ffe19a"
          strokeWidth="8"
          fill="none"
        />
      </g>
      <path
        d="m168 247-30 14m31-1-14 11"
        stroke="#f7bd82"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function MissionArt({
  kind,
}: {
  kind: "math" | "spelling" | "reading";
}) {
  return (
    <svg viewBox="0 0 220 140" aria-hidden="true">
      {kind === "math" ? (
        <>
          <circle cx="158" cy="57" r="39" fill="#a7c9fc" />
          <g transform="rotate(-12 90 75)">
            <rect x="43" y="32" width="81" height="87" rx="17" fill="#fff" />
            <text
              x="83"
              y="90"
              textAnchor="middle"
              fontSize="49"
              fontWeight="800"
              fill="#4d7cc7"
            >
              2
            </text>
          </g>
          <g transform="rotate(13 146 82)">
            <rect
              x="114"
              y="56"
              width="65"
              height="69"
              rx="15"
              fill="#487dce"
            />
            <path
              d="M132 90h29m-14-14v29"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
          <path d="m182 17 3 8 9 3-9 3-3 9-3-9-8-3 8-3z" fill="#f3c96c" />
        </>
      ) : kind === "spelling" ? (
        <>
          <circle cx="107" cy="69" r="48" fill="#ffe0bb" />
          <g transform="rotate(-13 76 78)">
            <rect x="35" y="38" width="70" height="77" rx="13" fill="white" />
            <text
              x="70"
              y="92"
              textAnchor="middle"
              fontSize="48"
              fontWeight="800"
              fill="#c9783d"
            >
              A
            </text>
          </g>
          <g transform="rotate(10 143 89)">
            <rect
              x="111"
              y="57"
              width="65"
              height="69"
              rx="13"
              fill="#ec9e59"
            />
            <text
              x="143"
              y="107"
              textAnchor="middle"
              fontSize="42"
              fontWeight="800"
              fill="white"
            >
              b
            </text>
          </g>
          <path d="m166 25 3 8 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#c98447" />
        </>
      ) : (
        <>
          <circle cx="112" cy="67" r="47" fill="#bce9df" />
          <path
            d="M37 50q37-11 72 8 34-19 73-8v64q-36-10-73 8-36-18-72-8z"
            fill="#48a58e"
          />
          <path
            d="M43 40q36-8 66 11 33-19 67-11v65q-36-9-67 9-31-18-66-9z"
            fill="white"
          />
          <path
            d="M109 51v63M55 63q22-2 41 8m-41 9q22-2 41 8m27-17q19-10 40-8m-40 25q19-10 40-8"
            fill="none"
            stroke="#a4cfc3"
            strokeWidth="4"
          />
          <path d="m161 26 3 7 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e5b651" />
        </>
      )}
    </svg>
  );
}
export function GameArt({ game }: { game: "space" | "racer" }) {
  return (
    <svg viewBox="0 0 420 180" aria-hidden="true">
      <defs>
        <linearGradient id={"bg" + game} x2="1" y2="1">
          <stop stopColor={game === "space" ? "#22335b" : "#444579"} />
          <stop offset="1" stopColor="#101a34" />
        </linearGradient>
      </defs>
      <rect width="420" height="180" fill={"url(#bg" + game + ")"} />
      {game === "space" ? (
        <>
          <g fill="#acb9df">
            {[30, 80, 140, 210, 270, 330, 390].map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={20 + ((i * 37) % 145)}
                r={(i % 2) + 1}
              />
            ))}
          </g>
          <circle cx="335" cy="46" r="28" fill="#635aa7" />
          <path
            d="m101 75 18-18 18 18-9 16h-18zm80-24 18-18 18 18-9 16h-18zm81 24 18-18 18 18-9 16h-18z"
            fill="#a1cfb5"
          />
          <path d="m207 104-29 48 29-12 29 12z" fill="#b3a2f3" />
          <path d="m207 127-6 8h12z" fill="#ffe6a1" />
          <path
            d="M207 91V80m-12 19V89m24 10V89"
            stroke="#ffdd8b"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <circle cx="334" cy="44" r="24" fill="#b9a8e8" />
          <path d="m194 58-130 122h300L226 58z" fill="#6a7198" />
          <path
            d="m196 58-14 122m42-122 14 122"
            stroke="#e0d9f2"
            strokeWidth="3"
            strokeDasharray="15 12"
          />
          <path d="m163 142 13-46h58l17 46v28h-88z" fill="#b2a0fc" />
          <path d="m184 103-9 29h63l-11-29z" fill="#243658" />
          <rect x="167" y="143" width="18" height="9" rx="3" fill="#ffe3a6" />
          <rect x="230" y="143" width="17" height="9" rx="3" fill="#ffe3a6" />
          <path
            d="m160 175 6-18m81 18-3-18"
            stroke="#101b34"
            strokeWidth="12"
          />
        </>
      )}
    </svg>
  );
}
