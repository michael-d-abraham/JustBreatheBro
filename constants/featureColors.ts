/**
 * Feature Colors - Visual identifiers for user selections
 *
 * These colors represent actual feature characteristics (theme aesthetics, soundscape tones)
 * and should remain constant regardless of light/dark mode.
 *
 * IMPORTANT: These are NOT UI colors. Do not use these for:
 * - Backgrounds, borders, text, dividers, etc.
 * - Bottom sheet UI elements
 *
 * Use ONLY for:
 * - Visual preview indicators in selection interfaces
 * - Feature representation circles/swatches
 */

/**
 * Theme Preview Colors
 * Visual identifiers for each theme aesthetic
 */
export const THEME_PREVIEW_COLORS = {
  grounded: "#404040", // Black & white (neutral gray for picker)
  calm: "#2B8FD9", // Peaceful blue
  uplifting: "#6B5BD0", // Energetic purple
} as const;

/**
 * Soundscape Preview Colors
 * Visual identifiers for ambient soundscape options
 */
export const SOUNDSCAPE_COLORS = {
  dream: "#7D8B6A", // Dark green - dream state
  fuzzy: "#7A5B40", // Light blue - fuzzy ambient
  keys: "#F5F1EA", // Light gray - piano keys
} as const;

/**
 * Type exports for type safety
 */
export type ThemeColorKey = keyof typeof THEME_PREVIEW_COLORS;
export type SoundscapeColorKey = keyof typeof SOUNDSCAPE_COLORS;
