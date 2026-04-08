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
 * Soundscape ring preview — same roles as breathing animation themes
 * (`BreathingAnimationTokens` in Theme.tsx): outer guide, main ring stroke, body fill.
 */
export const SOUNDSCAPE_PALETTES = {
  dream: {
    guideOuterStroke: "#9DAA8F", // airy green-gray halo
    mainStroke: "#5A6848", // deep forest edge
    mainFill: "#7D8B6A", // dream / meadow body
  },
  fuzzy: {
    guideOuterStroke: "#9A8068", // warm terracotta mist
    mainStroke: "#4F3D2A", // deep brown ring
    mainFill: "#7A5B40", // fuzzy / earth body
  },
  keys: {
    guideOuterStroke: "#E4DFD5", // soft ivory ring
    mainStroke: "#A89888", // readable taupe stroke on cream
    mainFill: "#F5F1EA", // piano keys / cream body
  },
} as const;

/**
 * Primary swatch per soundscape (fill tone) — circular pickers, quick references.
 * Prefer `SOUNDSCAPE_PALETTES` for ring previews that need stroke/outer depth.
 */
export const SOUNDSCAPE_COLORS = {
  dream: SOUNDSCAPE_PALETTES.dream.mainFill,
  fuzzy: SOUNDSCAPE_PALETTES.fuzzy.mainFill,
  keys: SOUNDSCAPE_PALETTES.keys.mainFill,
} as const;

/**
 * Type exports for type safety
 */
export type ThemeColorKey = keyof typeof THEME_PREVIEW_COLORS;
export type SoundscapeColorKey = keyof typeof SOUNDSCAPE_COLORS;
export type SoundscapePaletteKey = keyof typeof SOUNDSCAPE_PALETTES;
