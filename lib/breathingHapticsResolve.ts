type Candidate = {
  pulseCount: number;
  resolved: number;
  delta: number;
  inTolerance: boolean;
};

/**
 * Pick pulseCount so duration divides evenly and resolved spacing stays as close
 * as possible to targetIntervalMs, preferring intervals within toleranceMs.
 */
export function resolvePhasePulsePlan({
  durationMs,
  targetIntervalMs,
  toleranceMs,
  maxDelta = 12,
}: {
  durationMs: number;
  targetIntervalMs: number;
  toleranceMs: number;
  maxDelta?: number;
}): { pulseCount: number; resolvedIntervalMs: number } {
  if (!(durationMs > 0)) {
    return { pulseCount: 1, resolvedIntervalMs: 0 };
  }
  if (!(targetIntervalMs > 0)) {
    return { pulseCount: 1, resolvedIntervalMs: 0 };
  }

  const ideal = Math.max(1, Math.round(durationMs / targetIntervalMs));
  const low = Math.max(1, ideal - maxDelta);
  const high = ideal + maxDelta;

  const candidates: Candidate[] = [];
  for (let pulseCount = low; pulseCount <= high; pulseCount++) {
    const resolved = durationMs / pulseCount;
    const delta = Math.abs(resolved - targetIntervalMs);
    const inTolerance = delta <= toleranceMs + 1e-9;
    candidates.push({ pulseCount, resolved, delta, inTolerance });
  }

  candidates.sort((a, b) => {
    if (a.inTolerance !== b.inTolerance) return a.inTolerance ? -1 : 1;
    if (a.delta !== b.delta) return a.delta - b.delta;
    return Math.abs(a.pulseCount - ideal) - Math.abs(b.pulseCount - ideal);
  });

  const best = candidates[0]!;
  return {
    pulseCount: best.pulseCount,
    resolvedIntervalMs: best.resolved,
  };
}

/** Same target/tolerance as `useBreathingHaptics` / `app/breathing.tsx`. */
export const BREATHING_HAPTIC_TARGET_INTERVAL_MS = 800;
export const BREATHING_HAPTIC_TOLERANCE_MS = 50;

/**
 * Millisecond offsets from phase start when each haptic pulse fires — mirrors
 * `useBreathingHaptics.beginPhase` scheduling exactly.
 */
export function buildPhasePulseDelaysMs({
  durationMs,
  targetIntervalMs = BREATHING_HAPTIC_TARGET_INTERVAL_MS,
  toleranceMs = BREATHING_HAPTIC_TOLERANCE_MS,
  resumeMidPhase = false,
}: {
  durationMs: number;
  targetIntervalMs?: number;
  toleranceMs?: number;
  resumeMidPhase?: boolean;
}): number[] {
  const plan = resolvePhasePulsePlan({ durationMs, targetIntervalMs, toleranceMs });
  if (!(plan.resolvedIntervalMs > 0)) return [];

  const { pulseCount, resolvedIntervalMs } = plan;
  const delays: number[] = [];
  if (!resumeMidPhase) {
    delays.push(0);
    for (let k = 1; k < pulseCount; k++) {
      delays.push(k * resolvedIntervalMs);
    }
  } else {
    for (let k = 0; k < pulseCount; k++) {
      delays.push(k * resolvedIntervalMs);
    }
  }
  return delays;
}

/** How many pulses (and guide dots) have fired by `elapsedMs` into the phase. */
export function filledCountAtElapsedMs(delays: number[], elapsedMs: number): number {
  return delays.filter((d) => d <= elapsedMs + 1e-6).length;
}
