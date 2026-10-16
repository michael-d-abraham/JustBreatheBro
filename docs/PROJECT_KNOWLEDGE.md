# Project Knowledge Base

> Living facts learned from dev sessions. Updated on **"Mr cursor end session"**.  
> **Source of truth hierarchy:** `.cursorrules` (guardrails) → `AGENTS.md` (map + protocol) → this file (session learnings) → historical docs (`ARCHITECTURE.md`, `BASELINE_STATUS.md` may be stale).

---

## Git

| Item | Value |
|------|--------|
| Home base branch | `make_it_urs` ("make it urs") |
| PR / diff base | `make_it_urs`, not `main` |
| Legacy branches | `main`, `old-main-backup` — do not use as default base |

---

## Dev workflow

| Trigger | Action |
|---------|--------|
| `Mr cursor start up a session` | `npm run check` → test watch + Metro → briefing |
| `Mr cursor end session` | `npm run check` → update this file + scan docs → summarize |

**npm scripts:**

| Script | Command |
|--------|---------|
| `npm run check` | lint + all Jest tests |
| `npm run test:watch` | Jest watch during coding |
| `npm run session:ios` | `expo start --dev-client` (Metro daily loop) |
| `npm run ios` | Native rebuild when dev client missing |

**Prereq gap:** `expo-dev-client` is not in `package.json` yet — `session:ios` may warn until `npx expo install expo-dev-client && npm run ios`.

---

## Testing pyramid

| Layer | Tool | Covers |
|-------|------|--------|
| Automated logic | Jest (**224 tests**, 15 suites) | Cycle, audio, haptics, storage, Global Room presence/pulses (mock WS) |
| UI smoke | Maestro on iOS sim | Tier A nav — `npm run e2e:ios` (see `docs/MAESTRO.md`) |
| Truth for native feel | Physical iPhone | Haptics, lock-screen audio, silent switch |

**Sim is enough for:** nav, sheets layout, breathing ring visuals, Global Room map UI (needs a backend serving `/global`).  
**Sim is not enough for:** haptics, background audio pause/resume, silent switch.

See `docs/DEV_SESSION.md` for Tier A/B/C manual checklists.

---

## Audio / background (verified behavior)

From commit `bb488eb` (`useBackgroundSoundscape.ts`, `useBreathingAudio.ts`):

- **Soundscape:** pauses on `AppState` `background` / `inactive`; resumes on `active`
- **Breathing cues:** no new inhale/exhale when app not `active`
- **Exit session:** cues force-stop; ambient soundscape **continues on home** (by design)
- **OS config:** `playsInSilentMode: true`, `shouldPlayInBackground: true` in `_layout.tsx` — app code still pauses soundscape on background

Regression checklist §3b reflects this (updated 2026-06-10).

---

## Settings persistence (important)

| Setting | Persisted to AsyncStorage? |
|---------|---------------------------|
| Wallpaper (zenscape filename) | Yes |
| Animation theme | Yes |
| Current exercise | Yes |
| Sound on/off, haptics, sound type, soundscape | **No** — in-memory in `appSettingsContext` until app restart |
| Theme palette, appearance mode | **No** — in-memory in `Theme.tsx` |

---

## Maestro E2E

**Status:** Implemented (local iOS sim). Flows in `.maestro/flows/`; docs in `docs/MAESTRO.md`.

- **Scripts:** `npm run e2e:ios`, `npm run e2e:ios:breathing`
- **appId:** `com.michaelabraham.breathbro`
- **Prereq:** Maestro CLI on PATH (not an npm dep); sim app via `npm run ios` / `expo-dev-client`
- **Gotcha:** Breathing chrome auto-hides — flows tap `breathing.screen-tap` before pause/back
- **Out of scope v1:** sheets, audio/haptics asserts, live rooms, CI

---

## Routes (current)

Active entry: `app/index.tsx` → `/`. Settings via `SettingsSheet` + `app/scenes.tsx` — **`app/settings.tsx` deleted**. **`app/_tabs/` deleted.** Dormant code in `app/_deprecated/`.

Full audit: `docs/ROUTE_AUDIT.md`. **`app/global_room_picker.tsx` deleted** — Join opens `/global_room` directly.

---

## Global Room (presence + pulses)

Details/invariants: `AGENTS.md` §4c. Durable facts:

