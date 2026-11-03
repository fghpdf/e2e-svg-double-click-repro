# e2e SVG double-click reproduction

Runnable reproduction for [tester-army/e2e#1327](https://github.com/tester-army/e2e/issues/1327).

A diagram node handles `dblclick` on a container. Its visible SVG receives pointer input; its readonly textarea has `pointer-events: none` until editing starts. The semantic tree exposes the textbox. Agent `doubleTap` on that textbox is intercepted, and agent `tapAt` at its coordinates snaps back to the same textbox and is intercepted too.

## Run

Requires Node.js 24.8+ and npm. Dependencies are pinned to the reported versions: `e2e@0.21.2`, `@e2e-dev/web@0.15.2`, and the engine's bundled `playwright-core@1.64.0`.

```sh
git clone https://github.com/fghpdf/e2e-svg-double-click-repro.git
cd e2e-svg-double-click-repro
npm ci
npm run browsers
npm run repro
```

**Expected: two failed tests and exit code 1.** Both failures include an SVG `path` that intercepts pointer events. A failure to install dependencies, start Chromium, or bind port 4287 is not the reported bug.

On Linux, if Chromium system libraries are missing, install them with `npm run browsers -- --with-deps`.

## Why no API key is required

`e2e.config.ts` uses the public `StepExecutor` API to repeat the two reported agent action choices. It reads fresh semantic nodes and calls `ctx.actions.doubleTap` or `ctx.actions.tapAt`. This exercises the framework's actual agent dispatcher, actionability checks, and reporting without a model or replay cache.

This is a deterministic reproduction of the action failure, not a reproduction of Claude's reasoning or a claim about every model. It does not test a new implementation or establish which release introduced the behavior.

## Passing controls

```sh
npm test
```

Expected: three passing tests:

1. `elementFromPoint` returns the SVG path while the textbox is readonly and pointer-inert.
2. The same scripted double-tap/rename succeeds when `?accessible=1` gives the event-handling container `role="group"` and a name. This is the reported accessibility workaround.
3. A direct `browser.locator('#node').doubleTap()` on the original page unlocks editing. This confirms the original page's event handler works without changing its markup.

`npm test` runs only these controls. `npm run repro` deliberately leaves the bug failures uncaught and returns nonzero.

## Manual check

```sh
npm start
```

Open [http://127.0.0.1:4287/repro.html](http://127.0.0.1:4287/repro.html), double-click the node, then type. A real double-click enables label editing. Stop this server before running the automated commands; the test runner starts and stops its own server on the same port.

## Verified result

Locally verified with Node 26.7.0, npm, Chromium, and the exact npm packages in the lockfile. No branch build or company application code is used.

```text
npm run repro
ACTION_FAILED: doubleTap did not become actionable in time:
  elementHandle.dblclick: ... <path ...> ... intercepts pointer events
ACTION_FAILED: tap did not become actionable in time:
  elementHandle.click: ... <path ...> ... intercepts pointer events
Tests  2 failed
```

The runner writes its report to `.e2e/report.json` and per-test evidence under `.e2e/results/`. Those generated files are ignored by Git. Exact error wording can differ between releases.

## Files

- `repro.html`: plain HTML/SVG fixture; no UI framework.
- `server.mjs`: local static server, bound to `127.0.0.1:4287`.
- `e2e.config.ts`: web target and credential-free scripted executor.
- `tests/repro.e2e.ts`: the two failing actions.
- `tests/controls.e2e.ts`: hit testing and successful editing controls.
- `package-lock.json`: reproducible npm dependency installation.
