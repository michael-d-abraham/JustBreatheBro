import React from "react";
import { useAppSettings } from "@/contexts/appSettingsContext";
import BreathingThemeGraphic from "./BreathingThemeGraphic";
import CircularOptionButton from "./CircularOptionButton";
import ScenesHorizontalPicker from "./ScenesHorizontalPicker";
import ScenesPreviewTile from "./ScenesPreviewTile";
import { THEMES, ThemeName, useTheme } from "./Theme";

type ThemePickerTarget = "app" | "animation";
type ThemePickerVariant = "page" | "bottomSheet";

interface ThemePickerProps {
  target?: ThemePickerTarget;
  variant?: ThemePickerVariant;
}

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

/* -------------------------------------------------------------------------- */
/* Page variant: circular colored option buttons                             */
/* -------------------------------------------------------------------------- */

function CircleThemePicker({ target }: { target: ThemePickerTarget }) {
  const themeContext = useTheme();
  const appSettings = useAppSettings();

  const isApp = target === "app";
  const selectedTheme = isApp ? themeContext.themeName : appSettings.settings.animationTheme;
  const setTheme = isApp ? themeContext.setThemeName : appSettings.setAnimationTheme;

  return (
    <>
      {Object.entries(THEMES).map(([key, t]) => (
        <CircularOptionButton
          key={key}
          label={t.name}
          color={t.preview}
          isSelected={selectedTheme === key}
          onPress={() => setTheme(key as ThemeName)}
        />
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom sheet variant: horizontal scrolling preview tiles                  */
/* -------------------------------------------------------------------------- */

function TileThemePicker({ target }: { target: ThemePickerTarget }) {
  const themeContext = useTheme();
  const appSettings = useAppSettings();

  const isApp = target === "app";
  const selectedTheme = isApp ? themeContext.themeName : appSettings.settings.animationTheme;
  const setTheme = isApp ? themeContext.setThemeName : appSettings.setAnimationTheme;

  return (
    <ScenesHorizontalPicker>
      {Object.entries(THEMES).map(([key, t]) => (
        <ScenesPreviewTile
          key={key}
          label={t.name}
          selected={selectedTheme === key}
          onPress={() => setTheme(key as ThemeName)}
        >
          <BreathingThemeGraphic themeName={key as ThemeName} />
        </ScenesPreviewTile>
      ))}
    </ScenesHorizontalPicker>
  );
}
