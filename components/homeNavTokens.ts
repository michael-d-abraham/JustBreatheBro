/** Home navigation layout — colors from useTheme().mode + useTheme().accent */

import type { ModeTokens } from '@/components/modeTokens';
import { accentHighlightWash } from '@/components/modeTokens';
import type { ThemeAccentTokens } from '@/components/themeAccentTokens';

export const HOME_TAGLINE = "A calmer you starts here";
export const HOME_ONE_BREATH_TAGLINE = "Breathe together in a live room";

export const HOME_NAV_ICON_SIZE = 21;
export const HOME_NAV_ICON_BUTTON_SIZE = 44;
export const HOME_NAV_BLUR_INTENSITY = 48;
export const HOME_NAV_SHADOW_OPACITY = 0.18;
export const HOME_NAV_SHADOW_RADIUS = 12;
export const HOME_NAV_SHADOW_OFFSET = { width: 0, height: 4 } as const;
export const HOME_NAV_SHADOW_COLOR = "#000000";

/** Tagline on wallpaper — primary icon color @ reduced opacity */
export const HOME_TAGLINE_OPACITY = 0.78;

/** Typography on frosted nav chrome */
export const HOME_NAV_CHROME_LABEL_SIZE = 11;
export const HOME_NAV_CHROME_LABEL_WEIGHT = "500" as const;
export const HOME_NAV_CHROME_LABEL_LETTER_SPACING = -0.1;

/** Primary hero — Start CTA */
export const HOME_START_PILL_WIDTH = 248;
export const HOME_START_PILL_HEIGHT = 56;
export const HOME_START_PILL_FONT_SIZE = 28;
export const HOME_START_PILL_HORIZONTAL_PADDING = 32;

/** One Breath hero — circular Join CTA (world-scale primary action) */
export const HOME_JOIN_CIRCLE_SIZE = 260;
export const HOME_JOIN_CIRCLE_FONT_SIZE = 34;
export const HOME_JOIN_CIRCLE_GAP = 24;
export const HOME_JOIN_CIRCLE_BLUR = 56;
export const HOME_JOIN_CIRCLE_SHADOW_OPACITY = 0.28;

/** Secondary hero — technique + timer pickers (side by side; row = START width) */
export const HOME_TECHNIQUE_PILL_WIDTH = 144;
export const HOME_TIMER_PILL_WIDTH = 96;
export const HOME_HERO_PICKER_GAP = 8;
export const HOME_TECHNIQUE_DROPDOWN_WIDTH = 180;
export const HOME_TIMER_DROPDOWN_WIDTH = 100;
export const HOME_TECHNIQUE_PILL_HEIGHT = 38;
export const HOME_TECHNIQUE_PILL_FONT_SIZE = 13;
export const HOME_TECHNIQUE_PILL_HORIZONTAL_PADDING = 20;
export const HOME_TECHNIQUE_PILL_TRAILING_ICON_INSET = 14;

export const HOME_HERO_TAGLINE_GAP = 16;
export const HOME_HERO_TECHNIQUE_GAP = 8;
export const HOME_START_STACK_ABOVE_CENTER = 40;

// ── Hamburger menu ──────────────────────────────────────────────────────────

export const HOME_NAV_MENU_PILL_WIDTH = 154;
export const HOME_NAV_MENU_PILL_HEIGHT = 38;
export const HOME_NAV_MENU_PILL_HORIZONTAL_PADDING = 12;
export const HOME_NAV_MENU_PILL_GAP = 6;
export const HOME_NAV_MENU_ICON_SLOT = 22;
export const HOME_NAV_MENU_ICON_SIZE = 17;
export const HOME_NAV_MENU_LABEL_SIZE = 13;
export const HOME_NAV_MENU_GAP_BELOW_TRIGGER = 4;
export const HOME_NAV_MENU_ANIM_MS = 220;

/** Frosted glass from mode layer */
export function homeNavGlassOverlay(mode: ModeTokens): string {
  return mode.glass.overlay;
}

export function homeNavGlassBorder(mode: ModeTokens): string {
  return mode.glass.border;
}

export function homeNavGlassBlurTint(mode: ModeTokens): 'light' | 'dark' {
  return mode.glass.blurTint;
}

/** Inner capsule layered on frosted glass — footer selected tab, technique picker, menu pills */
export function homeNavInnerCapsuleWash(mode: ModeTokens): string {
  return mode.glass.activeWash;
}

/** @deprecated Prefer homeNavInnerCapsuleWash for layered chrome; theme tint when needed */
export function homeNavActiveHighlight(accent: ThemeAccentTokens): string {
  return accentHighlightWash(accent.highlight);
}

export function homeNavIconPrimary(mode: ModeTokens): string {
  return mode.iconPrimary;
}

export function homeNavIconSecondaryOpacity(mode: ModeTokens): number {
  return mode.iconSecondaryOpacity;
}

export function homeNavSecondarySurface(mode: ModeTokens): string {
  return mode.material.secondarySurface;
}

export function homeNavSecondaryBorder(mode: ModeTokens): string {
  return mode.material.secondaryBorder;
}

export function homeNavSecondaryText(mode: ModeTokens): string {
  return mode.material.secondaryText;
}

export function homeNavSecondaryIcon(mode: ModeTokens): string {
  return mode.material.secondaryIcon;
}
