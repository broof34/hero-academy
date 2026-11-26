# Hero Academy V6 · Project REBEL

Hero Academy is a superhero learning game for a first grader and the grown-up
helping them. Project REBEL borrows the graphic language of punk comics through
cutout lettering, offset ink, halftone and torn poster edges. The rooftop hero,
lightning signal and lettering are original Hero Academy artwork.

## Foundations

The shared layout lives in `src/v4.css` and `src/v41.css`. The current print
system and its tokens live in `src/rebel.css`.

| Role | Token or value | Applied to |
| --- | --- | --- |
| Base ink | `--rebel-ink: #131018` | Masthead, canvas, ink outlines and labels on bright stock |
| Solid surfaces | `--rebel-surface: #241e27`, `--rebel-inset: #19151e` | Cards, forms, dialogs, secondary actions and quiet reading areas |
| Paper | `--rebel-paper: #fff1d7` | Page banners, headings and high-contrast labels |
| Supporting text and borders | `--rebel-muted: #dfd4da`, `--rebel-edge: #8c7788` | Secondary labels, controls and panel boundaries |
| Poster red | `--rebel-red: #ff5264` | Masthead rule, current desktop tab, cover action and Spelling card |
| Electric cyan | `--rebel-cyan: #62e7ff` | Focus, Math card, tickets and Galactic Patrol trim |
| Pink | `--rebel-pink: #fb80c9` | Reading card, Learn and Spelling HQ banners |
| Ticket yellow | `--rebel-yellow: #f4dc46` | Games card, Arcade, Rewards and celebrations |
| Lime | `--rebel-lime: #bde65d` | Focused activities and grown-up settings |
| Typography | Bangers on the cover, Barlow Condensed Black on short display labels, Lexend for learning, Arial for adult forms | All faces use local fonts or the system stack |
| Spacing | `--rebel-gutter: clamp(18px, 4vw, 64px)`, `--rebel-gap: clamp(14px, 2vw, 28px)`, `--rebel-hit: 48px` | Cover margins, panel separation and main touch controls |
| Print texture | `--rebel-dots`, `--rebel-offset`, `public/brand/rebel-backdrop.svg` | Static halftone on decorative edges, offset shadows and the interior collage |
| Press feedback | `--rebel-press: 110ms cubic-bezier(.2, .65, .3, 1)` | Two-pixel press on main and secondary actions and subject cards |

Use `navigation.svg` for the cutout wordmark and split-ink lightning signal in
the masthead, `wordmark.svg` for startup, and `wordmark-mono.svg` for monochrome
placement. `signal.svg` and the favicon carry the standalone bolt. The cover
uses responsive local WebP at 720w and 1440w. The six game previews are WebP
captures from the actual games. Art and font provenance are documented in
`public/art/ATTRIBUTION.md` and `THIRD_PARTY.md`.

## Screen patterns

- **Home.** Keep the full-width rooftop cover with the masthead and main action
  on the left. The four angled cards overlap the artwork edge. Their labels
  share the same color and icon assignments in Learn, where the cards form a
  compact mission index. Keep direct links to Spelling HQ, Homework and breaks.
- **Navigation.** Keep Home, Learn, Arcade, Rewards and Grown-ups in that order.
  Icons, labels and the current tab remain visible. The destination bar moves
  below the masthead on tablet and to the bottom on phones. Currency and audio
  controls stay in the masthead.
- **Learning.** Spelling red, Math cyan and Reading pink connect each subject
  card to its original cutout mission art, progress strip, and answer controls.
  Keep instructions and answer keys on solid surfaces. Use warm paper for
  reading passages and movable letters. A separate green answer state pairs
  with written feedback. The homework and break clocks keep their lime accent
  and large tabular digits within a solid panel.
- **Spelling HQ.** The current list and mastery tally sit side by side whenever
  space allows. Mode cards use a solid icon stamp and a title above their
  descriptions. Preserve the familiar keyboard layout and keep the practice
  test’s answers and correctness signals hidden until the report.
- **Arcade and Rewards.** Use offset game posters with a shared preview, title,
  description, cost and Play hierarchy. Briefings carry the same display type
  and a ticket-edge launch panel. Keep the timer and launch conditions clearly
  labeled. Carry the kart’s red and the patrol’s cyan through the game cards and
  briefings. Use a pink skyline for Rooftop Rush, orange energy bricks for
  Power Smash, lime gates against a teal sky for Hero Flight, and warm yellow
  trim with numbered power tiles for Power Merge. Keep touch controls outside
  the playfield and reserve motion for gameplay and brief success feedback.
  Rewards pair the perforated ticket panel with a paper lifetime
  tally and subject-colored rows.
- **Grown-ups.** Mute the backdrop quickly below the paper title. Keep familiar
  sentence-case headings, solid form fields, predictable jump links and visible
  status or validation text. Pair section jump labels with icons and use the
  same solid wells for audio preferences in the dashboard and mixer.

## Interaction and verification

Keep actions rectangular with clear primary, secondary, hover, focus, pressed and
disabled states. Keyboard focus uses a cyan outline and a dark separation edge.
Color reinforces visible labels and icons. Keep decorative clipping and texture
away from the hit area. Use the existing finite feedback and celebration effects
only where they support practice or milestones. Both saved and system reduced
motion suppress the decorative effects and button translation.

Review Home, Learn, lessons, Arcade, Rewards and Grown-ups in Chromium at desktop,
tablet and mobile sizes including 320px. Walk through keyboard, touch and zoom,
inspect the console and network, and verify fresh and existing V1 saves with the
production suite on the built artifact and public Pages URL. See
`docs/design-workflow.md` for the project’s Taste, UI/UX Pro Max and Design Motion
Principles adaptations and licensing notes. Lucide supplies standard control
icons. CSS and SVG cover the print and motion treatment.
