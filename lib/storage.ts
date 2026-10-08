import AsyncStorage from "@react-native-async-storage/async-storage";

export type Exercise = {
  id: string;
  title: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  shortDescription: string;
  description: string;  
  benefit: string;
  method: string; 
  symbol: string;
};

// Starting data
export const defaultExercises: Exercise[] = [
  {
    id: "1",
    title: "Deep Breathing",
    inhale: 6,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    shortDescription: "Slow, steady breaths to settle the body",
    description: "A simple, grounding breath. Inhale deeply, exhale fully. Let the body soften with each cycle.",
    benefit: "Activates the parasympathetic nervous system, lowers heart rate, improves oxygen exchange, and reduces cortisol levels.",
    method: "Keep your breath low and quiet. Let the belly expand first, chest second. Soften the exhale and release tension in the shoulders and jaw.",
    symbol: "🌙",
  },
  {
    id: "2", 
    title: "Box Breathing",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    shortDescription: "Equal rhythm to steady the mind",
    description: "A balanced breath with four equal parts. Creates structure and brings the mind back to center.",
    benefit: "Regulates autonomic balance, increases CO₂ tolerance, stabilizes heart rate variability, and improves cognitive control.",
    method: "Keep each phase equal and controlled. Stay relaxed during holds no tension. Let your attention trace a steady, repeating rhythm.",
    symbol: "🕹",
  },
  {
    id: "3",
    title: "4-7-8 Breathing",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    shortDescription: "Long exhales to guide you into calm",
    description: "A slow, weighted breath. The long exhale quiets the body and prepares it for rest.",
    benefit: "Enhances vagal tone, suppresses sympathetic activity, slows heart rate, and facilitates sleep onset.",
    method: "Let the exhale be slow and complete. Stay soft during the hold no strain. With each round, allow the body to feel heavier and more still.",
    symbol: "🌙",
  },
];

// Storage keys
const EXERCISES_KEY = 'breathing_exercises';
const CURRENT_EXERCISE_KEY = 'current_exercise';
const BACKGROUND_IMAGE_KEY = 'background_image';
const ANIMATION_THEME_KEY = 'animation_theme';
const SESSION_DURATION_MINUTES_KEY = 'session_duration_minutes';

export const DEFAULT_SESSION_DURATION_MINUTES = 5;

// Get all exercises
export const getExercises = async (): Promise<Exercise[]> => {
  const stored = await AsyncStorage.getItem(EXERCISES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return default exercises if none stored
  return defaultExercises;
};

// Save exercises
export const saveExercises = async (exercises: Exercise[]): Promise<void> => {
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
};

// Get current exercise
export const getCurrentExercise = async (): Promise<Exercise | null> => {
  const stored = await AsyncStorage.getItem(CURRENT_EXERCISE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

// Save current exercise
export const saveCurrentExercise = async (exercise: Exercise): Promise<void> => {
  await AsyncStorage.setItem(CURRENT_EXERCISE_KEY, JSON.stringify(exercise));
};

// Initialize storage with default data
export const initializeStorage = async (): Promise<void> => {
  const existing = await AsyncStorage.getItem(EXERCISES_KEY);
  if (!existing) {
    await saveExercises(defaultExercises);
  }
};

// Clear all stored data and reset to defaults (useful for development)
export const resetStorage = async (): Promise<void> => {
  await AsyncStorage.removeItem(EXERCISES_KEY);
  await AsyncStorage.removeItem(CURRENT_EXERCISE_KEY);
  await saveExercises(defaultExercises);
};

// Force update exercises to current defaults (overwrites stored data)
export const forceUpdateToDefaults = async (): Promise<void> => {
  await saveExercises(defaultExercises);
};

// Get background image
export const getBackgroundImage = async (): Promise<string | null> => {
  const stored = await AsyncStorage.getItem(BACKGROUND_IMAGE_KEY);
  return stored;
};

// Save background image
export const saveBackgroundImage = async (imagePath: string | null): Promise<void> => {
  if (imagePath) {
    await AsyncStorage.setItem(BACKGROUND_IMAGE_KEY, imagePath);
  } else {
    await AsyncStorage.removeItem(BACKGROUND_IMAGE_KEY);
  }
};

// Get animation theme
export const getAnimationTheme = async (): Promise<string | null> => {
  const stored = await AsyncStorage.getItem(ANIMATION_THEME_KEY);
  return stored;
};

// Save animation theme
export const saveAnimationTheme = async (theme: string): Promise<void> => {
  await AsyncStorage.setItem(ANIMATION_THEME_KEY, theme);
};

// Get session duration (minutes)
export const getSessionDurationMinutes = async (): Promise<number> => {
  const stored = await AsyncStorage.getItem(SESSION_DURATION_MINUTES_KEY);
  if (stored) {
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_SESSION_DURATION_MINUTES;
};

// Save session duration (minutes)
export const saveSessionDurationMinutes = async (minutes: number): Promise<void> => {
  await AsyncStorage.setItem(SESSION_DURATION_MINUTES_KEY, String(minutes));
};