# Dev Session Protocol

> How to start and end a focused cleanup/dev session with Cursor.  
> Trigger phrases are wired in `.cursor/rules/dev-session.mdc`.

---

## Start a session

Say in chat:

```text
Mr cursor start up a session
```

Optionally add today's chunk:

```text
Mr cursor start up a session — today's chunk is merge sound pickers
```

Cursor will:

1. Run `npm run check` (lint + all Jest tests)
2. Start **test watch** in a background terminal
3. Start **Expo dev client / Metro** in a background terminal
4. Post a briefing: scope, tests to watch, manual tier, device yes/no

---

## Terminals

| Terminal | Command | Purpose |
|----------|---------|---------|
| T0 (once) | `npm run check` | Baseline gate — must pass before coding |
| T1 | `npm run test:watch` | Re-run tests on file save |
| T2 | `npm run session:ios` | `npx expo start --dev-client` — daily loop |
| T2b | `npm run ios` | `npx expo run:ios` — native rebuild when needed |

### When to use `npm run ios` instead of `session:ios`

- First time on a machine / simulator has no dev client installed
- After changing native modules or `app.json` plugins
- Simulator app crashes on launch with "dev client not found"

`expo run:ios` builds the native app **and** starts Metro (~2–5 min).  
`session:ios` only starts Metro (~10 sec) — use it for most sessions.

Press **`i`** in the Metro terminal if the iOS simulator does not open automatically.

---

## End a session

Say:

```text
Mr cursor end session
```

Cursor will re-run `npm run check`, append to `docs/SESSION_LOG.md`, **scan and simplify** docs
(`PROJECT_KNOWLEDGE.md`, `AGENTS.md`, checklists), and summarize.

---

## Manual testing tiers

### Tier A — 30-second sim smoke (every commit)

**Automated (nav path):** after Maestro CLI is installed and the sim app is built, run
`npm run e2e:ios` (see `docs/MAESTRO.md`). That covers Start → pause → resume → exit and
home → Scenes → close. Soundscape still needs a human listen.

Run on **iOS Simulator** after each change (manual or via Maestro + soundscape check):

- [ ] App launches → home shows wallpaper + technique name
- [ ] Tap **Start** → ring animates, phase label visible, timer counts down
- [ ] Tap screen → controls appear, then auto-hide
- [ ] **Pause** → ring freezes, timer stops
- [ ] **Resume** → continues from frozen position (no restart from idle)
- [ ] **Exit** → home cleanly; no ghost ring on home
- [ ] Soundscape audible on home (if sound enabled)

### Tier B — Area-specific (when touching that subsystem)

#### Navigation / routes

- [ ] Home → Scenes → close → home
- [ ] Home → Information Archive → back
- [ ] Home → One Breath picker → back
- [ ] Deep link `/support` → redirects to home

#### Settings / sheets

- [ ] In-session SettingsSheet opens; session keeps running behind it
- [ ] Change soundscape on Scenes → ambient switches
- [ ] Change animation theme → ring colors update on next session
- [ ] Change wallpaper → persists after force-quit and reopen

#### Audio (sim + device)

Sim:

- [ ] Inhale/exhale cues on phase transitions (sound on)
- [ ] Toggle sound off → no cues; on → cues return
- [ ] Exit session → cues stop; ambient continues on home

**Device only:**

- [ ] Lock phone → soundscape **pauses**; unlock → **resumes**
- [ ] Lock phone mid-session → no **new** breathing cues in background
- [ ] Hardware mute switch → soundscape still plays (`playsInSilentMode: true`)

#### Haptics (**device only**)

- [ ] Pulses during phases (haptics on)
- [ ] Pause → pulses stop immediately
- [ ] Resume → no double pulse burst

#### Global room

- [ ] Picker shows 3 rooms; counts load or show loading
- [ ] Join → connecting → connected; ring syncs with server
- [ ] Leave → picker; rejoin works; no duplicate soundscape

#### Storage

- [ ] Change technique → session uses new timing
- [ ] Force-quit → reopen → technique + wallpaper persist
- [ ] Note: sound/haptics toggles are in-memory unless you changed persistence

### Tier C — Full regression

Run entire [`REGRESSION_CHECKLIST.md`](REGRESSION_CHECKLIST.md) on sim + device before App Store builds or large merges.

---

## Chunk → tier quick map

| Work area | Tier |
|-----------|------|
| Docs / comments only | A |
| Navigation cleanup | A + B nav |
| Dead code removal | A + B nav |
| Picker consolidation | A + B settings |
| Breathing extraction | A + full checklist §1 |
| Audio / AppState | A + B audio + **device** |
| Global room hook | A + B global room |
| Haptics changes | A + **device** |

---

## What sim cannot test

| Behavior | Where to test |
|----------|---------------|
| Haptic feel / double pulses | Physical iPhone |
| Lock-screen soundscape pause/resume | Physical iPhone |
| Silent switch + ambient audio | Physical iPhone |
| WebSocket cold start (Render) | Sim OK (needs network) |

Do **not** use `expo start --web` as primary QA — native audio, haptics, and sheets diverge from iOS.

---

## Git home base

**Branch:** `make_it_urs` ("make it urs") — canonical integration branch; treat like `main`.
Feature branches come off this; PRs merge back here. See `.cursor/rules/home-base-branch.mdc`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`REGRESSION_CHECKLIST.md`](REGRESSION_CHECKLIST.md) | Full manual checklist |
| [`SESSION_LOG.md`](SESSION_LOG.md) | Dated session notes |
| [`AGENTS.md`](../AGENTS.md) | Project map + risky areas |
| [`.cursorrules`](../.cursorrules) | Agent guardrails |
