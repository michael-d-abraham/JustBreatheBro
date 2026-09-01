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
| Automated logic | Jest (**76 tests**, 6 suites) | Cycle, audio, haptics, storage, global room mock WS |
| UI smoke | Maestro on iOS sim | Tier A nav — `npm run e2e:ios` (see `docs/MAESTRO.md`) |
| Truth for native feel | Physical iPhone | Haptics, lock-screen audio, silent switch |

**Sim is enough for:** nav, sheets layout, breathing ring visuals, global room UI (with network).  
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
| Apple Health connect + Save Mindful Minutes | Yes (`apple_health_connected`, `apple_health_sync_enabled`) |
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

Full audit: `docs/ROUTE_AUDIT.md`.

---

## Stale doc warnings

Do **not** trust without verifying:

- `docs/ARCHITECTURE.md` — pre-cleanup file tree, some orphan flags outdated
- `docs/BASELINE_STATUS.md` — snapshot from 2026-06-23 (21 tests, tsc failures); current counts in `AGENTS.md` §6

---

## Session history

See `docs/SESSION_LOG.md` for dated entries.
