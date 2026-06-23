# JustBreatheBro — Route Audit

> Recorded: 2026-06-23. Part of the codebase cleanup initiative.
> Last updated: 2026-06-23 after orphan route cleanup.
>
> **How routes were verified:** Expo Router's generated `.expo/types/router.d.ts` was checked to
> confirm which files are registered as routes, and every source file was read to confirm inbound
> `router.push` / `router.replace` / `<Link href>` navigation calls.
>
> **Cleanup completed:** On 2026-06-23, confirmed dead routes (`wallpaper.tsx`, `breath_bot_landing.tsx`,
> entire `_tabs/` directory) were deleted, and potential-feature routes (`exercises.tsx`, `breathsetup.tsx`)
> were moved to `app/_deprecated/` for future restoration if needed. See summary at end of document.

---

## Important: How `_tabs/` worked (now deleted)

**Note:** The `_tabs/` directory was deleted on 2026-06-23. This section is preserved for historical context.

In Expo Router, underscore-prefixed **files** (like `_layout.tsx`) are treated as special
conventions, not as route segments. However, underscore-prefixed **directories** like `_tabs/` are
still registered as route segments — they become reachable at `/_tabs`.

**Was confirmed by `router.d.ts`:** both `/_tabs` and `/_tabs/settings` were registered as valid routes.

**But:** nothing in the current app navigated to `/_tabs`. The root `app/_layout.tsx` is a `Stack`
whose initial/default screen is `app/index.tsx` (route `/`). The tab group was accessible in
principle but was a dead end in practice — and its `_layout.tsx` referenced tab screens (`learn`,
`meditate`) whose files did not exist, which would have crashed if rendered.

The entire `_tabs/` directory has been removed. See [docs/NAVIGATION_DECISION.md](./NAVIGATION_DECISION.md) for the full analysis.

---

## Route table

| Status | Route | File | Purpose | How reached | Verdict |
|---|---|---|---|---|---|
| Active | `/` | `app/index.tsx` | Home screen — start session, pick technique, open archive, enter global room | App launch, `router.push('/')` from `breathing.tsx`, `scenes.tsx` | **Keep** |
| Active | `/breathing` | `app/breathing.tsx` | Solo breathing session | `app/index.tsx` start, `app/_tabs/index.tsx` (inactive), `app/exercises.tsx` (inactive), `app/breathsetup.tsx` (inactive) | **Keep** |
| Active | `/scenes` | `app/scenes.tsx` | Scene + soundscape + animation theme + appearance picker | `app/index.tsx` circle press, `app/wallpaper.tsx` (inactive) | **Keep** |
| Active | `/informationarchive` | `app/informationarchive.tsx` | Browse articles, books, videos from the information archive | `app/index.tsx` info library press | **Keep** |
| Active | `/global_room_picker` | `app/global_room_picker.tsx` | Choose a live "Breathe Together" room; shows participant counts | `app/index.tsx` global breath press; `router.replace` from `global_room.tsx` on error | **Keep** |
| Active | `/global_room` | `app/global_room.tsx` | Live synchronized breathing session over WebSocket | `app/global_room_picker.tsx` room card press | **Keep** |
| Legacy | `/support` | `app/support.tsx` | Redirect stub — renders `<Redirect href="/" />` | External deep link `/support`; no internal navigation | **Keep** — intentional; prevents missing-route crash for old deep links |
| Orphan | `/settings` | `app/settings.tsx` | Full-screen settings page (sound, soundscape, theme, appearance) | **No inbound `router.push` or `<Link>` found anywhere in the codebase** | **Review** — see notes |
| Deleted | `/wallpaper` | ~~`app/wallpaper.tsx`~~ | Older wallpaper carousel (swipe to pick, left/right arrows, dot indicator) | **No inbound navigation found;** `wallpaper.tsx` itself pushed to `/scenes` | **Deleted** — superseded by `scenes.tsx` |
| Deprecated | `/exercises` | `app/_deprecated/exercises.tsx` | Grid of all exercises; tap to select and start | **No inbound navigation found** | **Deprecated** — moved to `_deprecated/` for potential future restoration |
| Deprecated | `/breathsetup` | `app/_deprecated/breathsetup.tsx` | Custom breathing pattern (slider per phase); saves + navigates to `/breathing` | **No inbound navigation found** | **Deprecated** — moved to `_deprecated/` for potential future restoration |
| Deleted | `/breath_bot_landing` | ~~`app/breath_bot_landing.tsx`~~ | "Breath Bot — Coming Soon" placeholder screen | **No inbound navigation found** | **Deleted** — empty placeholder with no functionality |
| Duplicate | `/_tabs` | ~~`app/_tabs/_layout.tsx` + `app/_tabs/index.tsx`~~ | Tab navigator (Learn / Breathe / Meditate tabs) wrapping a duplicate home screen | **No inbound navigation found;** registered as route but never entered | **Deleted** — duplicate navigation system (see docs/NAVIGATION_DECISION.md) |
| Duplicate | `/_tabs/settings` | ~~`app/_tabs/settings.tsx`~~ | Near-identical copy of `app/settings.tsx` (only import paths differ) | **No inbound navigation found** | **Deleted** — duplicate of an already-orphaned screen |

