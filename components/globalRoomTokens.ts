/**
 * Global Room design tokens — the destination of Home → One Breath → Join.
 *
 * Nothing here defines a color. Every color is derived from the existing mode layer (light/dark)
 * and the theme accent (see `globalRoomPalette`), so the room follows appearance and theme exactly
 * like the rest of the app. Only sizes and opacities live here, in the same style as
 * `homeNavTokens.ts` / `settingsScreenTokens.ts`.
 */

import type { ModeTokens } from '@/components/modeTokens';
import { accentHighlightWash } from '@/components/modeTokens';
import type { ThemeAccentTokens } from '@/components/themeAccentTokens';

// ── Map layout ───────────────────────────────────────────────────────────────

/** Horizontal inset for the header row only (map uses full content width). */
export const GLOBAL_ROOM_HEADER_HORIZONTAL_PADDING = 4;
/** No artificial width cap — map scales to the area `fitMapWidth` is given. */
export const GLOBAL_ROOM_MAP_MAX_WIDTH = 4096;
/** Width at which the dot sizes below are authored (a typical phone map). */
export const GLOBAL_ROOM_MAP_REFERENCE_WIDTH = 360;
/** Dots scale with the map, within these bounds (readable on SE, not oversized on iPad). */
export const GLOBAL_ROOM_MAP_MIN_SCALE = 0.85;
export const GLOBAL_ROOM_MAP_MAX_SCALE = 1.6;

// ── Map marks ────────────────────────────────────────────────────────────────

/** Precomputed land grid dots (dotted-map), in viewBox units — scales with the SVG. */
export const GLOBAL_ROOM_LAND_DOT_RADIUS = 0.32;
/** Land dots — primary ink @ reduced opacity (reference: soft white on dark). */
export const GLOBAL_ROOM_LAND_DOT_OPACITY = 0.55;
export const GLOBAL_ROOM_DOT_SIZE = 7;
export const GLOBAL_ROOM_DOT_OPACITY = 0.8;
export const GLOBAL_ROOM_SELF_DOT_SIZE = 10;
/** A recently departed dot starts this visible and fades to nothing. */
export const GLOBAL_ROOM_GHOST_OPACITY = 0.35;
/** Soft halo behind a dot that just pulsed. */
export const GLOBAL_ROOM_GLOW_SIZE = 26;
/** Ripple ring: diameter at scale 1, and stroke. */
export const GLOBAL_ROOM_RIPPLE_SIZE = 28;
export const GLOBAL_ROOM_RIPPLE_BORDER_WIDTH = 1.5;

// ── Pulse control ────────────────────────────────────────────────────────────

/** Frosted circle, same family as the Join circle on Home (smaller: it is not the hero). */
export const GLOBAL_ROOM_PULSE_SIZE = 88;
export const GLOBAL_ROOM_PULSE_ICON_SIZE = 34;
/** Whole control while the server is resting it or we are offline. */
export const GLOBAL_ROOM_UNAVAILABLE_OPACITY = 0.4;
/** Space between the map clip area and the pulse control. */
export const GLOBAL_ROOM_CONTROL_GAP = 20;
export const GLOBAL_ROOM_LABEL_GAP = 14;

/**
 * Every color the Global Room draws, resolved from existing tokens only.
 * Pure so it is unit-tested: a refactor can't quietly introduce a literal color.
 */
export type GlobalRoomPalette = {
  /** Land, other people's dots, their ripples, and all text/icons. */
  ink: string;
  /** Your dot and your own ripple — the theme accent. */
  self: string;
  /** Soft halo behind your dot when you pulse — theme accent wash. */
  selfGlow: string;
  /** Soft halo behind someone else's dot — the neutral glass wash from the mode layer. */
  glow: string;
  /** Interactive text ("Try now") — the theme accent, like Settings links. */
  link: string;
};

export function globalRoomPalette(
  mode: ModeTokens,
  accent: ThemeAccentTokens,
): GlobalRoomPalette {
  return {
    ink: mode.iconPrimary,
    self: accent.highlight,
    selfGlow: accentHighlightWash(accent.highlight),
    glow: mode.glass.activeWash,
    link: accent.highlight,
  };
}
