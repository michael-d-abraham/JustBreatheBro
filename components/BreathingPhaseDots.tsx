import { useBreathingAnimationTokens } from "@/components/Theme";
import type { BreathingPhase } from "@/hooks/useBreathingCycle";
import {
  BREATHING_HAPTIC_TARGET_INTERVAL_MS,
  BREATHING_HAPTIC_TOLERANCE_MS,
  buildPhasePulseDelaysMs,
  filledCountAtElapsedMs,
} from "@/lib/breathingHapticsResolve";
import {
  breathGuideDotCount,
  filledAfterExhalePulses,
  fullPhasePulseDelaysMs,
  phaseDurationSeconds,
  type BreathingPattern,
} from "@/lib/breathingPhaseDots";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

type Props = {
  phase: BreathingPhase;
  timeLeft: number;
  pattern: BreathingPattern;
  isRunning: boolean;
  isPaused: boolean;
};

/**
 * Guide dots for one breath stroke: fill on inhale, empty on exhale — same timing as haptics.
 */
export default function BreathingPhaseDots({
  phase,
  timeLeft,
  pattern,
  isRunning,
  isPaused,
}: Props) {
  const breathingAnim = useBreathingAnimationTokens();
  const inhaleDelays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.inhale),
    [pattern.inhale],
  );
  const exhaleDelays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.exhale),
    [pattern.exhale],
  );
  const dotCount = useMemo(() => breathGuideDotCount(pattern), [pattern]);
  const peakFilled = inhaleDelays.length;

  const [filled, setFilled] = useState(0);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const generationRef = useRef(0);

  const clearTimers = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  const scheduleAt = (gen: number, wait: number, apply: () => void) => {
    if (wait <= 0) {
      apply();
      return;
    }
    const id = setTimeout(() => {
      if (gen !== generationRef.current) return;
      apply();
    }, wait);
    timeoutIdsRef.current.push(id);
  };

  useLayoutEffect(() => {
    clearTimers();
    generationRef.current += 1;

    if (phase === "idle" || !isRunning || dotCount === 0) {
      setFilled(0);
      return;
    }

    if (isPaused || phase === "hold1" || phase === "hold2") {
      return;
    }

    const gen = generationRef.current;
    const phaseSec = phaseDurationSeconds(phase, pattern);
    const delays = phase === "inhale" ? inhaleDelays : exhaleDelays;
    if (delays.length === 0) return;

    const elapsedMs = Math.max(0, (phaseSec - timeLeftRef.current) * 1000);
    const pulsesSoFar = filledCountAtElapsedMs(delays, elapsedMs);
    const resumeMidPhase = elapsedMs > 50;
    const remainingMs = timeLeftRef.current * 1000;

    if (phase === "inhale") {
      setFilled(Math.min(pulsesSoFar, peakFilled));

      const scheduleFill = (targetFilled: number, wait: number) => {
        scheduleAt(gen, wait, () => setFilled(Math.min(targetFilled, peakFilled)));
      };

      if (resumeMidPhase && remainingMs > 0) {
        const alreadyFilled = Math.min(pulsesSoFar, peakFilled);
        const resumeDelays = buildPhasePulseDelaysMs({
          durationMs: remainingMs,
          targetIntervalMs: BREATHING_HAPTIC_TARGET_INTERVAL_MS,
          toleranceMs: BREATHING_HAPTIC_TOLERANCE_MS,
          resumeMidPhase: true,
        });
        resumeDelays.forEach((delay, i) => {
          const nextFilled = alreadyFilled + i + 1;
          if (nextFilled > peakFilled) return;
          scheduleFill(nextFilled, delay);
        });
      } else {
        delays.forEach((delay, index) => {
          if (delay < elapsedMs - 1) return;
          const target = index + 1;
          if (target > peakFilled) return;
          scheduleFill(target, delay - elapsedMs);
        });
      }
    } else if (phase === "exhale") {
      setFilled(filledAfterExhalePulses(peakFilled, pulsesSoFar));

      const scheduleEmpty = (pulsesAfterBeat: number, wait: number) => {
        scheduleAt(gen, wait, () =>
          setFilled(filledAfterExhalePulses(peakFilled, pulsesAfterBeat)),
        );
      };

      if (resumeMidPhase && remainingMs > 0) {
        const resumeDelays = buildPhasePulseDelaysMs({
          durationMs: remainingMs,
          targetIntervalMs: BREATHING_HAPTIC_TARGET_INTERVAL_MS,
          toleranceMs: BREATHING_HAPTIC_TOLERANCE_MS,
          resumeMidPhase: true,
        });
        resumeDelays.forEach((delay, i) => {
          scheduleEmpty(pulsesSoFar + i + 1, delay);
        });
      } else {
        delays.forEach((delay, index) => {
          if (delay < elapsedMs - 1) return;
          scheduleEmpty(index + 1, delay - elapsedMs);
        });
      }
    }

    return clearTimers;
  }, [
    phase,
    isRunning,
    isPaused,
    pattern,
    dotCount,
    peakFilled,
    inhaleDelays,
    exhaleDelays,
  ]);

  const dotSize = dotCount > 10 ? 8 : dotCount > 7 ? 10 : 12;
  const gap = dotCount > 10 ? 6 : 8;

  const dots = useMemo(() => {
    if (dotCount === 0 || phase === "idle") return null;
    return Array.from({ length: dotCount }, (_, i) => {
      const active = i < filled;
      return (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            borderWidth: 1.5,
            borderColor: breathingAnim.mainStroke,
            backgroundColor: active ? breathingAnim.mainFill : "transparent",
            opacity: active ? 0.95 : 0.45,
          }}
        />
      );
    });
  }, [breathingAnim.mainFill, breathingAnim.mainStroke, dotCount, dotSize, filled, phase]);

  if (!dots) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap,
        maxWidth: 320,
        marginBottom: 12,
        minHeight: dotSize,
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: dotCount,
        now: filled,
        text: `${filled} of ${dotCount} breath beats`,
      }}
    >
      {dots}
    </View>
  );
}
