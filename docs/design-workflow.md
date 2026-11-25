# Permanent project design workflow

Reviewed and integrated on 2026-11-25. These resources are development-time
guidance, not website runtime dependencies. Root `AGENTS.md` directs future Codex
sessions to `DESIGN.md` and the relevant checked-in skills. The scope is this
repository and its descendants; this does not change ChatGPT account preferences
or automatically configure unrelated projects.

## Resource decisions

| Resource | Pinned revision | Integration |
| --- | --- | --- |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `d1a2bb41d927083ac7118f60cfc9cdf711810ea0` | `.agents/skills/hero-design-taste/`: instruction-only MIT adaptation |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `b73ee96f8d4ff7bbc279c52dadcd907ffe23629c` | `.agents/skills/ui-ux-pro-max/`: local data, Python search and references |
| [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) | `4a9ca879f24a361f4dca4174fe2da0f67b5ddee3` | `.agents/skills/design-motion-principles/`: create/audit workflows and references |
| [VoltAgent/awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design) | `8f746b5bbb69cc7544fa850c126a71f754091951` | Catalog, not an installable skill; documentation principles in `DESIGN.md` |
| [bergside/design-md-chrome](https://github.com/bergside/design-md-chrome) | `8e07614fb18752ab1ee14dd65a8ff93e63c9b13b` | Browser extension, not an installable agent skill; inspection/state-documentation principles in `DESIGN.md` |

Vendored text has normalized line endings and trailing whitespace.
`design-resources.lock.json` records origins, commits, decisions and SHA-256 hashes
of installed files. Each installed skill carries the upstream MIT license.

## Installation and review

Inspected fresh pinned clones outside the application before installation. Used
Codex's built-in skill-installer helper, not upstream shell installers, `npx`,
marketplace plugins or extension loading. Installation form:

```sh
python3 <Codex-system-skills>/skill-installer/scripts/install-skill-from-github.py \
  --repo OWNER/REPO --path SKILL_PATH --ref FULL_COMMIT \
  --dest "$PWD/.agents/skills"
```

Source paths: `skills/taste-skill` (installed with `--name hero-design-taste`),
`.claude/skills/ui-ux-pro-max`, and `skills/design-motion-principles` respectively.
The helper's system path varies by Codex installation. No npm package, runtime
dependency, API key, permission grant or global configuration was added.

- **Taste:** reviewed entrypoint, install requirements, license and script side
  effects. Upstream has a Claude Stop hook plus browser-launch, network-fetch and
  filesystem-writing tools. Its roughly 39 MB skill also includes art/demo assets
  and rigid company-site defaults. None of those scripts, hooks or assets remain
  in this project adaptation. Replaced the entrypoint with a compact, attributed
  workflow covering composition, hierarchy, consistency and real browser review.
  Preserved Hero Academy violet, angled panels, original artwork, quiet lessons
  and existing test tooling instead of upstream photo quotas or mandatory scenes.
- **UI/UX Pro Max:** inspected entrypoint, Python imports/call sites, local CSV
  access and persistence/preview code. Searches use Python's standard library and
  local data; no network client, subprocess or dynamic execution was found in the
  top-level Python tools. `--persist`, `--preview`, `--force` and explicit output
  paths can write files; normal targeted searches do not require these options.
  Replaced Claude environment paths in the entrypoint with project paths and
  `python3`, added project precedence, and retained source tools/data unchanged.
  Search output is advice; links/library examples must not trigger installations,
  remote fonts or uploads. Do not include private learner data in queries.
- **Motion:** reviewed instruction/reference structure and bundled HTML report
  templates. Removed Google Fonts links from both report templates so generated
  audits can remain offline. It needs no install script or runtime. Added a project note defining
  calm learning, saved/OS reduced motion, existing effects and local-only reports.
  Designer perspectives are the author's interpretations, not endorsements.
- **Catalog:** reviewed README, repository structure and MIT license. There is no
  skill entrypoint to install. Adopted the token + rule + rationale documentation
  pattern, not another company's visual identity or linked images/fonts.
- **Chrome extractor:** inspected manifest, service worker, extraction flow and
  markdown generation. Manifest requests `activeTab`, `scripting`, `storage` and
  `downloads`; extraction injects a content script into the active page and saves
  generated markdown. No extension is installed and no permission is granted.
  Its computed-style inventory and explicit component-state documentation are
  useful methods we can apply with existing browser tooling. Extracted styles
  still require human design and accessibility judgment and asset license review.

This is a scoped source/permission/license review, not an exhaustive security
audit of upstream projects or an approval for future upstream code changes.

## Discovery and use

[Official Codex documentation](https://learn.chatgpt.com/docs/build-skills)
supports repository `.agents/skills` discovery from the working directory up to
the Git root, and automatic detection of skill changes. Root `AGENTS.md` makes
consultation explicit even when implicit skill matching would be uncertain.

Verified using the installed Codex app-server `skills/list` method with this
repository's absolute cwd and `forceReload: true`: all three skills returned
`scope: repo`, `enabled: true`, with no project parse errors. No model turn or
external service action was needed for this discovery check. It verifies loading,
not a guarantee that every future model response follows all design rules.

Skills will be available on the next turn in this project. A restart is normally
unnecessary; if they do not appear, start a fresh project session or restart
Codex. In CLI/IDE, use `/skills` or `$hero-design-taste`, `$ui-ux-pro-max`, and
`$design-motion-principles`. Launch Codex inside this repository, not a sibling
folder, to receive the project guidance.

Offline search smoke test (passed):

```sh
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py \
  'keyboard focus contrast touch targets' --domain ux --max-results 2
```

Frontend/UI/UX work consults the taste adaptation and `DESIGN.md`; accessibility
and React reviews add focused UI/UX lookups; motion work reads the motion skill
and its accessibility reference. Major redesigns still need actual screenshot
and interaction reviews. `DESIGN.md` remains the established source of artistic
direction; search suggestions do not authorize regenerating it.

## Maintenance

Updates are deliberate, not automatic. Clone the requested new revision outside
the repo, compare code, permissions, license and instruction changes, then use the
supported installer into a temporary destination. Reapply the documented local
adaptations, verify discovery and the offline search, regenerate lock hashes and
commit the reviewed changes together. Never overwrite this project's design with
an upstream default. Keep caches, generated reports and learner data out of skills.