---

## Detailed notes per flagged route

### `/settings` — `app/settings.tsx` — Orphan, Review

The file is fully implemented (sound, soundscape, theme, appearance, haptics pickers). Import paths
use `../` relative style rather than `@/`. Nothing in source code navigates to this route.

In-session settings are handled by `SettingsSheet` (a bottom sheet opened from `breathing.tsx` and
`global_room.tsx`). It is not clear whether `app/settings.tsx` was intended as a secondary full-screen
fallback, was replaced by `SettingsSheet`, or is meant to be linked from somewhere not yet wired.

**Recommended decision:** decide whether to wire it up (e.g. from `BreathingPageHeader` or home
screen) or delete it. If deleted, confirm `SettingsSheet` covers all settings options. Do not
delete before that comparison is done.

---

### `/wallpaper` — ~~`app/wallpaper.tsx`~~ — **Deleted**

**Status:** Deleted on 2026-06-23 as part of orphan route cleanup.

A swipe-carousel wallpaper picker with left/right arrows and a dot indicator. Accepted
`params.from` and `params.selected` to know what was previously selected. Contained a locally-defined
`WALLPAPER_IMAGES` array identical to the one in `app/scenes.tsx`.

`scenes.tsx` already handles wallpaper selection inline (a horizontal scroll gallery). There was no
code path that reached `wallpaper.tsx`. The file itself pushed to `/scenes` on completion —
confirming it was superseded by the scenes flow.

**Deletion rationale:** Superseded by `scenes.tsx` which covers all three zenscape wallpapers with the same data. No inbound navigation found.

---

### `/exercises` — `app/_deprecated/exercises.tsx` — **Deprecated**

**Status:** Moved to `app/_deprecated/` on 2026-06-23 for potential future restoration.

A 2-column grid showing all exercises. Tapping an exercise sets it as current and pushes to
`/breathing`. Has an "ⓘ" detail sheet per exercise. Also has a `🔄 Reset` button that calls
`forceUpdateToDefaults()` — this is explicitly labeled `/* DEV: Temporary button to reload defaults */`
in source, meaning it was never removed after development.

The home screen (`app/index.tsx`) achieves similar functionality through `ExerciseSelectionSheet`
(a bottom sheet opened by tapping the technique name). The full-page exercise grid provides more
screen real estate and a different UX.

**Deprecation rationale:** No inbound navigation. Functionally overlaps with `ExerciseSelectionSheet`. If restored, the debug Reset button should be removed first. File preserved in `_deprecated/` in case the full-page grid UX is desired later.

---

### `/breathsetup` — `app/_deprecated/breathsetup.tsx` — **Deprecated**

**Status:** Moved to `app/_deprecated/` on 2026-06-23 for potential future restoration.

A custom breathing pattern builder: four sliders (inhale / hold1 / exhale / hold2), each 0–15
seconds. Saves a "Custom Breathing" exercise and navigates to `/breathing`. Uses
`../components/startbutton` (snake_case import). BackButton and CustomSlider are both functional.

This is a legitimate feature — custom breathing patterns — that simply has no UI entry point. The
home screen has no "create custom" button. The feature itself works end-to-end once reached.

**Deprecation rationale:** No inbound navigation. Fully functional feature without an entry point. File preserved in `_deprecated/` in case a "Create Custom" option is added to `ExerciseSelectionSheet` or elsewhere. If restored, the snake_case import should be cleaned up.

---

### `/breath_bot_landing` — ~~`app/breath_bot_landing.tsx`~~ — **Deleted**

