/** Home hero technique labels — display copy (storage titles may differ). */
export const HOME_TECHNIQUE_OPTIONS = [
  { id: "1", label: "Deep Breathing" },
  { id: "2", label: "Box Breathing" },
  { id: "3", label: "Extended Exhale" },
] as const;

export type HomeTechniqueOptionId = (typeof HOME_TECHNIQUE_OPTIONS)[number]["id"];

const TECHNIQUE_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  HOME_TECHNIQUE_OPTIONS.map((option) => [option.id, option.label]),
);

export function getHomeTechniqueLabel(exerciseId: string, fallbackTitle?: string): string {
  return TECHNIQUE_LABEL_BY_ID[exerciseId] ?? fallbackTitle ?? "Deep Breathing";
}

export const HOME_TIMER_OPTIONS = [
  { id: "1", label: "1 min", minutes: 1 },
  { id: "5", label: "5 min", minutes: 5 },
  { id: "10", label: "10 min", minutes: 10 },
  { id: "15", label: "15 min", minutes: 15 },
  { id: "30", label: "30 min", minutes: 30 },
] as const;

export type HomeTimerMinutes = (typeof HOME_TIMER_OPTIONS)[number]["minutes"];

export const DEFAULT_SESSION_DURATION_MINUTES: HomeTimerMinutes = 5;

export function getHomeTimerLabel(minutes: number): string {
  const match = HOME_TIMER_OPTIONS.find((option) => option.minutes === minutes);
  return match?.label ?? `${minutes} min`;
}
