# JustBreatheBro — Route Audit

> Recorded: 2026-06-23. Part of the codebase cleanup initiative.
> No code was changed to produce this document.
>
> **How routes were verified:** Expo Router's generated `.expo/types/router.d.ts` was checked to
> confirm which files are registered as routes, and every source file was read to confirm inbound
> `router.push` / `router.replace` / `<Link href>` navigation calls.

---

## Important: How `_tabs/` works here

In Expo Router, underscore-prefixed **files** (like `_layout.tsx`) are treated as special
conventions, not as route segments. However, underscore-prefixed **directories** like `_tabs/` are
still registered as route segments — they become reachable at `/_tabs`.

**Confirmed by `router.d.ts`:** both `/_tabs` and `/_tabs/settings` are registered as valid routes.

**But:** nothing in the current app navigates to `/_tabs`. The root `app/_layout.tsx` is a `Stack`
whose initial/default screen is `app/index.tsx` (route `/`). The tab group is accessible in
principle but is a dead end in practice — and its `_layout.tsx` references tab screens (`learn`,
`meditate`) whose files do not exist, which would crash if rendered.

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
| Orphan | `/wallpaper` | `app/wallpaper.tsx` | Older wallpaper carousel (swipe to pick, left/right arrows, dot indicator) | **No inbound navigation found;** `wallpaper.tsx` itself pushes to `/scenes` | **Delete** — superseded by `scenes.tsx` |
| Orphan | `/exercises` | `app/exercises.tsx` | Grid of all exercises; tap to select and start | **No inbound navigation found** | **Review** — see notes |
| Orphan | `/breathsetup` | `app/breathsetup.tsx` | Custom breathing pattern (slider per phase); saves + navigates to `/breathing` | **No inbound navigation found** | **Review** — see notes |
| Orphan | `/breath_bot_landing` | `app/breath_bot_landing.tsx` | "Breath Bot — Coming Soon" placeholder screen | **No inbound navigation found** | **Delete or park** — see notes |
| Duplicate | `/_tabs` | `app/_tabs/_layout.tsx` + `app/_tabs/index.tsx` | Tab navigator (Learn / Breathe / Meditate tabs) wrapping a duplicate home screen | **No inbound navigation found;** registered as route but never entered | **Delete entire `_tabs/` dir** — see notes |
| Duplicate | `/_tabs/settings` | `app/_tabs/settings.tsx` | Near-identical copy of `app/settings.tsx` (only import paths differ) | **No inbound navigation found** | **Delete** — duplicate of an already-orphaned screen |

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

### `/wallpaper` — `app/wallpaper.tsx` — Orphan, Delete

A swipe-carousel wallpaper picker with left/right arrows and a dot indicator. Accepts
`params.from` and `params.selected` to know what was previously selected. Shares a locally-defined
`WALLPAPER_IMAGES` array identical to the one in `app/scenes.tsx`.

`scenes.tsx` already handles wallpaper selection inline (a horizontal scroll gallery). There is no
code path that reaches `wallpaper.tsx`. The file itself `router.push('/scenes')` on completion —
confirming it was superseded by the scenes flow.

**Recommended decision:** Delete. Before deleting, verify `scenes.tsx` covers all three zenscape
wallpapers (it does — same `WALLPAPER_IMAGES` data). Post-deletion, the duplicate `WALLPAPER_IMAGES`
constant can be extracted to a shared location.

---

### `/exercises` — `app/exercises.tsx` — Orphan, Review

A 2-column grid showing all exercises. Tapping an exercise sets it as current and pushes to
`/breathing`. Has an "ⓘ" detail sheet per exercise. Also has a `🔄 Reset` button that calls
`forceUpdateToDefaults()` — this is explicitly labeled `/* DEV: Temporary button to reload defaults */`
in source, meaning it was never removed after development.

The home screen (`app/index.tsx`) achieves similar functionality through `ExerciseSelectionSheet`
(a bottom sheet opened by tapping the technique name). The full-page exercise grid provides more
screen real estate and a different UX — it may be worth wiring up, or the bottom sheet may be
sufficient.

**Recommended decision:** Review. If keeping, remove the debug Reset button before wiring it in.
If the bottom sheet is sufficient, delete this screen.

