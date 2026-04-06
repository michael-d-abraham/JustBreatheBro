import { resolvePhasePulsePlan } from "@/lib/breathingHapticsResolve";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";

const DEFAULT_TOLERANCE_MS = 50;

export type BeginBreathingPhaseHapticsArgs = {
  durationMs: number;
  targetIntervalMs: number;
  toleranceMs?: number;
  pulseIntensity: Haptics.ImpactFeedbackStyle;
  transitionIntensity: Haptics.ImpactFeedbackStyle;
  /**
   * When true (mid-phase resume), all scheduled beats use pulseIntensity — no transition accent.
   */
  resumeMidPhase?: boolean;
};

interface UseBreathingHapticsProps {
  hapticsEnabled: boolean;
}

/**
 * Phase-quantized haptics: pulses divide each phase evenly; transition accent at phase start
 * (unless resumeMidPhase). One active schedule at a time; cancel is idempotent.
 */
export function useBreathingHaptics({ hapticsEnabled }: UseBreathingHapticsProps) {
  const generationRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  }, []);

  const cancel = useCallback(() => {
    generationRef.current += 1;
    clearTimeouts();
  }, [clearTimeouts]);

  const beginPhase = useCallback(
    (args: BeginBreathingPhaseHapticsArgs) => {
      clearTimeouts();
      generationRef.current += 1;
      const gen = generationRef.current;

      if (!hapticsEnabled) return;

      const {
        durationMs,
        targetIntervalMs,
        toleranceMs = DEFAULT_TOLERANCE_MS,
        pulseIntensity,
        transitionIntensity,
        resumeMidPhase = false,
      } = args;

      if (!(durationMs > 0)) return;

      const plan = resolvePhasePulsePlan({
        durationMs,
        targetIntervalMs,
        toleranceMs,
      });

      if (!(plan.resolvedIntervalMs > 0)) return;

      const schedulePulse = (delayMs: number, style: Haptics.ImpactFeedbackStyle) => {
        const id = setTimeout(() => {
          if (gen !== generationRef.current) return;
          void Haptics.impactAsync(style);
        }, delayMs);
        timeoutIdsRef.current.push(id);
      };

      if (!resumeMidPhase) {
        void Haptics.impactAsync(transitionIntensity);
        for (let k = 1; k < plan.pulseCount; k++) {
          schedulePulse(k * plan.resolvedIntervalMs, pulseIntensity);
        }
      } else {
        for (let k = 0; k < plan.pulseCount; k++) {
          schedulePulse(k * plan.resolvedIntervalMs, pulseIntensity);
        }
      }
    },
    [hapticsEnabled, clearTimeouts],
  );

  useEffect(() => {
    if (!hapticsEnabled) {
      cancel();
    }
  }, [hapticsEnabled, cancel]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { beginPhase, cancel };
}
