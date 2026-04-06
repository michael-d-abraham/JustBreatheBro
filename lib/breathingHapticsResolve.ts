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
