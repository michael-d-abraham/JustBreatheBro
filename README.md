# JustBreatheBro
Mindfulness and breathing mobile app

<img src="assets/readMe/readmeHero.png" alt="JustBreatheBro hero" width="700" />

## Quick links

- **App Store:** [Download JustBreatheBro](https://apps.apple.com/us/app/justbreathebro/id6756590863)
- **Google Play:** not live yet
- **BreathBot (content pipeline):** [github.com/michael-d-abraham/AIBreathBot](https://github.com/michael-d-abraham/AIBreathBot)
- **WebSocket backend (live sessions):** [github.com/michael-d-abraham/breatheAppWebSocketBackEnd](https://github.com/michael-d-abraham/breatheAppWebSocketBackEnd)


## Product preview

<video width="100%" controls playsinline preload="metadata">
  <source src="assets/readMe/mainVid.web.mp4" type="video/mp4" />
  Your browser does not support embedded videos.
</video>
<p><a href="assets/readMe/mainVid.web.mp4">Open video directly</a></p>

---

## Core features

- **Guided sessions:** multiple breathing styles with methods and benefits.
- **Immersive experience:** custom animation + timed haptics + handcrafted audio cues.
- **Ambient soundscapes:** background audio to support longer sessions.
- **Information archive:** curated articles, videos, and books for mindfulness practice.
- **Live breathing rooms:** real-time synchronized sessions over WebSockets.

---

## Information Archive (BreathBot)

All content is generated and validated through **BreathBot** - a RAG-style workflow grounded in hand-picked sources - so in-app guidance stays credible, consistent, and evidence-aware.

- **BreathBot (content pipeline):** [github.com/michael-d-abraham/AIBreathBot](https://github.com/michael-d-abraham/AIBreathBot)

<img src="assets/readMe/breatheBotDiagram.png" alt="BreathBot workflow diagram" width="900" />

<img src="assets/readMe/breatheBotExample.png" alt="BreathBot output example" width="900" />

---

## Architecture and product map

![System architecture diagram](assets/readMe/SystemArchitectureDiagram.png)

![SystemWireframe](assets/readMe/wireframe.png)
![AnimationWireframe](assets/readMe/wireframe2.png)

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

## Art and audio

- **Visuals & icons:** Procreate
- **Music & sound design:** Logic Pro

---

*JustBreatheBro - Michael Abraham*
