import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";
import { PlatformColor, useColorScheme } from 'react-native';
import { THEME_PREVIEW_COLORS } from '../constants/featureColors';

// ============================================================================
// SYSTEM 1: uiScheme - Bottom sheets / menus
// ============================================================================
type Mode = 'light' | 'dark';
type AppearancePref = 'system' | 'light' | 'dark';

// ============================================================================
// SYSTEM 3: breathingAnimationTheme - Breathing ring colors
// ============================================================================
type ThemeName = 'grounded' | 'calm' | 'uplifting';

type BreathingAnimationTokens = {
  guideOuterStroke: string;
  guideInnerStroke: string;
  mainStroke: string;
  mainFill: string;
};

export type { ThemeName };

type PaletteTokens = {
    sceneBackground: string; // (main background color)
    surface: string; // (secondary background color)
    accentPrimary: string; // (primary accent color)
    accentMuted: string; // (muted accent color)
    textOnAccent: string; // (text color on accent)
    textPrimary: string; // (main text - follows mode: light mode = dark text, dark mode = light text)
    textSecondary: string; // (secondary text - follows mode)
    borderSubtle: string; // (subtle border color)
    shadow: string; // (shadow color)
};

/**
 * Bottom Sheet Tokens - Strictly typed color tokens for bottom sheets
 * These tokens are INDEPENDENT from app theme colors and automatically
 * adapt to system light/dark mode via PlatformColor.
 * 
 * @see BaseBottomSheet.tsx for usage contract
 */
type BottomSheetTokens = {
    /** Background color - PlatformColor('systemBackground') */
    bottomSheetBg: any;
    /** Primary text color - PlatformColor('label') */
    bottomSheetText: any;
    /** Secondary/description text color - PlatformColor('secondaryLabel') */
    bottomSheetSecondaryText: any;
    /** Divider and handle indicator color - PlatformColor('separator') */
    bottomSheetSeparator: any;
};

type Tokens = PaletteTokens & BottomSheetTokens;

/** Export BottomSheetTokens for strict type checking in bottom sheet components */
export type { BottomSheetTokens };

const palettes: Record<ThemeName, Record<Mode, PaletteTokens>> = {
    grounded: {
      light: {
        sceneBackground: '#F5F3ED',
        surface: '#FFFFFF',
        accentPrimary: '#5A7A3F',
        accentMuted: '#B4D39A',
        textOnAccent: '#1C1E1A',
        textPrimary: '#1C1E1A',
        textSecondary: '#3D4039',
        borderSubtle: '#E0DDD5',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0F110E',
        surface: '#1C1E1A',
        accentPrimary: '#8FB968',
        accentMuted: '#D9D9D9',
        textOnAccent: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#B8BCB2',
        borderSubtle: '#2D3028',
        shadow: '#000000',
      },
    },
    calm: {
      light: {
        sceneBackground: '#F0F7FC',
        surface: '#FFFFFF',
        accentPrimary: '#2B8FD9',
        accentMuted: '#A3D5F5',
        textOnAccent: '#141820',
        textPrimary: '#141820',
        textSecondary: '#3D4852',
        borderSubtle: '#DDE9F3',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0A0E12',
        surface: '#141820',
        accentPrimary: '#5FB3F0',
        accentMuted: '#2B8FD9',
        textOnAccent: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA8B8',
        borderSubtle: '#222832',
        shadow: '#000000',
      },
    },
    uplifting: {
      light: {
        sceneBackground: '#F7F4FF',
        surface: '#E3DACB',
        accentPrimary: '#6B5BD0',
        accentMuted: '#C5BAEB',
        textOnAccent: '#1A1625',
        textPrimary: '#1A1625',
        textSecondary: '#3D3648',
        borderSubtle: '#3F3C37',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0D0B14',
        surface: '#111111',
        accentPrimary: '#9B8AE8',
        accentMuted: '#6B5BD0',
        textOnAccent: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#B8B0C9',
        borderSubtle: '#484540',
        shadow: '#000000',
      },
    },
  };

  export const THEMES = {
    grounded: {
      name: 'Grounded',
      description: 'Deep forest, moss, stillness',
      preview: THEME_PREVIEW_COLORS.grounded
    },
    calm: {
      name: 'Calm', 
      description: 'Cream, sage, gentle breath',
      preview: THEME_PREVIEW_COLORS.calm
    },
    uplifting: {
      name: 'Earth',
      description: 'Warm sand, clay, embodied', 
      preview: THEME_PREVIEW_COLORS.uplifting
    }
  } as const;

  type ThemeContextValue = {
    themeName: ThemeName;
    appearance: AppearancePref;  // user preference
    mode: Mode;                  // resolved (system or override)
    tokens: Tokens & {
      // system-managed readability for iOS:
      textPrimary: any;
      textSecondary: any;
      separator: any;
      systemBg: any;
      systemGroupedBg: any;
      // Dynamic colors for bottom sheets (system light/dark, independent of theme):
      bottomSheetBg: any;
      bottomSheetText: any;
      bottomSheetSecondaryText: any;
      bottomSheetSeparator: any;
    };
    setThemeName: (t: ThemeName) => void;
    setAppearance: (a: AppearancePref) => void;
  };

  const ThemeContext = createContext<ThemeContextValue | null>(null);

  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const sys = useColorScheme() ?? 'light';
    
    const [themeName, setThemeName] = useState<ThemeName>('uplifting');
    const [appearance, setAppearance] = useState<AppearancePref>('system');

    const mode: Mode = appearance === 'system' ? (sys as Mode) : (appearance as Mode);

  const tokens = useMemo(() => {
    const base = palettes[themeName][mode];
    return {
      ...base,
      // textPrimary/textSecondary come from palette so they follow app mode (light bg = dark text, dark bg = light text)
      separator: PlatformColor('separator'),
      systemBg: PlatformColor('systemBackground'),
      systemGroupedBg: PlatformColor('systemGroupedBackground'),
      // Bottom sheets: follow app mode so they match the rest of the app
      bottomSheetBg: base.surface,
      bottomSheetText: base.textPrimary,
      bottomSheetSecondaryText: base.textSecondary,
      bottomSheetSeparator: base.borderSubtle,
    };
  }, [themeName, mode]);

  const value: ThemeContextValue = useMemo(
    () => ({ themeName, appearance, mode, tokens, setThemeName, setAppearance }),
    [themeName, appearance, mode, tokens]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// ============================================================================
// SYSTEM 2: Wallpaper Content Hook
// ============================================================================
export function useWallpaperForeground(): string {
  return '#FFFFFF';
}

// ============================================================================
// SYSTEM 3: Breathing Animation Theme Hook
// ============================================================================

// Breathing palettes with natural, earthy tones (flattened structure)
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
  // Import from themeContext to get animation settings
  // Keep this as a runtime require to avoid circular imports (themeContext imports Theme.tsx).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useApp } = require('../contexts/themeContext');
  const { settings } = useApp();
  
  const themeName: ThemeName = settings.animationTheme || 'calm';
  
  return breathingPalettes[themeName];
}