import { StyleSheet, type ColorValue, type ViewStyle } from "react-native";
import { SETTINGS_LAYOUT } from "@/components/SettingsInsetGrouped";

/**
 * Shared design tokens for Settings + Scenes bottom sheets.
 * Settings is the source of truth — Scenes inherits these values.
 */

export { SETTINGS_LAYOUT };

/** Horizontal screen / group inset — same as Settings grouped rows. */
export const settingsScreenPadding = SETTINGS_LAYOUT.horizontalInset;

/** Corner radius for grouped surfaces and picker tiles. */
export const settingsGroupRadius = SETTINGS_LAYOUT.cardRadius;

/** Vertical space between sections (SESSION, LOOK, …). */
export const settingsSectionSpacing = SETTINGS_LAYOUT.groupSpacing;

/** Section header typography + inset (SESSION, THEME, …). */
export const settingsSectionHeaderSize = SETTINGS_LAYOUT.sectionHeaderSize;
export const settingsSectionHeaderInset = SETTINGS_LAYOUT.sectionHeaderInset;
export const settingsSectionHeaderMarginBottom =
  SETTINGS_LAYOUT.sectionHeaderMarginBottom;

/** Sheet header — centered title + × close (Settings main, Scenes). */
export const settingsSheetTitleSize = SETTINGS_LAYOUT.largeTitleSizeSheet;
export const settingsSheetTitleGap = SETTINGS_LAYOUT.largeTitleContentGapSheet;
export const settingsSheetCloseSize = SETTINGS_LAYOUT.closeIconSize;

/** One consistent selection treatment for Theme / Soundscape / Scene pickers. */
export const settingsSelectionIndicator = {
  size: 18,
  inset: 6,
  glyphSize: 10,
  borderWidth: 1,
  pressedOpacity: 0.88,
} as const;

/** Compact horizontal picker tiles (Theme, Soundscape). */
export const settingsPickerCard = {
  radius: settingsGroupRadius,
  gap: 8,
  screenInset: settingsScreenPadding,
  contentCardHeight: 78,
  previewHeight: 38,
  previewCircleSize: 32,
  titleSize: 13,
  titleBlockHeight: 16,
  cardPaddingVertical: 5,
  cardPaddingHorizontal: 6,
  /** ~3 tiles + half peek for scroll affordance */
  scrollVisibleCount: 3.5,
  previewTintAlpha: 0.12,
  /** Scene tiles: slightly larger than picker, portrait */
  sceneWidthScale: 1.04,
  sceneAspectRatio: 2 / 3,
  sceneLabelSize: 15,
  sceneLabelInset: 12,
} as const;

export function getSettingsPickerCardWidth(
  screenWidth: number,
  visibleCount = settingsPickerCard.scrollVisibleCount,
): number {
  const available = screenWidth - settingsPickerCard.screenInset * 2;
  const gap = settingsPickerCard.gap;
  return Math.floor((available - (visibleCount - 1) * gap) / visibleCount);
}

export function getSettingsSceneCardWidth(pickerWidth: number): number {
  return Math.round(pickerWidth * settingsPickerCard.sceneWidthScale);
}

export function getSettingsSceneCardHeight(sceneWidth: number): number {
  return Math.round(sceneWidth / settingsPickerCard.sceneAspectRatio);
}

function previewTint(accent: unknown, alpha: number): string {
  if (typeof accent !== "string") return `rgba(0, 0, 0, ${alpha})`;
  const clean = accent.replace("#", "");
  if (clean.length !== 6) return accent;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Picker preview circle — accent color stays inside the ring only. */
export function settingsPreviewCircleStyle(
  accentColor: unknown,
  size = settingsPickerCard.previewCircleSize,
) {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: previewTint(
      accentColor,
      settingsPickerCard.previewTintAlpha,
    ),
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  };
}

/** Neutral tile surface — no tinted selected fill. */
export function settingsPickerSurfaceColor(
  mode: "light" | "dark",
  groupedSecondary: ColorValue,
): ColorValue {
  return mode === "light" ? "#FFFFFF" : groupedSecondary;
}

/** Unified border — neutral separator; selection shown via checkmark only. */
export function settingsPickerBorderStyle(
  selected: boolean,
  separator: ColorValue,
): ViewStyle {
  return {
    borderRadius: settingsPickerCard.radius,
    borderWidth: selected
      ? settingsSelectionIndicator.borderWidth
      : StyleSheet.hairlineWidth,
    borderColor: separator,
  };
}

export { previewTint as settingsPreviewTint };
