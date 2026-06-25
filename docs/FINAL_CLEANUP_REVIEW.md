# JustBreatheBro — Final Cleanup Review

> Recorded: 2026-06-23. Read-only review performed after the cleanup initiative and the
> live-room test additions. No code was changed to produce this document.
>
> Baseline for comparison: [docs/BASELINE_STATUS.md](BASELINE_STATUS.md) (recorded at cleanup start).
> Where the older [docs/ARCHITECTURE.md](ARCHITECTURE.md) disagrees with this file or
> [AGENTS.md](../AGENTS.md), this file is the most current.

---

## Verification snapshot (commands run for this review)

- `npm run lint` -> exit 0 (only npm/Expo tooling noise).
- `npm test` -> 76 tests across 6 suites, all passing.
- `npx tsc --noEmit` -> exit 2, **3 errors remaining** (all `TS2367` in `hooks/useBreathingCycle.ts`).
- Stray-file checks: `dummy.ipynb` gone, `scripts/` gone, `hooks/useSwipeNavigation.ts` gone.

Test suites now present (was 2 at baseline):

- `lib/__tests__/storage.test.ts`
- `hooks/__tests__/useBreathingCycle.test.ts`
- `hooks/__tests__/useBreathingAudio.test.ts`
- `hooks/__tests__/useBreathingHaptics.test.ts`
- `hooks/__tests__/useGlobalBreathingRoom.test.ts` (URL/config)
- `hooks/__tests__/useGlobalBreathingRoom.behavior.test.ts` (join/leave/reconnect/cleanup)

---

## 1. What improved

Confirmed against the baseline and current source:

- **Dead code removed.** `hooks/useSwipeNavigation.ts` (unused, referenced non-existent `/calm`
  and `/energize` routes, had a `Gesture`-as-type bug) is deleted. `tsc` errors dropped 5 -> 3.
- **Broken script removed.** The `reset-project` entry that pointed at a non-existent
  `scripts/reset-project.js` is gone from [package.json](../package.json); `scripts/` no longer
  exists. No broken npm script remains.
- **Stray file removed.** `dummy.ipynb` is no longer in the repo root.
- **Naming normalized to PascalCase.** Components are uniformly PascalCase
  (`StartButton.tsx`, `ThemeButtons.tsx`, `AppearanceButton.tsx`, etc.). The old snake_case
  files (`startbutton.tsx`, `theme_buttons.tsx`, `appearance_button.tsx`) are gone.
- **`_deprecated/` imports are clean.** Both `app/_deprecated/breathsetup.tsx` and
  `app/_deprecated/exercises.tsx` now use `@/` alias imports (e.g. `import StartButton from
  "@/components/StartButton"`). The risky snake_case relative import called out in
  [AGENTS.md](../AGENTS.md) §9.7 (`../components/startbutton`) no longer exists.
- **Picker duplication collapsed via a `variant` prop.** `SoundPicker`, `SoundscapePicker`,
  `ThemePicker`, and `AppearancePicker` each take `variant?: 'page' | 'bottomSheet'` and swap the
  button component (`CircularOptionButton` vs `BottomSheetCircularButton`) internally — see
  [components/AppearancePicker.tsx](../components/AppearancePicker.tsx). The separate
  `BottomSheetSoundPicker` / `BottomSheetSoundscapePicker` / `BottomSheetThemePicker` components
  the architecture doc describes no longer exist.
- **Single source of truth for wallpaper/scene data.** `WALLPAPER_IMAGES` / `ZENSCAPE_IMAGE_MAP`
  are defined only in [constants/wallpapers.ts](../constants/wallpapers.ts); all consumers
  (`contexts/appSettingsContext.tsx`, `components/WallpaperCarousel.tsx`) import them. No inline
  redefinition (commit `415cdcd "consolidate wallpaper and zensacpe data"`).
