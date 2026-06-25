import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { PlatformColor, useColorScheme } from 'react-native';
import type { BottomSheetTokens } from './bottomSheetTheme';
import type { AppearancePref, Mode, PaletteTokens, ThemeName } from './themeTokens';
import { palettes } from './themeTokens';

// ============================================================================
// Combined token shape used throughout the app
// ============================================================================

type Tokens = PaletteTokens &
  BottomSheetTokens & {
    separator: any;
    systemBg: any;
    systemGroupedBg: any;
  };

// ============================================================================
// Context value shape
// ============================================================================

type ThemeContextValue = {
  themeName: ThemeName;
  appearance: AppearancePref; // user preference
  mode: Mode;                 // resolved (system or override)
  tokens: Tokens & {
    // system-managed readability for iOS:
    textPrimary: any;
    textSecondary: any;
    separator: any;
    systemBg: any;
    systemGroupedBg: any;
    // Dynamic colors for bottom sheets (follow app mode, independent of theme):
    bottomSheetBg: any;
    bottomSheetText: any;
    bottomSheetSecondaryText: any;
    bottomSheetSeparator: any;
  };
  setThemeName: (t: ThemeName) => void;
  setAppearance: (a: AppearancePref) => void;
};

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme() ?? 'light';

  const [themeName, setThemeName] = useState<ThemeName>('uplifting');
  const [appearance, setAppearance] = useState<AppearancePref>('system');

  const mode: Mode = appearance === 'system' ? (sys as Mode) : (appearance as Mode);

  const tokens = useMemo(() => {
    const base = palettes[themeName][mode];
    return {
      ...base,
      // textPrimary/textSecondary come from palette so they follow app mode
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

// ============================================================================
// Hooks
// ============================================================================

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