---

### `/breathsetup` — `app/breathsetup.tsx` — Orphan, Review

A custom breathing pattern builder: four sliders (inhale / hold1 / exhale / hold2), each 0–15
seconds. Saves a "Custom Breathing" exercise and navigates to `/breathing`. Uses
`../components/startbutton` (snake_case import). BackButton and CustomSlider are both functional.

This is a legitimate feature — custom breathing patterns — that simply has no UI entry point. The
home screen has no "create custom" button. The feature itself works end-to-end once reached.

**Recommended decision:** Wire up an entry point (e.g. from `ExerciseSelectionSheet` as a "Custom"
option) and remove the snake_case import (minor), or delete if custom patterns are out of scope for
now.

---

### `/breath_bot_landing` — `app/breath_bot_landing.tsx` — Orphan, Delete or Park

A single-screen placeholder: title "Breath Bot", subtitle "Coming Soon", back button. No
functionality. The BreathBot feature exists as an external content pipeline (see README) but is not
integrated into the app.

**Recommended decision:** Delete. When BreathBot is ready to integrate, create a proper screen at
that time. A placeholder adds noise without value.

---

### `/_tabs/` directory — `_tabs/_layout.tsx`, `_tabs/index.tsx`, `_tabs/settings.tsx` — Duplicate, Delete

**`_tabs/_layout.tsx`** defines a `<Tabs>` navigator with three screens: `learn`, `index`,
`meditate`. The `learn` and `meditate` files do not exist — rendering this navigator would crash
with a missing-screen error. Nothing navigates to `/_tabs`.

**`_tabs/index.tsx`** is a cut-down version of `app/index.tsx`. It hardcodes "Deep Breathing"
instead of reading the current exercise from context, has no `SupportSheet`, no
`ExerciseSelectionSheet`, no `BreathingPageHeader`, and does not push `autoStart: "true"` to
`/breathing`. It is strictly behind `app/index.tsx` in functionality.

Comparison of the two home screens:

| Feature | `app/index.tsx` | `app/_tabs/index.tsx` |
|---|---|---|
| Reads current exercise from context | Yes | No (hardcodes Deep Breathing) |
| Exercise selection sheet | Yes (via `useBreathingSheets`) | No |
| Support sheet | Yes | No |
| BreathingPageHeader w/ nav buttons | Yes | No |
| `autoStart` param on push | Yes | No |
| Import style | `@/` | `@/` |

**`_tabs/settings.tsx`** is line-for-line identical to `app/settings.tsx` except import paths use
`@/` (the tabs version) vs `../` (the root version). Same components, same layout, same styles.

**Recommended decision:** Delete the entire `_tabs/` directory. All three files are inactive,
two are duplicates, and the tab layout references screens that do not exist. Verify with a
running build that the app still launches (removing registered but unvisited routes is safe).

---

## Summary: what to do next

| Action | Files | Risk |
|---|---|---|
| Delete | `app/wallpaper.tsx` | Low — no inbound navigation, superseded by scenes |
| Delete | `app/breath_bot_landing.tsx` | Low — placeholder with no functionality |
| Delete | `app/_tabs/_layout.tsx` | Low — broken tab layout, nothing navigates to it |
| Delete | `app/_tabs/index.tsx` | Low — duplicate, unreachable |
| Delete | `app/_tabs/settings.tsx` | Low — duplicate, unreachable |
| Review then decide | `app/settings.tsx` | Medium — compare against SettingsSheet before removing |
| Review then decide | `app/exercises.tsx` | Medium — remove debug Reset button; decide vs ExerciseSelectionSheet |
| Review then decide | `app/breathsetup.tsx` | Medium — good feature, needs an entry point or a deletion decision |
| Keep | `app/support.tsx` | n/a — intentional legacy redirect |
| Keep | All 6 active routes | n/a |

**Recommended first deletion batch** (no behavior change, no user-visible impact):
`wallpaper.tsx`, `breath_bot_landing.tsx`, and the entire `_tabs/` directory.

**Run after each deletion:**
```bash
npm run lint
npm test
# Manual: app launches, home screen opens, session starts
```
