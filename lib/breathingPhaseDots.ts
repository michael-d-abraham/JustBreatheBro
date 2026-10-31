import type { BreathingPhase } from "@/hooks/useBreathingCycle";
import {
  BREATHING_HAPTIC_TARGET_INTERVAL_MS,
  BREATHING_HAPTIC_TOLERANCE_MS,
  buildPhasePulseDelaysMs,
} from "@/lib/breathingHapticsResolve";

export type BreathingPattern = {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
};

/** Seconds for the active phase; 0 when idle. */
export function phaseDurationSeconds(
  phase: BreathingPhase,
  pattern: BreathingPattern,
): number {
  switch (phase) {
    case "inhale":
      return pattern.inhale;
    case "hold1":
      return pattern.hold1;
    case "exhale":
      return pattern.exhale;
    case "hold2":
      return pattern.hold2;
    default:
      return 0;
  }
}

/** Pulse schedule for the full phase (same dot count as haptics for that phase). */
export function fullPhasePulseDelaysMs(phaseSec: number): number[] {
  if (phaseSec <= 0) return [];
  return buildPhasePulseDelaysMs({
    durationMs: phaseSec * 1000,
    targetIntervalMs: BREATHING_HAPTIC_TARGET_INTERVAL_MS,
    toleranceMs: BREATHING_HAPTIC_TOLERANCE_MS,
    resumeMidPhase: false,
  });
}

/** Dots shown for the inhale→exhale arc (widest of the two pulse trains). */
export function breathGuideDotCount(pattern: BreathingPattern): number {
  const inhaleDots = fullPhasePulseDelaysMs(pattern.inhale).length;
  const exhaleDots = fullPhasePulseDelaysMs(pattern.exhale).length;
  return Math.max(inhaleDots, exhaleDots);
}

/** Filled dot count after `pulsesFired` exhale beats (each beat removes one dot). */
export function filledAfterExhalePulses(
  peakFilled: number,
  pulsesFired: number,
): number {
  return Math.max(0, peakFilled - pulsesFired);
}