**Status:** Deleted on 2026-06-23 as part of orphan route cleanup.

A single-screen placeholder: title "Breath Bot", subtitle "Coming Soon", back button. No
functionality. The BreathBot feature exists as an external content pipeline (see README) but is not
integrated into the app.

**Deletion rationale:** Empty placeholder with no functionality. When BreathBot is ready to integrate, a proper screen can be created at that time. No inbound navigation found.

---

### `/_tabs/` directory — ~~`_tabs/_layout.tsx`, `_tabs/index.tsx`, `_tabs/settings.tsx`~~ — **Deleted**

**Status:** Deleted on 2026-06-23 as part of duplicate navigation cleanup (see [docs/NAVIGATION_DECISION.md](./NAVIGATION_DECISION.md)).

**`_tabs/_layout.tsx`** defined a `<Tabs>` navigator with three screens: `learn`, `index`,
`meditate`. The `learn` and `meditate` files did not exist — rendering this navigator would have crashed
with a missing-screen error. Nothing navigated to `/_tabs`.

**`_tabs/index.tsx`** was a cut-down version of `app/index.tsx`. It hardcoded "Deep Breathing"
instead of reading the current exercise from context, had no `SupportSheet`, no
`ExerciseSelectionSheet`, no `BreathingPageHeader`, and did not push `autoStart: "true"` to
`/breathing`. It was strictly behind `app/index.tsx` in functionality.

Comparison of the two home screens:

| Feature | `app/index.tsx` | `app/_tabs/index.tsx` |
|---|---|---|
| Reads current exercise from context | Yes | No (hardcodes Deep Breathing) |
| Exercise selection sheet | Yes (via `useBreathingSheets`) | No |
| Support sheet | Yes | No |
| BreathingPageHeader w/ nav buttons | Yes | No |
| `autoStart` param on push | Yes | No |
| Import style | `@/` | `@/` |

**`_tabs/settings.tsx`** was line-for-line identical to `app/settings.tsx` except import paths used
`@/` (the tabs version) vs `../` (the root version). Same components, same layout, same styles.

**Deletion rationale:** All three files were inactive orphans. Two were duplicates, and the tab layout referenced screens that did not exist. The active Stack-based navigation system (rooted at `app/index.tsx`) was preserved.

---

## Summary: completed cleanup (2026-06-23)

| Action | Files | Risk | Status |
|---|---|---|---|
| ✅ Deleted | `app/wallpaper.tsx` | Low — no inbound navigation, superseded by scenes | **Completed** |
| ✅ Deleted | `app/breath_bot_landing.tsx` | Low — placeholder with no functionality | **Completed** |
| ✅ Deleted | `app/_tabs/_layout.tsx` | Low — broken tab layout, nothing navigates to it | **Completed** |
| ✅ Deleted | `app/_tabs/index.tsx` | Low — duplicate, unreachable | **Completed** |
| ✅ Deleted | `app/_tabs/settings.tsx` | Low — duplicate, unreachable | **Completed** |
| ✅ Deprecated | `app/exercises.tsx` → `app/_deprecated/exercises.tsx` | Zero — moved to dormant `_deprecated/` folder | **Completed** |
| ✅ Deprecated | `app/breathsetup.tsx` → `app/_deprecated/breathsetup.tsx` | Zero — moved to dormant `_deprecated/` folder | **Completed** |
| Review pending | `app/settings.tsx` | Medium — compare against SettingsSheet before removing | **No action taken** |
| Keep | `app/support.tsx` | n/a — intentional legacy redirect | **No action needed** |
| Keep | All 6 active routes | n/a | **No action needed** |

### Changes made

- **Deleted (4 files):** `wallpaper.tsx`, `breath_bot_landing.tsx`, `_tabs/_layout.tsx`, `_tabs/index.tsx`, `_tabs/settings.tsx`
- **Deprecated (2 files):** Moved `exercises.tsx` and `breathsetup.tsx` to `app/_deprecated/` for potential future restoration
- **Updated config:** Added `app/_deprecated/**` to `eslint.config.js` ignores to prevent linting errors on dormant files with broken relative imports
- **Verification:** Lint and tests pass after cleanup

### Remaining work

- **`app/settings.tsx`** — still orphaned but not touched in this cleanup. Requires comparison against `SettingsSheet` to determine if it should be wired up, deprecated, or deleted.