- **Backend is a separate repo** (`michael-d-abraham/breatheAppWebSocketBackEnd`). **Render auto-deploys on every merge to its `main` branch — merging is deploying.** (The `repository` field in its `package.json` still names an old `se4200/…` class repo; it is stale metadata and does not affect deploys.) The Global Room work lives on branch `global-presence` until merged. The `/global` path is additive: the legacy breathing-room protocol and `GET /api/rooms` are unchanged because the live App Store build (3.0.0) still uses them. **The app needs the backend deployed** to show anyone; until then the Global Room sits on "Connecting…/Reconnecting…".
- **Local dev:** run the backend with `DEV_COUNTRY=US` (no Cloudflare header locally) and start the app with `EXPO_PUBLIC_BREATH_ROOM_WS_URL=ws://localhost:8085` (`ws://10.0.2.2:8085` on Android emulator).
- **Location:** server-side only, from `CF-IPCountry` → coarse country anchor + jitter. No `expo-location`, no permission prompt, no native change — keeps this OTA-safe. **After each deploy, verify the header is actually present on WebSocket upgrades** (unknown/missing → random open-ocean dot).
- **OTA/native:** nothing here adds a native module, so the change can ship via EAS Update to builds that have `react-native-svg`, reanimated and `expo-haptics` (all already shipped).
- **Design system:** the Global Room has no colors of its own. `globalRoomPalette(mode, accent)` in `components/globalRoomTokens.ts` derives every color from `tokens.mode` (light/dark) and `tokens.accent` — land/other dots/text = `mode.iconPrimary`, your dot = `accent.highlight`, glows = `accentHighlightWash` / `mode.glass.activeWash`. The pulse control is `HomeNavPressable` (same frosted circle as Home's Join), the back button is `HomeNavIconButton`, and status/label type reuses the `HOME_TAGLINE_*` tokens shared with `HomeOneBreathHero`. Sizes/opacities live in `globalRoomTokens.ts`; layout math (`lib/globalRoomLayout.ts`) and animation math (`lib/globalRoomMotion.ts`) are pure and unit-tested. `lib/__tests__/globalRoomPalette.test.ts` fails if a color stops coming from tokens.
- **Background:** Global Room deliberately hides the wallpaper (opaque `tokens.sceneBackground` on the screen) and draws the map directly on it — no glass panel/container (one was tried and removed).
- **Map evaluation:** `kdn0325/react-native-simple-worldmap` (MIT, `react-native-svg` only) was evaluated and **not adopted**: one 864 KB source file, 256 per-country paths each with its own `PanResponder` (touch/zoom we don't want, and a cost on every render), hardcoded colors, and an undocumented projection that is not equirectangular/Mercator/Miller (can't place real lat/lon). Our generated single-path outline is ~1/10 the size with a known projection.
- **Local multi-country testing:** the backend reads `CF-IPCountry` on any connection, so a `ws` client with `headers: {"cf-ipcountry": "BR"}` against a local server gives dots on other continents (production from one machine stacks everyone in one country). Point the app at it with `EXPO_PUBLIC_BREATH_ROOM_WS_URL=ws://localhost:8085` and **restart Metro** (the env var is inlined at bundle time).
- **Simulator driving:** `xcrun simctl openurl booted breath://global_room` pops an iOS "Open in …?" confirmation that can't be tapped without Accessibility permission or Maestro/idb (neither is installed). To screenshot the room, temporarily re-export it from `app/index.tsx`, then restore. Background processes started from an agent shell die when that call ends — start servers and capture in one call.
- **Map:** `constants/worldMap.ts` is **generated** — `npm run generate:world-map` (`scripts/generateDottedWorldMap.mjs`, dev dep `dotted-map` / `getMapJSON`). Land is a precomputed diagonal dot grid (Mercator); presence uses the same projection via `lib/worldMapProjection.ts`. Don't hand-edit the dot array.
- **Testing gotchas:** hook tests advance fake time in small `act` steps (one big jump lets several timers fire before React can arm the next expiry timer); unmount every harness in `afterEach` so a failing test can't leak an `AppState` listener into later tests; shared `MockWebSocket` lives in `jest/` (not `__tests__/`).
- **Haptics feel and the two-device pulse exchange need a physical device** — the simulator can't verify them.
- **Pre-existing type errors:** `tsc --noEmit` reports 7 errors in `SupportSheet.tsx` / `SettingsOptionCard.tsx` on `make_it_urs`; not related to this work.

---

## Stale doc warnings

Do **not** trust without verifying:

- `docs/ARCHITECTURE.md` — pre-cleanup file tree, some orphan flags outdated
- `docs/BASELINE_STATUS.md` — snapshot from 2026-06-23 (21 tests, tsc failures); current counts in `AGENTS.md` §6

---

## Session history

See `docs/SESSION_LOG.md` for dated entries.
