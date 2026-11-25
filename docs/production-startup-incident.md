# V4.1 production startup incident — 2026-11-25

## Confirmed cause

The public URL returned HTTP 200 with the repository's **source** `index.html`,
containing `<script type="module" src="/src/main.tsx">`. Chrome requested
`https://broof34.github.io/src/main.tsx`, received 404, and never executed React
or loaded the application's CSS. This left an empty root on a white page.

Reproduced in the user's regular Chrome profile, with DevTools showing that exact
failed request. A separate HTTP fetch returned the same source document. The Pages
API returned `build_type: legacy`, source branch `codex/hero-academy-v4`, path `/`.

The competing automatic [pages-build-deployment run 45711661608](https://github.com/broof34/hero-academy/actions/runs/45711661608)
checked out commit `c64e4cb`, built the source root with Jekyll and deployed it at
22:16 UTC. The application workflow correctly uploaded `dist`, but the separate
branch publisher replaced that artifact. A successful Jekyll deployment did not
mean Vite had built or the app could start.

The Vite base was already correctly `/hero-academy/`. Routing uses application
state rather than a history router, so this was not a deep-link routing problem.
No service worker registration/cache implementation exists in application source.
The failure occurred before save hydration could run. Fresh and saved sessions
therefore failed alike when receiving the source document. Existing storage
recovery already leaves malformed/future saves untouched; it is retained.

## Why earlier tests missed it

Earlier live browser checks exercised a correctly compiled deployment and real
interactions. They did not verify the publishing source or wait for and check the
competing branch deployment after the final documentation push. That later run
replaced the tested site. CI validated source/build output but had no production
preview browser gate or mandatory public browser check after deployment.

The earlier completion report consequently overstated release reliability.
Testing one working deployment was insufficient while another publisher could
replace it. This was a deployment configuration and verification gap, not proof
that an HTTP 200 meant the page worked.

## Restoration and prevention

Changed Pages to `build_type: workflow` using GitHub's supported Pages API and
redeployed the existing validated commit first, restoring the app before making
application changes. A normal reload in the affected Chrome initially reused
the cached bad document; a hard reload revalidated it and visibly rendered Home.
GitHub's document response had `cache-control: max-age=600`. No progress was cleared.

The hotfix adds:

- A Pages publishing-mode check on every project workflow run.
- A build-artifact guard rejecting source entrypoints, wrong bundle base paths,
  missing assets and absent build provenance.
- A commit marker in built HTML, checked after public deployment.
- Production browser tests on the actual compiled preview before upload and on
  the public URL after deployment. Success requires visible content, working
  navigation, a correct math answer and persistence, with fresh and legacy saves.
  Network/page errors fail the healthy-path checks.
- Static startup UI and an independent small local script, plus a React error
  boundary. Module-load failures, startup timeouts and React render failures
  expose reload and raw-save download controls. No reset, migration or new
  storage key is introduced. Error handling sends no telemetry.
- Missing-module, render-failure, malformed-save and blocked-storage browser
  coverage, and unit tests of the production artifact guard.
- Permanent release instructions in root `AGENTS.md` and `README.md`.

The missing-module and render-failure tests were first run against the old build;
both failed because no recovery heading or controls appeared. Both pass with the
hotfix, including raw-save export and unchanged earned balances. The artifact
guard rejects this repository's raw source HTML and accepts compiled `dist`.

No dependencies, learning logic, artwork, reward economy, save schema or game
sources were changed. The production suite intentionally injects failures in its
own isolated browser contexts; it does not modify user profiles.

## Release verification procedure

Run all unit/browser tests, typecheck, lint and production build. Run artifact
validation and the production suite locally. Commit/push and dispatch `pages.yml`;
wait for **build, deploy and verify-public** to succeed. Then rerun existing browser
tests against the public URL and inspect desktop/tablet/mobile screenshots.

```sh
HERO_TEST_URL=https://broof34.github.io/hero-academy/ \
HERO_EXPECTED_SHA=<deployed-commit> npm run test:production
HERO_TEST_URL=https://broof34.github.io/hero-academy/ npm run test:e2e
```

Confirm Pages remains in workflow mode after the final push. Browser/CDN caches
can temporarily retain an old document; the site cannot retroactively install
recovery code into already cached source HTML. A hard reload revalidates that
document without deleting localStorage. Future failures in the new entrypoint
have visible recovery instead of an empty page.
