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
    shortDescription: "Calm your nervous system with slow, controlled breaths",
    description: "Deep breathing, also known as diaphragmatic or belly breathing, is a foundational practice that engages your diaphragm to promote full oxygen exchange. This technique activates the parasympathetic nervous system, shifting your body from 'fight or flight' mode into a state of calm and restoration. By breathing slowly and deeply into your belly rather than shallowly into your chest, you encourage complete air circulation and reduce tension throughout your body.",
    benefit: "Reduces stress and anxiety, lowers heart rate and blood pressure, improves focus and mental clarity, promotes better sleep, strengthens the diaphragm, increases oxygen flow to the brain, and helps manage pain and chronic conditions.",
    method: "Find a comfortable seated or lying position. Place one hand on your chest and one on your belly. Inhale slowly through your nose for 6 seconds, allowing your belly to rise while your chest remains relatively still. Exhale gently through your nose or mouth for 6 seconds, feeling your belly fall. The hand on your belly should move more than the one on your chest. Repeat for 5-10 minutes.",
    symbol: "🌙",
  },
  {
    id: "2", 
    title: "Box Breathing",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    shortDescription: "Four equal sides of breath for mental clarity and focus",
    description: "Box breathing, also called square breathing or four-square breathing, is a powerful stress-relief technique used by Navy SEALs, police officers, and athletes to maintain calm and focus in high-pressure situations. The practice involves four equal parts—inhale, hold, exhale, hold—creating a 'box' pattern that helps regulate the autonomic nervous system and brings immediate mental clarity. This rhythmic pattern interrupts stress responses and resets your breathing to a calm, controlled state.",
    benefit: "Enhances concentration and performance under pressure, reduces anxiety and panic, regulates the nervous system, improves emotional control, lowers cortisol levels, increases CO2 tolerance, sharpens mental clarity, and helps manage PTSD symptoms.",
    method: "Sit upright with your feet flat on the floor and hands resting comfortably. Exhale completely to empty your lungs. Inhale through your nose for 4 counts, filling your lungs completely. Hold your breath for 4 counts, maintaining a relaxed body. Exhale slowly through your mouth for 4 counts, emptying your lungs fully. Hold empty for 4 counts. Visualize tracing the four sides of a box as you breathe. Repeat for 5-10 rounds.",
    symbol: "🕹",
  },
  {
    id: "3",
    title: "Quick Calm",
    inhale: 3,
    hold1: 1,
    exhale: 3,
    hold2: 1,
    shortDescription: "Fast-acting technique for instant stress relief",
    description: "Quick Calm is a rapid relaxation technique designed for moments when you need immediate stress relief but don't have time for extended practice. With shorter breath counts and minimal holds, this exercise can be done anywhere—before a meeting, during a stressful commute, or when you feel anxiety rising. The brief pauses between breaths help you regain control without requiring deep concentration, making it perfect for acute stress situations or as a gateway to longer breathing practices.",
    benefit: "Provides rapid anxiety relief, quickly interrupts stress response, easy to practice discreetly in any situation, improves immediate emotional regulation, reduces muscle tension, lowers acute stress hormones, accessible for beginners, and serves as an effective reset during busy days.",
    method: "This exercise can be done sitting, standing, or even walking. Close your eyes if possible, or soften your gaze. Inhale through your nose for 3 counts, breathing naturally without forcing. Hold gently for 1 count. Exhale smoothly through your nose or mouth for 3 counts. Hold for 1 count before beginning the next breath. Maintain a steady, comfortable rhythm. Practice for 1-3 minutes or until you feel calmer.",
    symbol: "💨",
  },
];

// Storage keys
const EXERCISES_KEY = 'breathing_exercises';
const CURRENT_EXERCISE_KEY = 'current_exercise';
const BACKGROUND_IMAGE_KEY = 'background_image';
const ANIMATION_THEME_KEY = 'animation_theme';

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