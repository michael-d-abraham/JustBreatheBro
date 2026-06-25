import { useEffect, useRef, useState } from "react";

interface BreathingExercise {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

interface UseBreathingCycleProps {
  exercise: BreathingExercise;
  onPhaseChange?: (phase: BreathingPhase, duration: number) => void;
  onCycleStart?: () => void;
}

export type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

/**
 * Hook to manage breathing cycle state machine
 * Orchestrates the breathing cycle loop and phase transitions
 */
export function useBreathingCycle({ exercise, onPhaseChange, onCycleStart }: UseBreathingCycleProps) {
  const { inhale, hold1, exhale, hold2 } = exercise;
  
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const cyclePromiseRef = useRef<Promise<void> | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const phaseDurationRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  const currentPhaseRef = useRef<BreathingPhase>('idle');

  // runCycle is re-entrant (loop-back + resume re-enter mid-cycle), so this ref can
  // legitimately already hold any phase at the checks below. Read it through this
  // accessor so control-flow narrowing from the assignments doesn't make the
  // comparisons look unreachable (TS2367). Runtime value is identical to the ref.
  const readPhase = (): BreathingPhase => currentPhaseRef.current;

  // Timer countdown
  useEffect(() => {
    if (!isRunning || isPaused || timeLeft <= 0) return;
    
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, isPaused, timeLeft]);

  const sleep = (ms: number) => {
    return new Promise<void>(resolve => {
      let startTime = Date.now();
      let totalElapsed = 0;
      let wasPaused = false;
      
      const checkInterval = setInterval(() => {
        if (isPausedRef.current) {
          // When paused, track elapsed time so far
          if (!wasPaused) {
            totalElapsed += Date.now() - startTime;
            wasPaused = true;
          }
          // Don't resolve, just wait
          return;
        }
        
        // When not paused (or just resumed)
        if (wasPaused) {
          // We just resumed, restart the timer with remaining time
          startTime = Date.now();
          wasPaused = false;
          const remaining = ms - totalElapsed;
          if (remaining <= 0) {
            clearInterval(checkInterval);
            resolve();
            return;
          }
        }
        
        // Check if we've completed the sleep
        const elapsed = Date.now() - startTime;
        if (totalElapsed + elapsed >= ms) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10); // Check every 10ms for more accurate pausing
    });
  };

  const runCycle = async () => {
    // Notify cycle start only if starting fresh (not resuming from pause)
    const wasPaused = isPausedRef.current;
    if (!wasPaused) {
      onCycleStart?.();
    }
    
    // Inhale phase - only set if starting fresh
    if (readPhase() !== 'inhale') {
      setPhase('inhale');
      currentPhaseRef.current = 'inhale';
      setTimeLeft(inhale);
      onPhaseChange?.('inhale', inhale * 1000);
    }
    await sleep(inhale * 1000);
    
    if (!isRunningRef.current) return;

    // Hold 1 phase - only set if we're transitioning to it
    if (readPhase() !== 'hold1') {
      setPhase('hold1');
      currentPhaseRef.current = 'hold1';
      setTimeLeft(hold1);
      onPhaseChange?.('hold1', hold1 * 1000);
    }
    await sleep(hold1 * 1000);
    
    if (!isRunningRef.current) return;

    // Exhale phase
    if (readPhase() !== 'exhale') {
      setPhase('exhale');
      currentPhaseRef.current = 'exhale';
      setTimeLeft(exhale);
      onPhaseChange?.('exhale', exhale * 1000);
    }
    await sleep(exhale * 1000);
    
    if (!isRunningRef.current) return;

    // Hold 2 phase
    if (readPhase() !== 'hold2') {
      setPhase('hold2');
      currentPhaseRef.current = 'hold2';
      setTimeLeft(hold2);
      onPhaseChange?.('hold2', hold2 * 1000);
    }
    await sleep(hold2 * 1000);
    
    // Loop if still running
    if (isRunningRef.current) {
      runCycle();
    }
  };

  const start = () => {
    // If paused, resume from where we left off
    if (isPausedRef.current) {
      resume();
      return;
    }
    
    // Prevent multiple concurrent cycles
    if (isRunningRef.current) return;
    
    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;
    cyclePromiseRef.current = runCycle();
  };

  const pause = () => {
    if (!isRunningRef.current || isPausedRef.current) return;
    
    setIsPaused(true);
    isPausedRef.current = true;
    setIsRunning(false);
    // Keep isRunningRef.current true so we can resume
  };

  const resume = () => {
    if (!isPausedRef.current) return;
    
    setIsPaused(false);
    isPausedRef.current = false;
    setIsRunning(true);
    isRunningRef.current = true;
    
    // The sleep() function will automatically continue when isPausedRef becomes false
    // The cycle is still running (isRunningRef was kept true), so it will continue
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
    setPhase('idle');
    currentPhaseRef.current = 'idle';
    setTimeLeft(0);
    remainingTimeRef.current = 0;
    cyclePromiseRef.current = null;
  };

  return { 
    phase, 
    timeLeft, 
    isRunning,
    isPaused,
    start, 
    pause,
    resume,
    stop 
  };
}

