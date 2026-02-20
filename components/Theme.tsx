import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";
import { PlatformColor, useColorScheme } from 'react-native';
import { THEME_PREVIEW_COLORS } from '../constants/featureColors';

type Mode = 'light' | 'dark';
type ThemeName = 'grounded' | 'calm' | 'uplifting';
type AppearancePref = 'system' | 'light' | 'dark';

type PaletteTokens = {
    sceneBackground: string; // (main background color)
    surface: string; // (secondary background color)
    accentPrimary: string; // (primary accent color)
    accentMuted: string; // (muted accent color)
    textOnAccent: string; // (text color on accent)
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
        borderSubtle: '#E0DDD5',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0F110E',
        surface: '#1C1E1A',
        accentPrimary: '#8FB968',
        accentMuted: '#5A7A3F',
        textOnAccent: '#FFFFFF',
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
        borderSubtle: '#DDE9F3',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0A0E12',
        surface: '#141820',
        accentPrimary: '#5FB3F0',
        accentMuted: '#2B8FD9',
        textOnAccent: '#FFFFFF',
        borderSubtle: '#222832',
        shadow: '#000000',
      },
    },
    uplifting: {
      light: {
        sceneBackground: '#F7F4FF',
        surface: '#FFFFFF',
        accentPrimary: '#6B5BD0',
        accentMuted: '#C5BAEB',
        textOnAccent: '#1A1625',
        borderSubtle: '#E6E1F7',
        shadow: '#000000',
      },
      dark: {
        sceneBackground: '#0D0B14',
        surface: '#1A1625',
        accentPrimary: '#9B8AE8',
        accentMuted: '#6B5BD0',
        textOnAccent: '#FFFFFF',
        borderSubtle: '#2A2535',
        shadow: '#000000',
      },
    },
  };

  export const THEMES = {
    grounded: {
      name: 'Grounded',
      description: 'Natural, earthy tones',
      preview: THEME_PREVIEW_COLORS.grounded
    },
    calm: {
      name: 'Calm', 
      description: 'Peaceful blue tones',
      preview: THEME_PREVIEW_COLORS.calm
    },
    uplifting: {
      name: 'Uplifting',
      description: 'Energetic purple tones', 
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
      // iOS semantic colors (auto Light/Dark/High-Contrast):
      textPrimary: PlatformColor('label'),
      textSecondary: PlatformColor('secondaryLabel'),
      separator: PlatformColor('separator'),
      systemBg: PlatformColor('systemBackground'),
      systemGroupedBg: PlatformColor('systemGroupedBackground'),
      // Dynamic colors for bottom sheets (system light/dark, independent of theme)
      bottomSheetBg: PlatformColor('systemBackground'),
      bottomSheetText: PlatformColor('label'),
      bottomSheetSecondaryText: PlatformColor('secondaryLabel'),
      bottomSheetSeparator: PlatformColor('separator'),
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