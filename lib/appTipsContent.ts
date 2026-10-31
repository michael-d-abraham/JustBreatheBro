/** Tips and Tricks rows (Support sheet only). */
export type AppTip = {
  id: string;
  title: string;
  /** List row subtitle */
  description: string;
  /** Optional longer copy on the detail screen */
  detail?: string;
};

export function getAppTipById(id: string): AppTip | undefined {
  return APP_TIPS.find((tip) => tip.id === id);
}

export const APP_TIPS: AppTip[] = [
  {
    id: "start",
    title: "Start a session",
    description:
      "On Meditate, tap Start and follow the ring. Guide dots fill on inhale and empty on exhale.",
  },
  {
    id: "pause",
    title: "Pause a session",
    description:
      "Tap pause during a session to freeze the ring, timer, and dots. Resume picks up where you left off.",
    detail:
      "During a session, tap pause on the controls to open a rest state. The ring, countdown, and guide dots all stop until you resume.",
  },
  {
    id: "scenes",
    title: "Scenes",
    description:
      "Tap the tulip icon to change wallpaper, soundscape, theme, and light or dark appearance.",
  },
  {
    id: "global",
    title: "Global Room",
    description:
      "Swipe to Connect to see the map and send a gentle pulse when you are connected.",
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Menu → Settings for session sound and haptics. In a live session, the gear opens the same sheet.",
  },
];
