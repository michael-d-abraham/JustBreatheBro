# Maestro E2E — JustBreatheBro

Local iOS Simulator smoke tests for Tier A navigation (home → breathing pause/resume/exit, home → Scenes → close). Not run in CI yet.

**appId:** `com.michaelabraham.breathbro`

Maestro is a **CLI on your Mac**, not an npm dependency. Do not add `maestro` to `package.json`.

---

## Prerequisites

### 1. Install Maestro CLI

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Confirm: `maestro --version`

### 2. Dev client + sim app

`expo-dev-client` is in dependencies. If the simulator does not have a build of this app:

```bash
npm run ios   # expo run:ios — builds and installs com.michaelabraham.breathbro
```

Daily JS loop (after the native app exists):

```bash
npm run session:ios   # expo start --dev-client
```

Press **`i`** in Metro if the simulator does not open.

---

## Run flows

```bash
npm run e2e:ios              # all flows under .maestro/flows/
npm run e2e:ios:breathing    # breathing smoke only (faster while iterating)
```

Flows:

| File | Covers |
|------|--------|
| `.maestro/flows/smoke-breathing.yaml` | Start → Inhale → reveal UI → pause → resume → exit → home |
| `.maestro/flows/smoke-scenes.yaml` | Home → Scenes → close → home |

Aim for **3 consecutive passes** before trusting a change.

---

## testIDs (Tier A)

| testID | Where |
|--------|--------|
| `home.start-button` | Home Start |
| `home.scenes-button` | Home tulip → Scenes |
| `breathing.screen-tap` | Full-screen tap to show/hide chrome |
| `breathing.back-button` | Exit ← (calls `onStopAndExit`) |
| `breathing.pause-button` | Play/pause (same ID for both icons) |
| `breathing.stop-button` | Stop (also exits) |
| `scenes.close-button` | Scenes X |

Out of scope for v1: settings sheet, technique picker, live rooms, audio/haptics asserts.

---

## Troubleshooting

### UI auto-hide

On the breathing screen, header and controls hide after ~3s and use `pointerEvents: 'none'` when hidden. Flows **must** tap `breathing.screen-tap` before pause, stop, or back.

### Flaky waits

- After Start, wait for `"Inhale"` (Deep Breathing default; ~100ms `autoStart` + render). Use `extendedWaitUntil` (~5s).
- After exit, wait briefly for `"Relax"` (`router.push('/')` is delayed ~50ms after teardown).
- Do not assert wallpaper or technique names — AsyncStorage may differ between runs.

### App not found / wrong app

```bash
xcrun simctl list devices booted
npm run ios   # reinstall native binary
```

Confirm bundle id matches flows: `com.michaelabraham.breathbro`.

### `session:ios` vs `ios`

Do **not** run `expo run:ios` and `expo start --dev-client` at the same time unless Metro died and only needs a restart. Prefer one Metro + already-installed dev client.

### Maestro not installed

`npm run e2e:ios` will fail if `maestro` is not on `PATH`. Install the CLI (section above); it is not shipped via npm.

### No CI yet

These flows are local-only. GitHub Actions would need a macOS runner + sim + prebuilt app.

---

## Related docs

- Tier A manual checklist: `docs/DEV_SESSION.md`
- Session invariants: `.cursorrules` / `AGENTS.md`
