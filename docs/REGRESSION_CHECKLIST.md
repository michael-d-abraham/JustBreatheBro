# JustBreatheBro — Manual Regression Checklist

> Run this checklist before any commit that touches session logic, audio, haptics, animation,
> navigation, or settings. The "Run before commit" section at the bottom applies to every commit.

---

## 1. Breathing session

### 1a. Start

- [ ] From the home screen, tap the start button.
- [ ] The breathing screen opens and the ring animation begins expanding immediately.
- [ ] The phase label (inhale / hold / exhale) matches the ring direction.
- [ ] The countdown timer decrements each second.
- [ ] Inhale and exhale audio cues play at the correct phase transitions (if sound is on).
- [ ] Haptic pulses fire throughout each phase (if haptics is on).
- [ ] No duplicate audio triggers on the first inhale.

### 1b. Pause

- [ ] Tap the pause button mid-session.
- [ ] The ring animation freezes at its current position (no snap to start/end).
- [ ] The countdown timer stops.
- [ ] Audio stops immediately; no trailing cue sounds.
- [ ] Haptic pulses stop; no residual pulses after pause.
- [ ] The play button becomes visible.

### 1c. Resume

- [ ] Tap play after pausing.
- [ ] The ring continues from its frozen position — it does not restart from idle.
- [ ] The countdown timer resumes from the remaining time.
- [ ] Audio cues resume in sync with the current phase.
- [ ] Haptic pulses resume; they are not doubled on resume.
- [ ] Phase does not skip or jump on resume.

### 1d. Exit

- [ ] Tap the back/exit button during a session.
- [ ] App navigates back to the home screen without freezing.
- [ ] The ring animation is not visible or animating on the home screen.
- [ ] Soundscape (if on) continues playing on the home screen.
- [ ] Breathing audio cues are silent after exit.
- [ ] Haptics stop after exit.
- [ ] Starting a new session after exit works correctly (no stale state).

---

## 2. Settings

### 2a. Open SettingsSheet (in-session)

- [ ] During an active session, open the settings sheet.
- [ ] The sheet slides up without crashing.
- [ ] Session ring animation continues running behind the sheet.
- [ ] Breathing audio and haptics continue while sheet is open.

### 2b. Change breathing technique

- [ ] On the home screen, open the exercise selection sheet.
- [ ] Select a different breathing technique (e.g. switch from Deep Breathing to Box Breathing).
- [ ] The selected technique name updates in the UI.
- [ ] Tap start — the new timing is used in session (4-4-4-4 for Box, etc.).
- [ ] Reopening the app retains the last-selected technique.

### 2c. Save settings changes

- [ ] Toggle sound off in settings; start a session — no audio cues play.
- [ ] Toggle sound back on; start a session — cues play again.
- [ ] Toggle haptics off; start a session — no haptic pulses.
- [ ] Toggle haptics back on; start a session — pulses resume.
- [ ] Change animation theme (grounded / calm / uplifting); ring colors update.
- [ ] Close and reopen the app; all changed settings persist.

---

## 3. Audio

### 3a. Soundscape plays

- [ ] Open the app with soundscape enabled.
- [ ] Ambient soundscape audio begins playing within a few seconds of launch.
- [ ] Navigate between screens (home → breathing → home); soundscape continues uninterrupted.
- [ ] The correct soundscape plays after switching (dream / fuzzy / keys) in settings.
- [ ] Setting soundscape to "Off" silences ambient audio immediately.
- [ ] Enabling soundscape again resumes ambient audio.

### 3b. Audio stops correctly

- [ ] Lock the device screen (or send app to background); ambient soundscape **pauses** while
  backgrounded (`useBackgroundSoundscape` AppState handler).
- [ ] Unlock / return to foreground; soundscape **resumes** from where it left off (if sound still
  enabled and soundscape is not "Off").
- [ ] Lock during a breathing session; **no new** inhale/exhale cues fire in background
  (`useBreathingAudio` foreground guard). A cue already playing may finish briefly.
- [ ] Force-close the app; no audio continues playing.
- [ ] Switch to another app mid-session; same pause/resume behavior as lock screen.
- [ ] Hardware mute switch: soundscape should still play when foreground (`playsInSilentMode: true`).
- [ ] Exit breathing session to home; breathing cues stop; soundscape continues on home (by design).

---

## 4. Scenes (wallpaper / background)

### 4a. Wallpapers load

- [ ] Navigate to the scenes screen from the home screen.
- [ ] All scene tiles render correctly (no blank or broken image tiles).
- [ ] Tapping a tile shows a preview / applies the scene.

### 4b. Selection persists

- [ ] Select a new scene.
- [ ] Navigate back to the home screen — the selected wallpaper is applied.
- [ ] Close and reopen the app — the selected wallpaper is still applied.
- [ ] Selecting "none" or a default resets the wallpaper correctly.

---

## 5. Global Room ("Breathe Together")

### 5a. Join room

- [ ] Tap the Global Breath button on the home screen.
- [ ] The room picker loads with the three room options (Deep Rest, Clear Focus, Gentle Unwind).
- [ ] Participant counts load (or show a loading indicator if the server is cold-starting).
- [ ] Tap a room — the session screen opens.
- [ ] Connection state transitions from "connecting" to "connected" without an error message.
- [ ] The breathing ring begins animating in sync with the server-broadcast phase.
- [ ] Participant count is visible and greater than 0.

### 5b. Leave room

- [ ] Tap the back/exit button in the room session screen.
- [ ] App navigates to the room picker (or home), without freezing.
- [ ] No WebSocket errors appear in the console after leaving.
- [ ] Rejoining the same or a different room works correctly.
- [ ] Leaving and returning to home does not cause duplicate soundscape audio.

---

## 6. Information Archive

### 6a. Archive loads

- [ ] Tap the archive/library button on the home screen.
- [ ] The archive screen loads without a blank state or crash.
- [ ] At least several items (articles, books, videos) are listed.
- [ ] Tapping a resource item opens a detail view or external link without crashing.
- [ ] Search or filter (if present) returns relevant results.
- [ ] Back navigation returns to the home screen correctly.

---

## Run before commit

Run all three steps in order. Do not commit if any step fails.

```bash
# 1. Lint
npm run lint

# 2. Tests
npm test

# 3. git status — verify no unintended files are staged
git status
```

After the commands above pass:

**Manual app check (30-second smoke test):**
- [ ] App launches without a crash.
- [ ] Home screen renders (correct wallpaper, exercise shown).
- [ ] Tap start — breathing session opens, ring animates.
- [ ] Pause and resume — ring holds position, no doubled haptics.
- [ ] Exit session — returns to home cleanly.
- [ ] Soundscape plays throughout.

Commit only after all of the above are green.

---

*This checklist describes the expected behavior of the app as of the cleanup effort started
2026-06-23. Update this document whenever a behavior change is intentional (new feature, fix,
removal).*
