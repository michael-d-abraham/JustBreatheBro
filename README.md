# JustBreatheBro

Simple breathing and mindfulness app built for focus, calm, and better daily recovery.

![JustBreatheBro hero](assets/readMe/readmeHero.png)

## Quick links

- **App Store:** [Download JustBreatheBro](https://apps.apple.com/us/app/justbreathebro/id6756590863)
- **BreathBot (content pipeline):** [github.com/michael-d-abraham/AIBreathBot](https://github.com/michael-d-abraham/AIBreathBot)
- **WebSocket backend (live sessions):** [github.com/michael-d-abraham/breatheAppWebSocketBackEnd](https://github.com/michael-d-abraham/breatheAppWebSocketBackEnd)
- **Google Play:** not live yet

---

## What this app solves

Most breathing apps feel generic or overly gamified.  
JustBreatheBro focuses on:

- short, useful sessions
- custom audio, visuals, and haptics that stay in sync
- evidence-aligned instructions and benefits
- optional live group breathing on one shared rhythm

---

## Product preview

<video width="100%" controls playsinline preload="metadata">
  <source src="assets/readMe/mainVid.mp4" type="video/mp4" />
  Your browser does not support embedded videos.
</video>
<p><a href="assets/readMe/mainVid.mp4">Open video directly</a></p>

---

## Core features

- **Guided sessions:** multiple breathing styles with clear methods and benefits.
- **Immersive experience:** custom animation + timed haptics + handcrafted audio cues.
- **Ambient soundscapes:** background audio to support longer sessions.
- **Information archive:** curated articles, videos, and books for mindfulness practice.
- **Live breathing rooms:** real-time synchronized sessions over WebSockets.

---

## Content quality (BreathBot)

Exercise copy and archive content are generated and checked through **BreathBot**, a RAG-style workflow grounded in hand-picked sources so the in-app guidance stays useful and evidence-aware.

---

## Architecture and product map

![System architecture diagram](assets/readMe/SystemArchitectureDiagram.png)

![Wireframe](assets/readMe/wireframe.png)

---

## Tech stack

- **App:** React Native + Expo (Expo Router)
- **Storage:** AsyncStorage
- **Realtime:** WebSockets (Node service on Render)
- **Motion:** Reanimated
- **Haptics:** expo-haptics
- **Monitoring:** Sentry

Session flow, timers, animation, audio, and haptics are orchestrated through layered hooks (for example `useBreathingCycle`, `useBreathingAnimation`, `useBreathingAudio`, and `useBreathingHaptics`), with global theming/state in `contexts/`.

---

## Repo cleanup opportunities

- Add a short **Local setup** section (`npm install`, `npm start`, `npm test`, `npm run lint`).
- Add a **Project structure** section for fast onboarding (`app/`, `hooks/`, `components/`, `contexts/`, `lib/`).
- Keep README media in one folder (currently `assets/readMe/`) and continue using those exact paths.
- Add release/version notes at the top when shipping major updates.

---

## Art and audio

- **Visuals & icons:** Procreate
- **Music & sound design:** Logic Pro

---

*JustBreatheBro - Michael Abraham*
