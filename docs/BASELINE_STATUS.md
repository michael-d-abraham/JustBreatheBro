# JustBreatheBro — Baseline Status

> Recorded: 2026-06-23. Run as part of the codebase cleanup initiative (see
> [docs/ARCHITECTURE.md](ARCHITECTURE.md)). No code was changed to produce these results — this is
> the exact state of the repo at cleanup start.

---

## Commands run

| Command | Exit code | Result |
|---|---|---|
| `npm run lint` | 0 | PASSED (no errors) |
| `npm test` | 0 | PASSED — 21/21 tests, 2 suites |
| `npx tsc --noEmit` | 2 | FAILED — 5 type errors |
| `node ./scripts/reset-project.js` | 1 | FAILED — file does not exist |

---

## 1. Lint (`npm run lint` → `expo lint`)

**Status: PASSED**

No lint errors reported. The only output was non-blocking tooling noise:

- `npm warn Unknown env config "devdir".` — npm config noise, not a project issue.
- `npm notice` about a new npm version available (11.6.2 → 11.17.0).
- A Node.js `UNDICI-EHPA EnvHttpProxyAgent is experimental` warning from Expo CLI internals.

None of these block the lint pass.

---

## 2. Tests (`npm test` → `jest`)

**Status: PASSED**

```
PASS hooks/__tests__/useBreathingCycle.test.ts
PASS hooks/__tests__/useGlobalBreathingRoom.test.ts

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Time:        3.881 s
```

All 21 tests pass. Both covered files are the most critical in the repo (session state machine +
live room WebSocket hook). Coverage gaps exist in all other areas — see Recommended next fixes.

---

## 3. TypeScript (`npx tsc --noEmit`)

**Status: FAILED — 5 errors across 2 files**

### File: `hooks/useBreathingCycle.ts` — 3 errors

All three are the same class of mistake: a value is narrowed to a literal string type in a prior
branch, then compared again to an incompatible literal in the next `if` (the condition can never be
true because TypeScript knows it is already a different type). This is a dead-code bug — the
comparisons are unreachable as written.

```
hooks/useBreathingCycle.ts(104,9):
  error TS2367: This comparison appears to be unintentional because the types
  '"inhale"' and '"hold1"' have no overlap.

hooks/useBreathingCycle.ts(115,9):
  error TS2367: This comparison appears to be unintentional because the types
  '"hold1"' and '"exhale"' have no overlap.

hooks/useBreathingCycle.ts(126,9):
  error TS2367: This comparison appears to be unintentional because the types
  '"exhale"' and '"hold2"' have no overlap.
```

Root cause: the `if/else if` chain narrows the variable before each subsequent comparison, making
the literal checks unreachable. The runtime behavior is unaffected but TypeScript cannot verify the
intent.

### File: `hooks/useSwipeNavigation.ts` — 2 errors

```
hooks/useSwipeNavigation.ts(10,17):
  error TS2345: Argument of type '"/calm"' is not assignable to parameter of type
  'RelativePathString | ExternalPathString | "/breath_bot_landing" | ...'

hooks/useSwipeNavigation.ts(18,17):
  error TS2345: Argument of type '"/energize"' is not assignable to parameter of type
  'RelativePathString | ...'

hooks/useSwipeNavigation.ts(25,21):
  error TS2749: 'Gesture' refers to a value, but is being used as a type here.
  Did you mean 'typeof Gesture'?
```

Root cause: `useSwipeNavigation` references routes `/calm` and `/energize` that do not exist in
`app/`, so Expo Router's typed routes rejects them. The third error (`Gesture` used as type) is a
separate bug in the hook itself. Combined with the fact that **no file in the codebase imports
`useSwipeNavigation`**, this hook is entirely dead code.

---

## 4. Package scripts audit

| Script | Command | Status |
|---|---|---|
| `start` | `expo start` | OK |
| `android` | `expo run:android` | OK |
| `ios` | `expo run:ios` | OK |
| `ios:build` | `expo run:ios` | OK (duplicate of `ios`, intentional or oversight) |
| `web` | `expo start --web` | OK |
| `lint` | `expo lint` | OK |
| `test` | `jest` | OK |
| `reset-project` | `node ./scripts/reset-project.js` | **BROKEN** — `scripts/` directory does not exist |

### Broken script detail

Running `reset-project` produces:

```
Error: Cannot find module './scripts/reset-project.js'
  code: 'MODULE_NOT_FOUND'
```

The `scripts/` directory does not exist in the repo root. This script is a leftover from an Expo
project template and was never implemented or removed.

---

## 5. Stray files

| File | Issue |
|---|---|
| `dummy.ipynb` | Jupyter notebook present in repo root; unrelated to the app; should be removed |

---

## 6. Recommended next fixes (in priority order)

These are documentation only — nothing was changed to produce this baseline.

### Priority 1 — Remove `useSwipeNavigation` (zero risk, zero effort)

The hook is unused, has 2 TypeScript errors (invalid routes, wrong type annotation), and references
routes that do not exist. Deleting it reduces the TS error count by 2 and removes dead code with no
risk of any regression.

- Delete `hooks/useSwipeNavigation.ts`.
- Verify: `npx tsc --noEmit` drops from 5 → 3 errors; `npm run lint` stays clean;
  `npm test` stays green.

### Priority 2 — Fix `useBreathingCycle.ts` type errors (low risk)

Three `TS2367` errors point to unreachable conditions in an `if/else if` chain. The fix is a
small structural change (use `else` instead of `else if` with the same literal, or restructure the
chain). This is the most important covered file in the repo — understand the change before
applying it.

- Read lines 95–135 of `hooks/useBreathingCycle.ts` to see the chain.
- Fix the narrowing issue; do not change runtime behavior.
- Verify: all 21 tests still pass; `tsc --noEmit` exits 0.

### Priority 3 — Remove or restore `reset-project` script (zero risk)

Either delete the script entry from `package.json` or create a simple `scripts/reset-project.js`
that does what is needed (e.g. clears AsyncStorage dev data). Do not leave a broken script in place.

- Edit `package.json` — remove the `"reset-project"` line.
- Verify: `npm run reset-project` no longer resolves; no other scripts affected.

### Priority 4 — Delete `dummy.ipynb` (zero risk)

Jupyter notebook in the repo root, unrelated to the app.

- Delete the file from repo root.
- Verify: `git status` shows it removed; no build steps reference it.

### Priority 5 — Expand test coverage (medium effort, high value)

Current coverage: session state machine + live room hook. All of the following are untested:

- `useBreathingAudio` — play/stop on phase change; no double-play.
- `useBreathingHaptics` — no pulse after cancel; idempotent cancel.
- `useBackgroundSoundscape` — switches soundscape; respects `soundEnabled`.
- `lib/storage.ts` — round-trip read/write for each key.
- `useBreathingSheets` — open/close state transitions.

These should be added as follow-on work after the deletion/rename cleanup is done, so tests do not
need to be updated alongside renames.

---

## Summary table

| Check | Result | Action needed |
|---|---|---|
| `npm run lint` | PASS | None |
| `npm test` (21 tests) | PASS | Expand coverage (Priority 5) |
| `npx tsc --noEmit` | FAIL (5 errors) | Fix cycle chain + delete dead hook (Priorities 1, 2) |
| `reset-project` script | BROKEN | Remove or restore (Priority 3) |
| `dummy.ipynb` | Stray file | Delete (Priority 4) |
| `ios` vs `ios:build` duplicate | Minor | Decide which to keep |
