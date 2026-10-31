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
  mainStroke: string;
  mainFill: string;
};

/** How long each hold beat stays visually bright (purely cosmetic). */
const HOLD_FLASH_MS = 140;

/**
 * Guide dots for one breath stroke: fill on inhale, empty on exhale, pulse on hold —
 * same beat schedule as haptics (no separate counter).
 */
export default function BreathingPhaseDots({
  phase,
  timeLeft,
  pattern,
  isRunning,
  isPaused,
  mainStroke,
  mainFill,
}: Props) {
  const inhaleDelays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.inhale),
    [pattern.inhale],
  );
  const exhaleDelays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.exhale),
    [pattern.exhale],
  );
  const hold1Delays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.hold1),
    [pattern.hold1],
  );
  const hold2Delays = useMemo(
    () => fullPhasePulseDelaysMs(pattern.hold2),
    [pattern.hold2],
  );
  const dotCount = useMemo(() => breathGuideDotCount(pattern), [pattern]);
  const peakFilled = inhaleDelays.length;

  const [filled, setFilled] = useState(0);
  const [holdFlash, setHoldFlash] = useState(false);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const generationRef = useRef(0);

  const clearTimers = () => {
    const ids = timeoutIdsRef.current;
    if (ids) {
      ids.forEach(clearTimeout);
    }
    timeoutIdsRef.current = [];
  };

  const scheduleAt = (gen: number, wait: number, apply: () => void) => {
    const delayMs = Math.max(0, wait);
    const id = setTimeout(() => {
      if (gen !== generationRef.current) return;
      apply();
    }, delayMs);
    timeoutIdsRef.current.push(id);
  };

  useLayoutEffect(() => {
    clearTimers();
    generationRef.current += 1;

    if (phase === "idle" || !isRunning || dotCount === 0) {
      setFilled(0);
      setHoldFlash(false);
      return;
    }

    if (isPaused) {
      return;
    }

    const gen = generationRef.current;
    const phaseSec = phaseDurationSeconds(phase, pattern);

    const flashHoldBeat = () => {
      setHoldFlash(true);
      scheduleAt(gen, HOLD_FLASH_MS, () => setHoldFlash(false));
    };

    if (phase === "hold1" || phase === "hold2") {
      setHoldFlash(false);
      setFilled(phase === "hold1" ? peakFilled : 0);

      const delays = phase === "hold1" ? hold1Delays : hold2Delays;
      if (delays.length === 0 || phaseSec <= 0) {
        return clearTimers;
      }

      const elapsedMs = Math.max(0, (phaseSec - timeLeftRef.current) * 1000);
      const resumeMidPhase = elapsedMs > 50;
      const remainingMs = timeLeftRef.current * 1000;

      if (resumeMidPhase && remainingMs > 0) {
        const resumeDelays = buildPhasePulseDelaysMs({
          durationMs: remainingMs,
          targetIntervalMs: BREATHING_HAPTIC_TARGET_INTERVAL_MS,
          toleranceMs: BREATHING_HAPTIC_TOLERANCE_MS,
          resumeMidPhase: true,
        });
        (resumeDelays ?? []).forEach((delay) => {
          scheduleAt(gen, delay, flashHoldBeat);
        });
      } else {
        (delays ?? []).forEach((delay) => {
          if (delay < elapsedMs - 1) return;
          scheduleAt(gen, delay - elapsedMs, flashHoldBeat);
        });
      }

      return clearTimers;
    }

    setHoldFlash(false);
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
    hold1Delays,
    hold2Delays,
  ]);

  const dotSize = dotCount > 10 ? 8 : dotCount > 7 ? 10 : 12;
  const gap = dotCount > 10 ? 6 : 8;

  const dots = useMemo(() => {
    if (!Number.isFinite(dotCount) || dotCount <= 0 || phase === "idle") {
      return null;
    }
    const onHold = phase === "hold1" || phase === "hold2";
    const pulseScale = holdFlash && onHold ? 1.06 : 1;
    return Array.from({ length: dotCount }, (_, i) => {
      const active = i < filled;
      const filledOpacity = holdFlash && onHold ? 1 : 0.95;
      const emptyOpacity = holdFlash && onHold ? 0.82 : 0.45;
      return (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            borderWidth: 1.5,
            borderColor: mainStroke,
            backgroundColor: active ? mainFill : "transparent",
            opacity: active ? filledOpacity : emptyOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
      );
    });
  }, [
    dotCount,
    dotSize,
    filled,
    holdFlash,
    mainFill,
    mainStroke,
    phase,
  ]);

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
        text:
          phase === "hold1" || phase === "hold2"
            ? `Hold — ${filled} of ${dotCount} dots`
            : `${filled} of ${dotCount} breath beats`,
      }}
    >
      {dots}
    </View>
  );
}
