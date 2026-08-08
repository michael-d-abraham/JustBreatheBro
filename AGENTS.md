# AGENTS.md — AI Agent Guide for JustBreatheBro

> **Read this file first.** It is the fastest path to understanding this repo well enough to make
> safe changes. For deeper detail, follow the links in [§11 — Docs to read first](#11-docs-to-read-first).
>
> **Accuracy note:** `docs/ARCHITECTURE.md` was written before the 2026-06-23 cleanup and still
> contains stale entries (old orphan routes, renamed context, deleted files). Where the two docs
> disagree, this file is more current. `docs/FINAL_CLEANUP_REVIEW.md` records the full delta.

---

## 1. Project overview

JustBreatheBro is a mindfulness and breathing mobile app (iOS live, Android pending). Core features:

- **Guided breathing sessions** — multiple patterns (Deep Breathing, Box, 4-7-8, …) driven by a
  phase state machine, layered with animation, audio cues, and haptics.
- **Ambient soundscapes** — looping background audio that plays app-wide across all screens.
- **Scenes / wallpapers** — zenscape background images the user picks from the Scenes screen.
- **Information archive** — curated articles, books, and videos seeded by the external BreathBot
  content pipeline.
- **Live "Breathe Together" rooms** — real-time synchronized group sessions over WebSocket, with
  the server as the authoritative clock.

The app is distributed via Expo / EAS (OTA updates enabled). It targets iOS with
`playsInSilentMode: true` (audio plays through hardware mute). Sentry is active in production.

---

## 1b. Git — home-base branch

| | |
|---|---|
| **Home base (spoken)** | "make it urs" |
| **Home base (git)** | `make_it_urs` |
| **Role** | Canonical integration branch — treat like `main` / `master` |

- Branch **from** `make_it_urs` for feature work; merge **back into** `make_it_urs`.
- PRs, diffs, and "compare to base" default to `make_it_urs`, not `origin/main`.
- `main` and `old-main-backup` are legacy — do not use as the default base unless explicitly asked.
- Remote: `origin/make_it_urs`.

See `.cursor/rules/home-base-branch.mdc` for full agent rules.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native `0.81` + Expo `~54` |
| Routing | `expo-router ~6` (file-based, Stack navigator) |
| Animation | `react-native-reanimated ~4` + `react-native-svg` |
| Audio | `expo-audio` (`useAudioPlayer`) |
| Haptics | `expo-haptics` |
| Storage | `@react-native-async-storage/async-storage` |
| Gestures | `react-native-gesture-handler` |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Monitoring | `@sentry/react-native` |
| Build / OTA | EAS Build + `expo-updates` |
| Tests | Jest + `ts-jest` |
| Lint | `expo lint` (ESLint) |
| TypeScript | enabled; `npx tsc --noEmit` exits **0** (all pre-existing errors resolved) |

**Active compiler flags:** New Architecture (`newArchEnabled: true`) and React Compiler
(`experiments.reactCompiler: true`) are both enabled in `app.json`. Be conservative with manual
`useMemo`/`useCallback` — the compiler may already handle them.

---

## 3. Folder structure

```
Breath/
  app/                     Expo Router routes (file-based)
    _layout.tsx            Root layout — Sentry init, audio mode, providers, Stack
    index.tsx              Home screen (only entry point at launch)
    breathing.tsx          Solo breathing session screen (~496 lines)
    scenes.tsx             Scenes: wallpaper + soundscape + theme + appearance
    informationarchive.tsx Information archive browser
    global_room_picker.tsx Live room selection (fetches participant counts)
    global_room.tsx        Live "Breathe Together" session (~495 lines)
    support.tsx            Legacy deep-link stub → <Redirect href="/" />
    _deprecated/           Dormant routes — DO NOT edit, DO NOT lint
      exercises.tsx        Exercise grid (no entry point; preserved for possible restoration)
      breathsetup.tsx      Custom pattern builder (no entry point; preserved)

  components/              Presentational + sheet components (all PascalCase)
    Theme.tsx              Barrel re-export: ThemeProvider, useTheme, useWallpaperForeground + token types
    ThemeProvider.tsx      ThemeProvider + useTheme implementation — visual tokens
    BaseBottomSheet.tsx    Shared bottom-sheet contract — always use this base
    BottomSheet*.tsx       Sheet building blocks (rows, toggles, section titles, dividers…)
    BackgroundSoundscapePlayer.tsx  Mounts useBackgroundSoundscape (renders null)
    BreathingPage*.tsx     Presentational pieces extracted from breathing.tsx
    GlobalRoom*.tsx        Presentational pieces extracted from global_room.tsx
    WallpaperCarousel.tsx  Horizontal scroll of wallpaper tiles
    WallpaperPreview.tsx   Single wallpaper tile (image + label + selection state)
    SettingsSheet.tsx      In-session settings bottom sheet
    ExerciseDetailSheet.tsx / ExerciseSelectionSheet.tsx
    SoundPicker / SoundscapePicker / ThemePicker / AppearancePicker / SoundHapticsPicker  Unified pickers (variant prop: 'page' | 'bottomSheet')
    animationTheme.ts / bottomSheetTheme.ts / themeTokens.ts  Token helpers

  contexts/
    appSettingsContext.tsx  App-wide settings + wallpaper state (AppProvider, useAppSettings)
    breathingContext.tsx    Currently selected exercise (BreathingProvider, useBreathing)

  hooks/
    useBreathingCycle.ts       Phase state machine — THE clock for solo sessions
    useBreathingAnimation.ts   Reanimated ring shared values
    useBreathingAudio.ts       Inhale/exhale cue playback
    useBreathingHaptics.ts     Phase-quantized haptic pulses
    useBreathingSheets.ts      Sheet open/close coordination + exercise list loader
    useBackgroundSoundscape.ts App-wide looping ambient audio
    useGlobalBreathingRoom.ts  Live room WebSocket state machine (~552 lines)
    __tests__/                 Jest tests (useBreathingCycle, useBreathingAudio, useBreathingHaptics,
                               useGlobalBreathingRoom URL/config, useGlobalBreathingRoom behavior)

  lib/
    storage.ts                AsyncStorage wrappers + defaultExercises seed data
    informationArchive.ts     Archive CRUD over AsyncStorage
    informationArchive.json   Seed content
    breathRoomBackend.ts      WebSocket / HTTP endpoint config (env-var overridable)
    breathingHapticsResolve.ts  Pure math helper: haptic pulse-plan calculation

  constants/
    wallpapers.ts             WALLPAPER_IMAGES, ZENSCAPE_IMAGE_MAP, WallpaperImage type
                              (single source of truth — do not redefine inline elsewhere)
    featureColors.ts          Theme preview color tables

  utils/
    sentryTracking.ts         Breathing session analytics events

  assets/                    Sounds, soundscapes, zenscapes, icons
  docs/                      Architecture, route audit, regression checklist, hook reviews
  .cursorrules               Agent guardrails (read before coding)
  AGENTS.md                  This file
```

---

## 4. Critical systems — do not touch casually

These areas have tight invariants. Read the code and existing tests before touching any of them.
If you change them, run the full regression checklist (`docs/REGRESSION_CHECKLIST.md`).

### 4a. Breathing session lifecycle (`app/breathing.tsx` + four hooks)

The session is driven by four layered hooks. `useBreathingCycle` is the clock; the screen
forwards each `onPhaseChange` callback to animation, audio, and haptics.

**Invariants (non-negotiable — from `.cursorrules`):**
- No duplicate timers/intervals across re-renders.
- `start` / `pause` / `resume` / `stop` must be **idempotent** — safe to call multiple times.
- On stop OR unmount OR navigation-away: stop timers, stop audio, stop haptics, settle animation.
- Phase transitions must not double-trigger cues on re-render.

`useBreathingCycle` uses a 1 s `setTimeout` for countdown and an async `sleep()` keyed on a
generation ref for phase advancement. If you touch it, explain how you prevent drift, duplicate
scheduling, and stuck states. Tests live in `hooks/__tests__/useBreathingCycle.test.ts`.

### 4b. Background soundscape (single-instance rule)

`useBackgroundSoundscape` is mounted **exactly once** via `BackgroundSoundscapePlayer` in
`app/_layout.tsx`. It must survive navigation without re-mounting. Do **not** add competing
soundscape players in any other screen or component.

### 4c. Live room WebSocket (`hooks/useGlobalBreathingRoom.ts`)

The server is the authoritative clock — the client must not introduce its own phase timer. The
hook owns: connect/reconnect with exponential backoff, phase-step deduplication (by
`roomId:phaseSeq`), `skipBreathCueAudio` suppression on first step after connect/switch, and a
stale-socket guard. Tests cover URL/config (`.test.ts`) and join/leave/reconnect/cleanup
behavior via a mock-WebSocket suite (`.behavior.test.ts`). Real network timing is not mocked — manual
smoke test is still required after any timing change.

### 4d. Bottom sheet system

All sheets use `BaseBottomSheet` as the contract. Do not instantiate new modal systems in screens.
Sheet state/coordination goes through `useBreathingSheets`. Read
`.cursor/rules/bottom-sheet-tokens.mdc` before touching sheet styling.

### 4e. Persistence

`lib/storage.ts` is the only place AsyncStorage keys are defined. Keys: `breathing_exercises`,
`current_exercise`, `background_image`, `animation_theme`. Do not add new keys without also
adding get/set wrappers here. Do not change existing key strings (would break existing installs).

---

## 5. Cleanup rules

1. **Match existing patterns.** Before writing new code, find the closest existing example and
   follow its structure, naming, and import style.
2. **Minimal diffs only.** Do not refactor unrelated code in the same commit. No drive-by cleanup.
3. **New files only when clearly reusable.** Prefer editing existing files. When a new file is
   needed, place it alongside similar files and follow the naming convention in §7.
4. **`app/_deprecated/` is frozen.** Do not edit files there. Do not lint them. Do not move
   things into `_deprecated/` without a documented reason.
5. **Do not delete routes without confirming they have no inbound navigation.** Check
   `docs/ROUTE_AUDIT.md` first; use `rg` to search for `router.push`, `router.replace`, and
   `<Link href` before concluding a route is orphaned.
6. **Do not create competing global players.** Only one soundscape player (`_layout.tsx`).
7. **Do not redefine `WALLPAPER_IMAGES` inline.** Import from `constants/wallpapers.ts`.
8. **Stale docs are noted — do not blindly follow `docs/ARCHITECTURE.md`** for the file tree or
   context names. That doc predates the 2026-06-23 cleanup. Use the folder listing in §3 above.

---

## 6. Testing / regression checklist

### Automated checks (run before every commit)

```bash
npm run check     # lint + 76 tests — must pass
npx tsc --noEmit  # must exit 0
git status        # verify no unintended staged files
```

### Manual smoke test (30 seconds, required before committing session/audio/navigation changes)

- App launches without crash; home screen renders with correct wallpaper and exercise.
- Tap Start → breathing ring animates; phase label matches ring direction.
- Pause → ring freezes in place; countdown stops; no audio/haptics after pause.
- Resume → ring continues from frozen position; no doubled haptics.
- Exit session → returns to home cleanly; soundscape continues; no stale animation.

### Full regression checklist

See `docs/REGRESSION_CHECKLIST.md` for the complete 6-section checklist covering:
session start/pause/resume/exit, settings, audio (soundscape + cues), scenes/wallpaper,
global room join/leave, and information archive.

Run the full checklist before any commit that touches session logic, audio, haptics, animation,
navigation, or settings.

### Test files

| File | Covers |
|---|---|
| `hooks/__tests__/useBreathingCycle.test.ts` | Phase state machine, timing, pause/resume |
| `hooks/__tests__/useBreathingAudio.test.ts` | Audio cue playback |
| `hooks/__tests__/useBreathingHaptics.test.ts` | Haptic pulse scheduling |
| `hooks/__tests__/useGlobalBreathingRoom.test.ts` | URL/config resolution |
| `hooks/__tests__/useGlobalBreathingRoom.behavior.test.ts` | Join/leave/reconnect/cleanup (mock WebSocket) |
| `lib/__tests__/storage.test.ts` | AsyncStorage round-trips |

Coverage gaps (tracked for future work): `useBackgroundSoundscape`, `useBreathingSheets`.

---

## 7. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `WallpaperPreview.tsx` |
| Hook files | camelCase with `use` prefix `.ts` | `useBreathingCycle.ts` |
| Context files | camelCase `.tsx` | `appSettingsContext.tsx`, `breathingContext.tsx` |
| Lib / util files | camelCase `.ts` | `storage.ts`, `breathRoomBackend.ts` |
| Constant files | camelCase `.ts` | `wallpapers.ts`, `featureColors.ts` |
| Token helper files | camelCase `.ts` | `themeTokens.ts`, `animationTheme.ts` |
| Exported constants | SCREAMING_SNAKE_CASE | `WALLPAPER_IMAGES`, `DEFAULT_ZENSCAPE_BACKGROUND_FILENAME` |
| Exported types | PascalCase | `WallpaperImage`, `BreathingPhase`, `SoundscapeType` |
| Component props type | `Props` (local to file) | `type Props = { ... }` |
| Context hook | `use` + noun | `useAppSettings`, `useBreathing`, `useTheme` |
| Provider component | `PascalCase + Provider` | `AppProvider`, `BreathingProvider`, `ThemeProvider` |

**Do not use snake_case for new files.** The old `startbutton.tsx`, `theme_buttons.tsx`,
`appearance_button.tsx` convention was cleaned up — all components are now PascalCase.

---

## 8. Import conventions

All non-relative imports use the `@/` path alias (configured in `tsconfig.json`).

```typescript
// Correct — use @/ alias
import { useAppSettings } from "@/contexts/appSettingsContext";
import { WALLPAPER_IMAGES } from "@/constants/wallpapers";
import BaseBottomSheet from "@/components/BaseBottomSheet";

// Wrong — do not use relative paths from app/ or components/
import { useAppSettings } from "../contexts/appSettingsContext";
```

**Note:** `app/_deprecated/` files now use `@/` alias imports (updated during cleanup). Do not
edit those files, but their imports no longer need special treatment when reading them.

**Import ordering** (follow existing files):
1. Third-party packages (`react`, `expo-*`, `@expo/*`, `@gorhom/*`, etc.)
2. Internal `@/components/`, `@/contexts/`, `@/hooks/`, `@/lib/`, `@/constants/`, `@/utils/`
3. React Native core (`View`, `Text`, `StyleSheet`, etc.) — typically grouped with React

Lint (`expo lint`) enforces no unused imports; the linter is the source of truth.

---

## 9. Known risky areas

1. **`app/breathing.tsx` (~496 lines)** — the orchestrator for solo sessions. High cognitive load;
   high merge risk. Any change must preserve all lifecycle invariants in §4a.

2. **`hooks/useGlobalBreathingRoom.ts` (~552 lines)** — socket management, backoff, clock sync,
   phase dedupe, presence, and catalog helpers all in one file. Join/leave/reconnect/cleanup are
   covered by the mock-WebSocket test suite; real-network timing is not. The in-place `switchRoom`
   path is currently dead (room changes happen via remount).
   See `docs/GLOBAL_ROOM_HOOK_REVIEW.md` for the full analysis.

3. **`app/global_room.tsx` (~495 lines)** — consumes the above hook; drives animation, audio, and
   haptics from server-broadcast timing. Changing timing logic here can cause drift against the
   server clock.

4. **`contexts/appSettingsContext.tsx`** — note the naming confusion: this file was previously
   `themeContext.tsx`. It exports `AppProvider` and `useAppSettings` (app settings + wallpaper),
   not visual tokens. Visual tokens are in `components/Theme.tsx` (`useTheme`). Do not confuse them.

5. **`app/settings.tsx` — deleted.** Settings live in `SettingsSheet` (in-session) and `app/scenes.tsx`
   (full-screen). See `docs/ROUTE_AUDIT.md`.

6. **`app/_deprecated/breathsetup.tsx`** — a fully working custom breathing pattern builder with
   no entry point. If you add a "Create Custom" button to `ExerciseSelectionSheet`, wire to this.
   The `@/` alias imports are already correct.

7. **`StyleSheet.create` inside components** — several components call `StyleSheet.create` inside
   the render function (because they depend on theme tokens that change). This is intentional in
   those files. If you move styles outside render, pass tokens explicitly.

8. **`expo-audio` (`useAudioPlayer`)** — two player instances per session (inhale + exhale). The
   `off` sound type still loads a placeholder source to keep hook call order stable. Do not
   conditionalize the number of `useAudioPlayer` calls.

9. **React Compiler is active** — do not add redundant `useMemo`/`useCallback` wrappers without
   a clear reason; the compiler may already optimize them and double-wrapping can cause issues.

---

## 10. How to approach refactors

Follow this protocol for any refactor beyond a trivial edit:

**Before writing code:**
1. Read the file(s) you plan to change top-to-bottom.
2. Find the closest existing pattern in the codebase to follow.
3. Write a short plan (3–6 bullets): what changes, what does not change, how you verify.
4. List exact files you will modify. If the list is longer than ~5 files, split into smaller PRs.

**While coding:**
- Make minimal diffs. Do not "clean up" unrelated code in the same commit.
- Preserve all existing prop names and component APIs unless the refactor requires changing them.
- When extracting a component, move code exactly as-is first, then clean up in a separate commit.
- If you touch `useBreathingCycle`, document how you prevent drift and duplicate scheduling.

**After coding:**
1. Run `npm run lint` — fix all errors.
2. Run `npm test` — all 76 tests must pass.
3. Run the manual smoke test (§6).
4. If you touched session logic, audio, haptics, animation, navigation, or settings — run the
   full checklist in `docs/REGRESSION_CHECKLIST.md`.

**Never do in a single commit:**
- Rename + behavior change
- Extract component + change its logic
- Delete a route + add a new route

---

## 11. Docs to read first

Read these in order before starting a task that touches the listed area:

| Doc | Read when… |
|---|---|
| **This file (`AGENTS.md`)** | Always — read first |
| **`.cursorrules`** | Always — agent guardrails and invariants |
| **`docs/ARCHITECTURE.md`** | Touching any core system; note: some paths/names are pre-cleanup |
| **`docs/PROJECT_KNOWLEDGE.md`** | Living facts from sessions — read for quirks, persistence, audio behavior, Maestro status |
| **`docs/DEV_SESSION.md`** | Starting/ending a dev session; manual test tiers A/B/C; terminal commands |
| **`docs/MAESTRO.md`** | Maestro E2E install, sim prereqs, `npm run e2e:ios` smoke flows |
| **`docs/SESSION_LOG.md`** | Dated session entries (updated on "Mr cursor end session") |
| **`docs/REGRESSION_CHECKLIST.md`** | Before any commit on session, audio, haptics, animation, navigation, settings |
| **`docs/ROUTE_AUDIT.md`** | Before adding, moving, or deleting any route |
| **`docs/GLOBAL_ROOM_HOOK_REVIEW.md`** | Before touching `useGlobalBreathingRoom` or `global_room.tsx` |
| **`docs/BASELINE_STATUS.md`** | Understanding known pre-existing issues (TypeScript errors, broken script) |
| **`docs/NAVIGATION_DECISION.md`** | Historical context on why `_tabs/` was deleted |
| **`.cursor/rules/bottom-sheet-tokens.mdc`** | Before touching any bottom sheet component or styling |

### Key source files to read before touching their area

| Area | File to read first |
|---|---|
| Solo session | `app/breathing.tsx` + `hooks/useBreathingCycle.ts` |
| Animation | `hooks/useBreathingAnimation.ts` |
| Audio cues | `hooks/useBreathingAudio.ts` |
| Haptics | `hooks/useBreathingHaptics.ts` + `lib/breathingHapticsResolve.ts` |
| Soundscape | `hooks/useBackgroundSoundscape.ts` + `components/BackgroundSoundscapePlayer.tsx` |
| Live room | `hooks/useGlobalBreathingRoom.ts` + `app/global_room.tsx` |
| App settings | `contexts/appSettingsContext.tsx` |
| Visual tokens | `components/Theme.tsx` |
| Storage | `lib/storage.ts` |
| Bottom sheets | `components/BaseBottomSheet.tsx` + `hooks/useBreathingSheets.ts` |
| Wallpapers | `constants/wallpapers.ts` + `components/WallpaperCarousel.tsx` |
| Routing | `app/_layout.tsx` + `docs/ROUTE_AUDIT.md` |