- **Feature-color constants are DRY and well-scoped.** [constants/featureColors.ts](../constants/featureColors.ts)
  derives `SOUNDSCAPE_COLORS` from `SOUNDSCAPE_PALETTES` and documents that these are preview-only
  swatches, not UI tokens — no overlap/duplication with `themeTokens.ts` palettes.
- **Orphan routes removed.** `app/wallpaper.tsx` and the `_tabs/` group described in the older docs
  are gone (commits `5c8b79d "remove orphan routes"`, `f3035fa "wallpaper screen extraction"`).
  Remaining routes resolve to real inbound navigation, except the two noted below.
- **Oversized screens shrank.** `app/breathing.tsx` is now 496 lines (AGENTS.md still says ~654)
  and `app/global_room.tsx` is 495 lines (AGENTS.md still says ~600), thanks to extraction into
  `BreathingPage*` / `GlobalRoom*` presentational components.
- **Test coverage greatly expanded.** From 21 tests / 2 suites to 76 tests / 6 suites. The baseline
  "Priority 5" coverage gaps for `useBreathingAudio`, `useBreathingHaptics`, and `lib/storage.ts`
  are now covered, and the live-room state machine (`join`, `leave`, `reconnect`, `cleanup`,
  phase-dedupe, cue-audio suppression) is covered via a mock-WebSocket suite, with the hook left
  unmodified.

---

## 2. What still needs work

### Type safety

- **3 pre-existing `TS2367` errors persist** in [hooks/useBreathingCycle.ts](../hooks/useBreathingCycle.ts)
  (lines 104, 115, 126) — unreachable `else if` literal comparisons in the phase chain. Runtime is
  unaffected, but `tsc --noEmit` is not green. Jest currently masks these via
  `diagnostics: { ignoreCodes: [2367] }` in [jest.config.js](../jest.config.js); the type-check gate
  still fails. This is baseline "Priority 2" and is still open.
- **`any`-typed token fields.** [components/ThemeProvider.tsx](../components/ThemeProvider.tsx) types
  several `PlatformColor` tokens (`separator`, `systemBg`, `bottomSheetBg`, etc.) as `any`. Works,
  but it is a typing hole worth tightening (e.g. an `OpaqueColorValue` type).
- **`router.push(path as any)`** casts in [components/StartButton.tsx](../components/StartButton.tsx)
  and [components/RoundButton.tsx](../components/RoundButton.tsx) bypass Expo Router's typed routes.

### Orphan routes (still present, intentional-but-unresolved)

- **`app/settings.tsx`** — a full-screen settings page (Sound, Soundscape, Theme, Appearance,
  Sound & Haptics) with **no inbound `router.push('/settings')` anywhere**. It overlaps heavily with
  the in-session `SettingsSheet` but is not a strict subset (it also exposes Appearance and a
  combined Sound & Haptics section). Decision still pending: wire it up, fold its unique sections
  into `SettingsSheet`, or delete it. See [docs/ROUTE_AUDIT.md](ROUTE_AUDIT.md) row "Orphan".
- **`app/support.tsx`** — intentional legacy `<Redirect href="/" />` stub for old deep links. Keep;
  documented as intentional.

### Duplicate / near-duplicate logic that survived the picker consolidation

- **`SoundHapticsPicker` vs `BottomSheetSoundHapticsPicker`.** These two were NOT unified with the
  `variant` pattern used by the other pickers. Both read `useAppSettings()` and render Sound +
  Haptics toggles; they differ only in the toggle component (`ToggleButton` vs
  `BottomSheetToggleButton`) and layout wrapper. See
  [components/SoundHapticsPicker.tsx](../components/SoundHapticsPicker.tsx) and
  [components/BottomSheetSoundHapticsPicker.tsx](../components/BottomSheetSoundHapticsPicker.tsx).
  This is the last remaining picker duplicate.

### Confusing names

