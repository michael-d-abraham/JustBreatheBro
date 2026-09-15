import { modeTokens } from "@/components/modeTokens";
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

/** Immersive scene / zenscape cards — tall iPhone portrait preview. */
export const sceneEnvironmentCard = {
  radius: 16,
  gap: 10,
  screenInset: settingsScreenPadding,
  /** ~2.4 tiles + peek — slightly wider for phone-like wallpaper preview */
  scrollVisibleCount: 2.4,
  /** width : height — ~iPhone portrait (9:16) so cover crop matches home screen */
  aspectRatio: 9 / 16,
  labelSize: 16,
  labelInset: 12,
  gradientHeightRatio: 0.38,
  selectedWidthScale: 1.015,
  unselectedWidthScale: 0.99,
  selectedRingWidth: 2,
  selectedRingColor: "rgba(255, 255, 255, 0.55)",
  unselectedOpacity: 0.94,
  offWidthScale: 0.46,
  offLabelSize: 15,
  utilityUnselectedOpacity: 0.78,
  pressedOpacity: settingsSelectionIndicator.pressedOpacity,
} as const;

/** Immersive soundscape environment cards — compact square-ish tiles. */
export const soundscapeEnvironmentCard = {
  radius: 14,
  gap: 10,
  screenInset: settingsScreenPadding,
  /** ~2.25 tiles + peek — slightly smaller cards */
  scrollVisibleCount: 2.25,
  /** width : height — a touch wider/shorter than 4:5 */
  aspectRatio: 6 / 7,
  labelSize: 15,
  labelInset: 12,
  gradientHeightRatio: 0.52,
  selectedRingWidth: 2,
  selectedRingColor: "rgba(255, 255, 255, 0.62)",
  unselectedOpacity: 0.9,
  offWidthScale: 0.46,
  offLabelSize: 15,
  utilityUnselectedOpacity: 0.78,
  pressedOpacity: settingsSelectionIndicator.pressedOpacity,
} as const;

export function getSceneEnvironmentBaseWidth(
  screenWidth: number,
  visibleCount = sceneEnvironmentCard.scrollVisibleCount,
): number {
  const available = screenWidth - sceneEnvironmentCard.screenInset * 2;
  const gap = sceneEnvironmentCard.gap;
  return Math.floor((available - (visibleCount - 1) * gap) / visibleCount);
}

export function getSceneEnvironmentCardSize(
  baseWidth: number,
  selected: boolean,
): { width: number; height: number } {
  const scale = selected
    ? sceneEnvironmentCard.selectedWidthScale
    : sceneEnvironmentCard.unselectedWidthScale;
  const width = Math.round(baseWidth * scale);
  const height = Math.round(width / sceneEnvironmentCard.aspectRatio);
  return { width, height };
}

export function getSceneEnvironmentOffCardWidth(baseWidth: number): number {
  return Math.round(baseWidth * sceneEnvironmentCard.offWidthScale);
}

export function getSoundscapeEnvironmentBaseWidth(
  screenWidth: number,
  visibleCount = soundscapeEnvironmentCard.scrollVisibleCount,
): number {
  const available = screenWidth - soundscapeEnvironmentCard.screenInset * 2;
  const gap = soundscapeEnvironmentCard.gap;
  return Math.floor((available - (visibleCount - 1) * gap) / visibleCount);
}

export function getSoundscapeEnvironmentCardSize(
  baseWidth: number,
): { width: number; height: number } {
  const width = baseWidth;
  const height = Math.round(width / soundscapeEnvironmentCard.aspectRatio);
  return { width, height };
}

export function getSoundscapeEnvironmentOffCardWidth(baseWidth: number): number {
  return Math.round(baseWidth * soundscapeEnvironmentCard.offWidthScale);
}

/** Square app-icon tiles — same row rhythm as soundscape, 1:1 preview. */
export const appIconEnvironmentCard = {
  radius: 14,
  gap: 10,
  screenInset: settingsScreenPadding,
  /** ~4 tiles + peek — slightly smaller than default app-icon footprint */
  scrollVisibleCount: 4.25,
  aspectRatio: 1,
  labelSize: 12,
  labelGap: 5,
  selectedRingWidth: 2,
  selectedRingColor: "rgba(255, 255, 255, 0.62)",
  unselectedOpacity: 0.9,
  pressedOpacity: settingsSelectionIndicator.pressedOpacity,
} as const;

export function getAppIconEnvironmentBaseWidth(
  screenWidth: number,
  visibleCount = appIconEnvironmentCard.scrollVisibleCount,
): number {
  const available = screenWidth - appIconEnvironmentCard.screenInset * 2;
  const gap = appIconEnvironmentCard.gap;
  return Math.floor((available - (visibleCount - 1) * gap) / visibleCount);
}

export function getAppIconEnvironmentCardSize(
  baseWidth: number,
): { width: number; height: number } {
  const width = baseWidth;
  const height = Math.round(width / appIconEnvironmentCard.aspectRatio);
  return { width, height };
}

/** @deprecated use getSoundscapeEnvironmentBaseWidth */
export function getSoundscapeEnvironmentCardWidth(
  screenWidth: number,
  visibleCount = soundscapeEnvironmentCard.scrollVisibleCount,
): number {
  return getSoundscapeEnvironmentBaseWidth(screenWidth, visibleCount);
}

/** @deprecated use getSoundscapeEnvironmentCardSize */
export function getSoundscapeEnvironmentCardHeight(cardWidth: number): number {
  return Math.round(cardWidth / soundscapeEnvironmentCard.aspectRatio);
}

/** @deprecated use getSoundscapeEnvironmentOffCardWidth */
export function getSoundscapeOffCardWidth(baseWidth: number): number {
  return getSoundscapeEnvironmentOffCardWidth(baseWidth);
}

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

/** Scenes / Support sheet wash — palette scene background, slightly translucent like legacy Scenes page. */
export const THEMED_SHEET_BACKGROUND_ALPHA = 0.96;

export function themedSceneBackground(sceneBackground: string): string {
  if (typeof sceneBackground !== "string") return sceneBackground;
  const clean = sceneBackground.replace("#", "");
  if (clean.length !== 6) return sceneBackground;
  const a = Math.min(255, Math.max(0, Math.round(THEMED_SHEET_BACKGROUND_ALPHA * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${a}`;
}

/** Neutral tile surface — aligned with mode surface tokens. */
export function settingsPickerSurfaceColor(
  mode: "light" | "dark",
  groupedSecondary: ColorValue,
): ColorValue {
  return mode === "light" ? modeTokens.light.surface : groupedSecondary;
}

/** Unified border — neutral separator; selection uses mode selectedBorder. */
export function settingsPickerBorderStyle(
  selected: boolean,
  separator: ColorValue,
  selectedBorder?: ColorValue,
): ViewStyle {
  return {
    borderRadius: settingsPickerCard.radius,
    borderWidth: selected
      ? settingsSelectionIndicator.borderWidth
      : StyleSheet.hairlineWidth,
    borderColor: selected ? (selectedBorder ?? separator) : separator,
  };
}

export { previewTint as settingsPreviewTint };

/**
 * Scenes page composition — calmer spacing and hierarchy on top of Settings tokens.
 * Cards/pickers unchanged; only section structure and rhythm.
 */
export const scenesLayout = {
  contentTopInset: 2,
  /** Primary visual section (Scene) */
  heroSectionSpacing: 36,
} as const;
