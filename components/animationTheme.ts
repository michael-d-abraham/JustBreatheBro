import type { ThemeName } from './themeTokens';

// ============================================================================
// Breathing animation token shape
// ============================================================================

export type BreathingAnimationTokens = {
  guideOuterStroke: string;
  guideInnerStroke: string;
  mainStroke: string;
  mainFill: string;
};

// ============================================================================
// Breathing palettes with natural, earthy tones
// ============================================================================

const breathingPalettes: Record<ThemeName, BreathingAnimationTokens> = {
  grounded: {
    guideOuterStroke: '#8C916C', // Moss
    guideInnerStroke: '#697254', // Forest
    mainStroke: '#697254',       // Forest
    mainFill: '#A7AD89',         // Sage
  },
  calm: {
    guideOuterStroke: '#DBD0C4', // Cream
    guideInnerStroke: '#A7AD89', // Sage
    mainStroke: '#A7AD89',       // Sage
    mainFill: '#DBD0C4',         // Cream
  },
  uplifting: {
    guideOuterStroke: '#B69C85', // Sand
    guideInnerStroke: '#92735C', // Earth
    mainStroke: '#92735C',       // Earth
    mainFill: '#B69C85',         // Sand
  },
};

export function getBreathingTokensForTheme(themeName: ThemeName): BreathingAnimationTokens {
  return breathingPalettes[themeName];
}

export function useBreathingAnimationTokens(): BreathingAnimationTokens {
  // Keep this as a runtime require to avoid circular imports
  // (appSettingsContext imports from Theme.tsx which re-exports this module).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAppSettings } = require('../contexts/appSettingsContext');
  const { settings } = useAppSettings();

  const themeName: ThemeName = settings.animationTheme || 'calm';
  return breathingPalettes[themeName];
}