- **`AppearanceButton` is a misnomer.** [components/AppearanceButton.tsx](../components/AppearanceButton.tsx)
  is a generic styled pressable used by `ToggleButton` (sound/haptics) — it is not appearance-specific.
  The actual appearance picker uses `CircularOptionButton` / `BottomSheetCircularButton`, not
  `AppearanceButton`. The name suggests a coupling that does not exist.
- **`Theme.tsx` vs `ThemeProvider.tsx` is inverted relative to the docs.** The real
  `ThemeProvider`, `ThemeContext`, `useTheme`, and `useWallpaperForeground` implementation lives in
  [components/ThemeProvider.tsx](../components/ThemeProvider.tsx) (107 lines), while
  [components/Theme.tsx](../components/Theme.tsx) is the barrel that re-exports them. AGENTS.md §3
  describes the opposite ("`ThemeProvider.tsx` Re-exports ThemeProvider (thin shim)").
- **`appSettingsContext.tsx` (formerly `themeContext.tsx`)** still trips people up: it exports
  `AppProvider` / `useAppSettings` (settings + wallpaper), NOT visual tokens. Visual tokens are
  `useTheme` from the `Theme`/`ThemeProvider` pair. Documented in AGENTS.md §9.4, but the dual
  "theme" meaning remains a cognitive trap.

### Oversized files (still large; high cognitive load)

- `hooks/useGlobalBreathingRoom.ts` — 552 lines (socket + backoff + clock sync + dedupe + presence
  + catalog all in one file). The state machine is now partly tested, but the file is still the
  largest in the repo.
- `app/breathing.tsx` — 496 lines (session orchestrator; all §4a lifecycle invariants live here).
- `app/global_room.tsx` — 495 lines (drives animation/audio/haptics off server timing).

### Outdated docs

- **[docs/ARCHITECTURE.md](ARCHITECTURE.md) is stale.** It still lists `app/wallpaper.tsx` and the
  `_tabs/` group (both removed), the `BottomSheetSoundPicker` family (consolidated away), and a
  pre-cleanup file tree. AGENTS.md already warns about this, but the doc itself has not been updated.
- **[AGENTS.md](../AGENTS.md) line drift.** It cites `breathing.tsx` ~654 and `global_room.tsx`
  ~600 (now 496 / 495), still lists `useSwipeNavigation.ts` and `app/_deprecated/breathsetup.tsx`'s
  snake_case import as live risks (both resolved), and inverts the `Theme.tsx` / `ThemeProvider.tsx`
  roles. The known-issues counts ("21 tests in 2 suites", "3 known pre-existing errors") are partly
  stale (76 tests / 6 suites; 3 TS errors is still accurate).
- **[README.md](../README.md)** says "21 tests across 2 suites" (line 111) — now 76 / 6.
- **[docs/BASELINE_STATUS.md](BASELINE_STATUS.md)** is a point-in-time baseline; several of its
  "Recommended next fixes" (Priorities 1, 3, 4, and most of 5) are now done. It is fine as a
  historical record but should not be read as the current TODO list.

### Areas where complexity increased

- **Two test files now target one hook.** `useGlobalBreathingRoom.test.ts` (config) and
  `useGlobalBreathingRoom.behavior.test.ts` (state machine) — intentional separation, but a reader
  must know both exist. Low risk; noted for discoverability.
- **The `variant` prop pattern** added a branch (`page` vs `bottomSheet`) inside each picker. This
  is a net win over duplicated files, but it does mean each picker now carries two visual contexts;
  the untouched `SoundHapticsPicker` pair is the inconsistency that makes this harder to reason about.

---

## 3. Risky changes that should be manually tested

These areas are either large, lightly tested, or governed by tight invariants. Any future change
here should run the full [docs/REGRESSION_CHECKLIST.md](REGRESSION_CHECKLIST.md).

