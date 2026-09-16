import { useTheme, useWallpaperForeground } from "@/components/Theme";
import { homeNavIconSecondaryOpacity } from "@/components/homeNavTokens";

type LearnChromeVariant = "tab" | "sheet";

/** Text + divider colors — home wallpaper tab vs settings sheet surface. */
export function useLearnChromeColors(variant: LearnChromeVariant = "tab") {
  const wallpaperFg = useWallpaperForeground();
  const { tokens } = useTheme();
  const mutedOpacity = homeNavIconSecondaryOpacity(tokens.mode);
  const onSurface =
    variant === "sheet" ? tokens.settingsLabel : wallpaperFg;
  const onSurfaceMutedOpacity =
    variant === "sheet" ? 0.72 : mutedOpacity;

  return {
    onWallpaper: onSurface,
    onWallpaperMutedOpacity: onSurfaceMutedOpacity,
    onGlassPrimary: tokens.mode.iconPrimary,
    onGlassSecondary: tokens.mode.material.secondaryText,
    onGlassTertiary: tokens.mode.material.secondaryIcon,
    separator: tokens.mode.glass.border,
  };
}
