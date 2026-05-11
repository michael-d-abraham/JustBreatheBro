# JustBreatheBro

A breathing and mediation app

<video src="assets/icons/mainVid.mp4" autoplay loop muted playsinline width="100%"></video>


**[Download free on the App Store](https://apps.apple.com/us/app/justbreathebro/id6756590863)**  
Google Play listing is not live yet.

---

## Sessions & media

- **Breathing:** Multiple exercises to choose from, each with benefits, methods, and instructions curated through **BreathBot**—a RAG-style pipeline that pulls from hand-picked academic sources so in-app copy stays grounded and accurate.  
- **Presentation:** Custom artwork, custom animations, and haptics timed to the breath cycle.  
- **Audio:** Handmade breathing cues and ambient soundscapes—written, recorded, and produced in-house (including live **flute** on the breathing tracks).  

---

## Information archive

A curated library of **articles**, **videos**, and **books** to support a mindfulness practice—selected and refined for quality and usefulness, not algorithmic noise.

---

## Breathe together (real time)

**Shared breathing sessions** use a **WebSocket** connection to a small **Node** service hosted on **Render**, so multiple people can follow the **same unified breath** in sync—useful for a class, a team, or anyone who wants to breathe on the same cadence.

---

## BreathBot (content tooling)

The BreathBot repo holds the agentic RAG workflow that generates and checks exercise and archive-style content against your source corpus:

**[github.com/michael-d-abraham/AIBreathBot](https://github.com/michael-d-abraham/AIBreathBot)**

---

## Product map

![Outline](assets/icons/wireframe.png)

---

## Stack (this repo)

| Area | Choice |
|------|--------|
| App | **React Native** via **Expo**, file-based routes under `app/` |
| Persistence | **AsyncStorage** |
| Live sessions | **WebSockets** → Node server on **Render** |
| Errors / performance | **Sentry** |
| Haptics | **expo-haptics** |
| Motion | **Reanimated** |

Session flow, timers, audio, and haptics are coordinated through layered hooks (for example `useBreathingCycle`, animation, audio, haptics); global look-and-feel lives in `contexts/`.

---

## Art & audio (outside the IDE)

- **Visuals & icons:** drawn in **Procreate**  
- **Music & sound design:** **Logic Pro**  

---

*JustBreatheBro — Michael Abraham*
