/** Short in-app pointers for Tips and Tricks (sheet only). */
export type AppTip = {
  id: string;
  text: string;
};

export const APP_TIPS: AppTip[] = [
  { id: "start", text: "Tap Start on Meditate to breathe with the ring." },
  { id: "pause", text: "Pause stops the ring, timer, and guide dots." },
  { id: "technique", text: "Change technique on Meditate — your pick is saved." },
  { id: "dots", text: "Dots above the ring fill on inhale, empty on exhale." },
  { id: "scenes", text: "Tulip icon → wallpaper, soundscape, theme, light/dark." },
  { id: "global", text: "Create tab → Global Room map and gentle pulses." },
  { id: "videos", text: "Video walkthroughs tab → guided breathing videos." },
  { id: "settings", text: "Menu → Settings for sound and haptics." },
];