- **Live room (`hooks/useGlobalBreathingRoom.ts` + `app/global_room.tsx`).** The new automated tests
  cover the socket lifecycle with a mock, but they do not exercise real network timing, clock drift
  against the authoritative server, or the 200ms tick/`remainingMs` rendering. Manually verify:
  join a room, confirm the ring follows server phases, background the app and return (reconnect +
  `skipBreathCueAudio` on the first step), and leave cleanly (no lingering timers/audio).
- **Solo session lifecycle (`app/breathing.tsx` + `useBreathingCycle`).** The 3 masked `TS2367`
  errors live here; if anyone "fixes" the `else if` chain, manually re-run the start/pause/resume/
  stop/loop-back smoke test — the comparisons are unreachable but the surrounding control flow is not.
- **Single soundscape player.** `useBackgroundSoundscape` is untested and must remain a single
  instance mounted only by `BackgroundSoundscapePlayer` in `_layout.tsx`. Manually verify soundscape
  survives navigation and does not double-play.
- **Any settings refactor** (e.g. resolving the `settings.tsx` orphan or merging the
  `SoundHapticsPicker` pair) touches shared `useAppSettings` state read by multiple screens; verify
  toggles persist and reflect across `scenes.tsx`, `SettingsSheet`, and a session.

---

## 4. Recommended next 5 cleanup tasks

1. **Fix the 3 `TS2367` errors in `hooks/useBreathingCycle.ts`** (baseline Priority 2). Restructure
   the unreachable `else if` chain without changing runtime behavior; then remove the
   `ignoreCodes: [2367]` escape hatch in [jest.config.js](../jest.config.js) so the type-check gate
   is genuinely green. Verify all 76 tests still pass and `tsc --noEmit` exits 0.
2. **Resolve `app/settings.tsx`.** Compare its sections against `SettingsSheet`; either add an entry
   point, fold its unique Appearance / Sound & Haptics sections into the sheet, or delete the route.
   Update [docs/ROUTE_AUDIT.md](ROUTE_AUDIT.md) with the decision.
3. **Unify `SoundHapticsPicker` + `BottomSheetSoundHapticsPicker`** behind the same
   `variant?: 'page' | 'bottomSheet'` pattern the other pickers use (swap `ToggleButton` vs
   `BottomSheetToggleButton`). Removes the last picker duplicate.
4. **Rename `AppearanceButton` to a generic name** (e.g. `OptionToggleButton` or `PillButton`) to
   match its actual role, and update the AGENTS.md / ARCHITECTURE.md description of the
   `Theme.tsx` vs `ThemeProvider.tsx` split (the barrel is `Theme.tsx`; the implementation is
   `ThemeProvider.tsx`). Do the rename and behavior change in separate commits per AGENTS.md §10.
5. **Refresh the docs to current reality.** Update [docs/ARCHITECTURE.md](ARCHITECTURE.md) (drop
   `wallpaper.tsx`, `_tabs/`, and the `BottomSheet*Picker` family; fix the file tree), update the
   line-count / test-count / dead-code references in [AGENTS.md](../AGENTS.md), and fix the
   "21 tests / 2 suites" line in [README.md](../README.md).

---

## 5. Is the codebase ready for new feature work?

**Yes, with one caveat.** Lint passes, the test suite is green and meaningfully broader than at
baseline (76 tests / 6 suites, including the live-room state machine), dead code and broken scripts
are gone, the picker/wallpaper duplication is largely consolidated, and the largest screens have
been trimmed. The core invariants (single soundscape player, idempotent session lifecycle,
server-authoritative live-room clock) are intact and now partly guarded by tests.

The caveat: `tsc --noEmit` is not green (3 masked `TS2367` errors), so the type-check gate is
softer than it looks. This does not block feature work, but new code should not lean on the
`ignoreCodes` exception, and task #1 above should be done before any change inside
`useBreathingCycle.ts`. The remaining items (settings orphan, last picker duplicate, naming, stale
docs) are low-risk hygiene that can proceed in parallel with feature development.
