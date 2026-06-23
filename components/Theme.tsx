/**
 * Theme barrel — re-exports everything so existing imports remain unchanged.
 *
 * Implementation is split across focused files:
 *   themeTokens.ts      — palette types, palette data, THEMES metadata
 *   bottomSheetTheme.ts — BottomSheetTokens type
 *   animationTheme.ts   — breathing animation tokens and hooks
 *   ThemeProvider.tsx   — ThemeProvider component, useTheme, useWallpaperForeground
 */
export type { ThemeName, Mode, AppearancePref, PaletteTokens } from './themeTokens';
export { THEMES, palettes } from './themeTokens';

export type { BottomSheetTokens } from './bottomSheetTheme';

export type { BreathingAnimationTokens } from './animationTheme';
export { getBreathingTokensForTheme, useBreathingAnimationTokens } from './animationTheme';

export { ThemeProvider, useTheme, useWallpaperForeground } from './ThemeProvider';
