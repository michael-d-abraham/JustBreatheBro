import { cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";

/**
 * Hook to manage breathing animation using Reanimated
 * Handles radius and strokeWidth shared values and timing
 */
export function useBreathingAnimation() {
  const radius = useSharedValue(66);
  const strokeWidth = useSharedValue(3);

  const animateInhale = (duration: number) => {
    radius.value = withTiming(179, { duration });
    strokeWidth.value = withTiming(6, { duration });
  };

  const animateExhale = (duration: number) => {
    radius.value = withTiming(66, { duration });
    strokeWidth.value = withTiming(3, { duration });
  };

  const RADIUS_MIN = 66;
  const RADIUS_MAX = 179;
  const STROKE_MIN = 3;
  const STROKE_MAX = 6;

  /**
   * Snap the ring to a position within the current phase without animation.
   * `elapsedRatio` is fraction of the current phase elapsed [0, 1] (0 = phase start, 1 = phase end).
   */
  const seekToPhaseProgress = (
    phase: "inhale" | "exhale" | "hold1" | "hold2",
    elapsedRatio: number
  ) => {
    cancelAnimation(radius);
    cancelAnimation(strokeWidth);
    const t = Math.min(1, Math.max(0, elapsedRatio));
    if (phase === "inhale") {
      radius.value = RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * t;
      strokeWidth.value = STROKE_MIN + (STROKE_MAX - STROKE_MIN) * t;
    } else if (phase === "exhale") {
      radius.value = RADIUS_MAX - (RADIUS_MAX - RADIUS_MIN) * t;
      strokeWidth.value = STROKE_MAX - (STROKE_MAX - STROKE_MIN) * t;
    } else if (phase === "hold1") {
      radius.value = RADIUS_MAX;
      strokeWidth.value = STROKE_MAX;
    } else {
      radius.value = RADIUS_MIN;
      strokeWidth.value = STROKE_MIN;
    }
  };

  const pause = () => {
    // Cancel any ongoing animations and freeze at current position
    cancelAnimation(radius);
    cancelAnimation(strokeWidth);
  };

  const resume = (phase: 'inhale' | 'exhale' | 'hold1' | 'hold2', remainingDuration: number) => {
    // Resume animation from current position to target for current phase
    if (phase === 'inhale') {
      // Continue expanding to inhale target
      radius.value = withTiming(179, { duration: remainingDuration });
      strokeWidth.value = withTiming(6, { duration: remainingDuration });
    } else if (phase === 'exhale') {
      // Continue contracting to exhale target
      radius.value = withTiming(66, { duration: remainingDuration });
      strokeWidth.value = withTiming(3, { duration: remainingDuration });
    }
    // For hold phases, animation stays at current position (no animation needed)
  };

  const reset = () => {
    // Cancel animations first, then reset
    cancelAnimation(radius);
    cancelAnimation(strokeWidth);
    radius.value = 66;
    strokeWidth.value = 3;
  };

  return { 
    radius, 
    strokeWidth, 
    animateInhale, 
    animateExhale, 
    seekToPhaseProgress,
    pause,
    resume,
    reset 
  };
}

