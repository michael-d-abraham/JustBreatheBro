import { settingsPickerSurfaceColor } from "@/components/settingsScreenTokens";
import ThemeCard from "@/components/ThemeCard";
import { SettingsOptionCardRow, usePickerCardWidth } from "@/components/SettingsOptionCard";
import { useAppSettings } from "@/contexts/appSettingsContext";
import CircularOptionButton from "./CircularOptionButton";
import { THEMES, ThemeName, useTheme, palettes } from "./Theme";
import React from "react";

type ThemePickerTarget = "app" | "animation";
type ThemePickerVariant = "page" | "bottomSheet";

interface ThemePickerProps {
  target?: ThemePickerTarget;
  variant?: ThemePickerVariant;
}

const THEME_ORDER: ThemeName[] = ["grounded", "calm", "uplifting"];

export default function ThemePicker({
  target = "app",
  variant = "page",
}: ThemePickerProps) {
  return variant === "bottomSheet" ? (
    <TileThemePicker target={target} />
  ) : (
    <CircleThemePicker target={target} />
  );
}

function CircleThemePicker({ target }: { target: ThemePickerTarget }) {
  const themeContext = useTheme();
  const appSettings = useAppSettings();

  const isApp = target === "app";
  const selectedTheme = isApp ? themeContext.themeName : appSettings.settings.animationTheme;
  const setTheme = isApp ? themeContext.setThemeName : appSettings.setAnimationTheme;

  return (
    <>
      {THEME_ORDER.map((key) => {
        const t = THEMES[key];
        return (
          <CircularOptionButton
            key={key}
            label={t.name}
            color={t.preview}
            isSelected={selectedTheme === key}
            onPress={() => setTheme(key)}
          />
        );
      })}
    </>
  );
}

function TileThemePicker({ target }: { target: ThemePickerTarget }) {
  const themeContext = useTheme();
  const appSettings = useAppSettings();
  const { mode, tokens } = themeContext;
  const cardSurface = settingsPickerSurfaceColor(
    mode,
    tokens.systemSecondaryGroupedBg,
  );
  const cardWidth = usePickerCardWidth();

  const isApp = target === "app";
  const selectedTheme = isApp ? themeContext.themeName : appSettings.settings.animationTheme;
  const setTheme = isApp ? themeContext.setThemeName : appSettings.setAnimationTheme;

  return (
    <SettingsOptionCardRow>
      {THEME_ORDER.map((key) => {
        const meta = THEMES[key];
        const palette = palettes[key][mode];
        return (
          <ThemeCard
            key={key}
            title={meta.name}
            themeName={key}
            selected={selectedTheme === key}
            onPress={() => setTheme(key)}
            accentColor={palette.accentPrimary}
            backgroundColor={cardSurface}
            width={cardWidth}
            testID={`scenes.theme-${key}`}
          />
        );
      })}
    </SettingsOptionCardRow>
  );
}
