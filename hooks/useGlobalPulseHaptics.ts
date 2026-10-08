import type { PulseEvent } from "@/lib/globalPresenceState";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";

/**
 * Pulses that arrive closer together than this share one tap. Several people pulsing in the same
 * moment should feel like one soft touch, not a buzz. Each pulse still gets its own visual ripple.
 */
export const PULSE_HAPTIC_COALESCE_MS = 350;

type Options = {
  /** `settings.hapticsEnabled` — the user's global haptics preference. */
  hapticsEnabled: boolean;
};

/**
 * Haptic side of the Global Room: ONE soft impact when someone else's pulse arrives.
 *
 * Deliberately not built on `useBreathingHaptics` (a phase-quantized pattern scheduler): a pulse is
 * a single event, so there is no pattern, no timer, and nothing to cancel or tear down.
 *
 *  - Your own pulse never taps you: you already felt your finger, and the ripple confirms it.
 *  - Disabled haptics, or hardware/OS without a haptic engine, silently degrade to the
 *    visual-only ripple (`impactAsync` can throw synchronously or reject; both are swallowed).
 *  - Overlapping pulses are coalesced into a single tap (see PULSE_HAPTIC_COALESCE_MS).
 *
 * Returns `playPulseHaptic(pulse)`, which reports whether a tap was actually requested.
 */
export function useGlobalPulseHaptics({ hapticsEnabled }: Options) {
  // Read through a ref so the callback stays stable and always sees the latest preference.
  const enabledRef = useRef(hapticsEnabled);
  enabledRef.current = hapticsEnabled;
  const lastTapAtRef = useRef(0);

  const playPulseHaptic = useCallback((pulse: PulseEvent): boolean => {
    if (!enabledRef.current || pulse.isSelf) return false;

    const now = Date.now();
    if (now - lastTapAtRef.current < PULSE_HAPTIC_COALESCE_MS) return false;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {
        // No haptic engine / OS refused: the ripple is the whole experience.
      });
      lastTapAtRef.current = now;
      return true;
    } catch {
      return false;
    }
  }, []);

  return { playPulseHaptic };
}
