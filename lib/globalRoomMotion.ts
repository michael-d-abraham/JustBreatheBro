/**
 * Pure motion math for the Global Room: ripples, the glow on a pulsing dot, and ghost fade-out.
 *
 * The animated styles in GlobalRoomMap only *evaluate* these functions on the UI thread, so the
 * shapes of the animations (and their Reduce Motion variants) are unit-tested here without a
 * renderer. Functions that run inside `useAnimatedStyle` carry the 'worklet' directive.
 */

import { GHOST_TTL_MS } from "@/lib/globalPresenceState";

/** A ripple expands and fades over this long (a gentler fade-only version under Reduce Motion). */
export const RIPPLE_MS = 2600;
export const RIPPLE_REDUCED_MS = 1200;
export const RIPPLE_MIN_SCALE = 0.4;
export const RIPPLE_MAX_SCALE = 5;
/** Under Reduce Motion the ring does not travel: it holds this size and only fades. */
export const RIPPLE_REDUCED_SCALE = 1.6;
export const RIPPLE_PEAK_OPACITY_SELF = 0.75;
export const RIPPLE_PEAK_OPACITY_OTHER = 0.55;

/** Glow on the origin dot: quick rise, slow fall. */
export const GLOW_IN_MS = 180;
export const GLOW_OUT_MS = 900;
export const GLOW_OUT_REDUCED_MS = 400;
/** How much the dot swells at peak glow (1 + this). Not applied under Reduce Motion. */
export const GLOW_DOT_SWELL = 0.8;
export const GLOW_HALO_PEAK_OPACITY = 0.9;
export const GLOW_HALO_MIN_SCALE = 0.6;
export const GLOW_HALO_MAX_SCALE = 1.2;

export type RippleFrame = { opacity: number; scale: number };

/** Ripple at `progress` ∈ [0, 1] (0 = just sent, 1 = gone). */
export function rippleFrame(
  progress: number,
  isSelf: boolean,
  reducedMotion: boolean,
): RippleFrame {
  "worklet";
  const p = Math.min(1, Math.max(0, progress));
  const peak = isSelf ? RIPPLE_PEAK_OPACITY_SELF : RIPPLE_PEAK_OPACITY_OTHER;
  return {
    opacity: (1 - p) * peak,
    scale: reducedMotion
      ? RIPPLE_REDUCED_SCALE
      : RIPPLE_MIN_SCALE + p * RIPPLE_MAX_SCALE,
  };
}

export function rippleDurationMs(reducedMotion: boolean): number {
  return reducedMotion ? RIPPLE_REDUCED_MS : RIPPLE_MS;
}

export type GlowFrame = {
  dotOpacity: number;
  dotScale: number;
  haloOpacity: number;
  haloScale: number;
};

/** Dot + halo at glow level `glow` ∈ [0, 1] (0 = resting, 1 = peak). */
export function glowFrame(
  glow: number,
  baseOpacity: number,
  reducedMotion: boolean,
): GlowFrame {
  "worklet";
  const g = Math.min(1, Math.max(0, glow));
  return {
    dotOpacity: baseOpacity + (1 - baseOpacity) * g,
    dotScale: reducedMotion ? 1 : 1 + GLOW_DOT_SWELL * g,
    haloOpacity: GLOW_HALO_PEAK_OPACITY * g,
    haloScale: reducedMotion
      ? 1
      : GLOW_HALO_MIN_SCALE + (GLOW_HALO_MAX_SCALE - GLOW_HALO_MIN_SCALE) * g,
  };
}

export function glowOutMs(reducedMotion: boolean): number {
  return reducedMotion ? GLOW_OUT_REDUCED_MS : GLOW_OUT_MS;
}

export type GhostFade = {
  /** Opacity to start from — already partly faded if the dot has been a ghost for a while. */
  startOpacity: number;
  /** Time left until fully transparent (matches the state machine's expiry). */
  remainingMs: number;
};

/**
 * Where a ghost dot's linear fade should begin. A ghost that mounts late (e.g. the screen
 * re-rendered) resumes mid-fade instead of restarting from full, and always finishes exactly when
 * the state machine removes it.
 */
export function ghostFade(
  leftAtMs: number,
  nowMs: number,
  startOpacity: number,
  ttlMs: number = GHOST_TTL_MS,
): GhostFade {
  const remainingMs = Math.min(ttlMs, Math.max(0, leftAtMs + ttlMs - nowMs));
  return { startOpacity: startOpacity * (remainingMs / ttlMs), remainingMs };
}
