/**
 * Behavioral tests for useBreathingCycle.
 *
 * The hook is rendered with react-test-renderer and driven by Jest fake timers.
 * Jest's modern fake timers also mock Date.now(), which the hook's sleep() reads,
 * so advancing timers advances the clock the state machine measures against.
 * jest.advanceTimersByTimeAsync fires the 10ms sleep() interval ticks AND flushes
 * the `await sleep()` microtask chain in runCycle, stepping the machine phase by phase.
 *
 * Covers: phase transitions, pause, resume, stop, and idempotent start.
 */

/// <reference path="./react-test-renderer.d.ts" />
import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import { BreathingPhase, useBreathingCycle } from "@/hooks/useBreathingCycle";

// Tell React 19 this is an act() environment so state updates flush correctly
// and the "not configured to support act(...)" warning is suppressed.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function renderHook<T>(useHook: () => T) {
  const result: { current: T } = { current: undefined as unknown as T };

  function Harness() {
    result.current = useHook();
    return null;
  }

  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(createElement(Harness));
  });

  return {
    result,
    unmount: () =>
      act(() => {
        renderer.unmount();
      }),
  };
}

/** Advance fake timers by `ms`, flushing the hook's async sleep() chain. */
async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

describe("useBreathingCycle", () => {
  // inhale 2s, hold1 1s, exhale 2s, hold2 1s.
  const exercise = { inhale: 2, hold1: 1, exhale: 2, hold2: 1 };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("phase transitions", () => {
    it("runs inhale -> hold1 -> exhale -> hold2 with correct durations", async () => {
      const onPhaseChange = jest.fn<void, [BreathingPhase, number]>();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onPhaseChange })
      );

      act(() => {
        result.current.start();
      });

      // Inhale fires synchronously on start.
      expect(result.current.phase).toBe("inhale");
      expect(onPhaseChange).toHaveBeenNthCalledWith(1, "inhale", 2000);

      await advance(2000); // finish inhale -> hold1
      expect(result.current.phase).toBe("hold1");
      expect(onPhaseChange).toHaveBeenNthCalledWith(2, "hold1", 1000);

      await advance(1000); // finish hold1 -> exhale
      expect(result.current.phase).toBe("exhale");
      expect(onPhaseChange).toHaveBeenNthCalledWith(3, "exhale", 2000);

      await advance(2000); // finish exhale -> hold2
      expect(result.current.phase).toBe("hold2");
      expect(onPhaseChange).toHaveBeenNthCalledWith(4, "hold2", 1000);

      unmount();
    });

    it("loops back to inhale after a full cycle", async () => {
      const onPhaseChange = jest.fn<void, [BreathingPhase, number]>();
      const onCycleStart = jest.fn();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onPhaseChange, onCycleStart })
      );

      act(() => {
        result.current.start();
      });

      // Advance through the entire first cycle (2 + 1 + 2 + 1 = 6s).
      await advance(6000);

      expect(result.current.phase).toBe("inhale");
      // First call of cycle 1 + first call of cycle 2 = 5 phase changes total.
      expect(onPhaseChange.mock.calls.map((c) => c[0])).toEqual([
        "inhale",
        "hold1",
        "exhale",
        "hold2",
        "inhale",
      ]);
      // onCycleStart fires once per full cycle: start + loop-back = 2.
      expect(onCycleStart).toHaveBeenCalledTimes(2);

      unmount();
    });
  });

  describe("pause", () => {
    it("freezes phase and stops emitting transitions while paused", async () => {
      const onPhaseChange = jest.fn<void, [BreathingPhase, number]>();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onPhaseChange })
      );

      act(() => {
        result.current.start();
      });

      await advance(1000); // 1s into the 2s inhale
      expect(result.current.phase).toBe("inhale");

      act(() => {
        result.current.pause();
      });
      expect(result.current.isPaused).toBe(true);
      expect(result.current.isRunning).toBe(false);

      const callsAtPause = onPhaseChange.mock.calls.length;

      // Even far beyond the full cycle length, nothing advances while paused.
      await advance(5000);

      expect(result.current.phase).toBe("inhale");
      expect(onPhaseChange.mock.calls.length).toBe(callsAtPause);

      unmount();
    });
  });

  describe("resume", () => {
    it("continues the same phase without re-triggering its cue", async () => {
      const onPhaseChange = jest.fn<void, [BreathingPhase, number]>();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onPhaseChange })
      );

      act(() => {
        result.current.start();
      });

      await advance(1000); // 1s into the 2s inhale
      act(() => {
        result.current.pause();
      });

      const inhaleCallsBeforeResume = onPhaseChange.mock.calls.filter(
        (c) => c[0] === "inhale"
      ).length;
      expect(inhaleCallsBeforeResume).toBe(1);

      act(() => {
        result.current.resume();
      });
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isRunning).toBe(true);
      // Resume must not re-fire the inhale cue.
      expect(
        onPhaseChange.mock.calls.filter((c) => c[0] === "inhale").length
      ).toBe(1);
      // Still in the same phase right after resume.
      expect(result.current.phase).toBe("inhale");

      // Remaining ~1s of inhale, then it advances to hold1.
      await advance(1000);
      expect(result.current.phase).toBe("hold1");
      // inhale was emitted exactly once across the whole pause/resume.
      expect(
        onPhaseChange.mock.calls.filter((c) => c[0] === "inhale").length
      ).toBe(1);

      unmount();
    });
  });

  describe("stop", () => {
    it("resets to idle and emits no further transitions", async () => {
      const onPhaseChange = jest.fn<void, [BreathingPhase, number]>();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onPhaseChange })
      );

      act(() => {
        result.current.start();
      });
      await advance(1000); // mid-inhale

      act(() => {
        result.current.stop();
      });

      expect(result.current.phase).toBe("idle");
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.timeLeft).toBe(0);

      const callsAtStop = onPhaseChange.mock.calls.length;
      await advance(6000); // a full cycle's worth of time
      expect(onPhaseChange.mock.calls.length).toBe(callsAtStop);
      expect(result.current.phase).toBe("idle");

      unmount();
    });

    it("is idempotent when called repeatedly", async () => {
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise })
      );

      act(() => {
        result.current.start();
      });
      await advance(500);

      expect(() => {
        act(() => {
          result.current.stop();
          result.current.stop();
        });
      }).not.toThrow();

      expect(result.current.phase).toBe("idle");
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);

      unmount();
    });
  });

  describe("start", () => {
    it("is idempotent within a cycle (does not start a second concurrent cycle)", async () => {
      const onCycleStart = jest.fn();
      const { result, unmount } = renderHook(() =>
        useBreathingCycle({ exercise, onCycleStart })
      );

      act(() => {
        result.current.start();
        result.current.start();
      });

      // Stay within the first cycle (< 6s) so the loop-back does not re-fire.
      await advance(3000);

      expect(onCycleStart).toHaveBeenCalledTimes(1);

      unmount();
    });
  });
});
