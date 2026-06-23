/// <reference path="./react-test-renderer.d.ts" />
/**
 * Behavioral tests for useBreathingHaptics.
 *
 * expo-haptics is a native module — impactAsync is mocked with a jest.fn().
 * Jest fake timers drive the setTimeout-based pulse scheduling inside the hook.
 *
 * The hook uses two mechanisms to prevent stale pulses:
 *   1. clearTimeout() on all pending IDs when beginPhase/cancel is called.
 *   2. A generation ref checked inside each scheduled callback (belt-and-suspenders).
 *
 * Covers:
 *   single trigger    — transition accent fires once synchronously; scheduled pulses
 *                       fire exactly once each; resumeMidPhase schedules all pulses
 *                       (no synchronous call); disabled haptics and guard conditions
 *                       produce zero calls.
 *   no duplicate      — stale schedule is cancelled when beginPhase is called again;
 *   pulses              two back-to-back beginPhase calls do not accumulate schedules.
 *   cancel            — cancel() clears all pending pulses; is idempotent; safe before
 *                       beginPhase.
 *   cleanup behavior  — unmount cancels pending schedule; toggling hapticsEnabled to
 *                       false cancels mid-phase; hook with no beginPhase fires nothing.
 */

import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import {
  BeginBreathingPhaseHapticsArgs,
  useBreathingHaptics,
} from "@/hooks/useBreathingHaptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "Light",
    Medium: "Medium",
    Heavy: "Heavy",
    Rigid: "Rigid",
    Soft: "Soft",
  },
}));

// eslint-disable-next-line import/order
import * as Haptics from "expo-haptics";

const mockImpactAsync = jest.mocked(Haptics.impactAsync);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// ── Render helper ─────────────────────────────────────────────────────────────

type HapticsProps = { hapticsEnabled: boolean };

function renderHapticsHook(initialProps: HapticsProps) {
  const result: { current: ReturnType<typeof useBreathingHaptics> } = {
    current: undefined as unknown as ReturnType<typeof useBreathingHaptics>,
  };
  let props = initialProps;

  function Harness() {
    result.current = useBreathingHaptics(props);
    return null;
  }

  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(createElement(Harness));
  });

  return {
    result,
    rerender(next: HapticsProps) {
      props = next;
      act(() => {
        renderer.update(createElement(Harness));
      });
    },
    unmount() {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

// ── Phase fixtures ────────────────────────────────────────────────────────────
//
// PHASE_4S → resolvePhasePulsePlan gives pulseCount=4, resolvedIntervalMs=1000
//   resumeMidPhase=false: transition Heavy at t=0 (sync), Light pulses at +1000/+2000/+3000
//   resumeMidPhase=true:  Light pulses at +0/+1000/+2000/+3000 (all via setTimeout)
//
// PHASE_2S → pulseCount=2, resolvedIntervalMs=1000
//   resumeMidPhase=false: transition Heavy at t=0 (sync), Light pulse at +1000

const PHASE_4S: BeginBreathingPhaseHapticsArgs = {
  durationMs: 4000,
  targetIntervalMs: 1000,
  toleranceMs: 50,
  pulseIntensity: Haptics.ImpactFeedbackStyle.Light,
  transitionIntensity: Haptics.ImpactFeedbackStyle.Heavy,
};

const PHASE_2S: BeginBreathingPhaseHapticsArgs = {
  durationMs: 2000,
  targetIntervalMs: 1000,
  toleranceMs: 50,
  pulseIntensity: Haptics.ImpactFeedbackStyle.Light,
  transitionIntensity: Haptics.ImpactFeedbackStyle.Heavy,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useBreathingHaptics", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ── Single trigger ──────────────────────────────────────────────────────────

  describe("single trigger", () => {
    it("fires the transition accent synchronously before any timer advances", () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });

      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );

      unmount();
    });

    it("fires each subsequent pulse exactly once at each resolvedIntervalMs tick", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });

      expect(mockImpactAsync).toHaveBeenCalledTimes(1); // transition only

      await advance(1000);
      expect(mockImpactAsync).toHaveBeenCalledTimes(2);

      await advance(1000);
      expect(mockImpactAsync).toHaveBeenCalledTimes(3);

      await advance(1000);
      expect(mockImpactAsync).toHaveBeenCalledTimes(4); // last pulse

      // First call is the Heavy transition accent; the rest are Light pulses.
      const calls = mockImpactAsync.mock.calls;
      expect(calls[0][0]).toBe(Haptics.ImpactFeedbackStyle.Heavy);
      expect(calls[1][0]).toBe(Haptics.ImpactFeedbackStyle.Light);
      expect(calls[2][0]).toBe(Haptics.ImpactFeedbackStyle.Light);
      expect(calls[3][0]).toBe(Haptics.ImpactFeedbackStyle.Light);

      unmount();
    });

    it("fires no haptics when hapticsEnabled is false", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: false });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });
      await advance(4000);

      expect(mockImpactAsync).not.toHaveBeenCalled();

      unmount();
    });

    it("fires no haptics when durationMs is 0 (early-return guard)", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase({ ...PHASE_4S, durationMs: 0 });
      });
      await advance(4000);

      expect(mockImpactAsync).not.toHaveBeenCalled();

      unmount();
    });

    it("fires no haptics when targetIntervalMs is 0 (resolvedIntervalMs guard)", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase({ ...PHASE_4S, targetIntervalMs: 0 });
      });
      await advance(4000);

      expect(mockImpactAsync).not.toHaveBeenCalled();

      unmount();
    });

    it("resumeMidPhase: schedules all pulses via setTimeout with no synchronous transition accent", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase({ ...PHASE_4S, resumeMidPhase: true });
      });

      // k=0 is scheduled with delay=0 (not called synchronously).
      expect(mockImpactAsync).not.toHaveBeenCalled();

      // Advancing 1ms fires the delay=0 timeout.
      await advance(1);
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );

      // Remaining 3 pulses fire at +1000, +2000, +3000.
      await advance(3000);
      expect(mockImpactAsync).toHaveBeenCalledTimes(4);

      // All 4 calls use pulseIntensity (Light) — none use transitionIntensity (Heavy).
      mockImpactAsync.mock.calls.forEach((call) => {
        expect(call[0]).toBe(Haptics.ImpactFeedbackStyle.Light);
      });

      unmount();
    });
  });

  // ── No duplicate pulses ─────────────────────────────────────────────────────

  describe("no duplicate pulses", () => {
    it("calling beginPhase again cancels stale scheduled pulses from the previous phase", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      // Phase A: transition fires + 3 pulses queued at +1000, +2000, +3000.
      act(() => {
        result.current.beginPhase(PHASE_4S);
      });

      await advance(500); // midway; no queued pulse from A has fired yet

      // Phase B: clears phase A's 3 queued timeouts, fires its own transition.
      act(() => {
        result.current.beginPhase(PHASE_2S);
      });

      // Advance well past phase A's original end.
      await advance(4000);

      // 1 (A transition) + 1 (B transition) + 1 (B pulse at +1000ms) = 3 total.
      // Phase A's 3 queued pulses never fired.
      expect(mockImpactAsync).toHaveBeenCalledTimes(3);

      unmount();
    });

    it("two consecutive beginPhase calls in the same act do not accumulate the first schedule", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S); // transition + 3 scheduled
        result.current.beginPhase(PHASE_4S); // clears first; transition + 3 scheduled
      });

      // Both transitions fired synchronously.
      expect(mockImpactAsync).toHaveBeenCalledTimes(2);

      await advance(4000);

      // Only 3 pulses from the second call fire; the first schedule was cleared.
      // Total: 2 transitions + 3 pulses = 5 (not 2 + 3 + 3 = 8).
      expect(mockImpactAsync).toHaveBeenCalledTimes(5);

      unmount();
    });
  });

  // ── Cancel ──────────────────────────────────────────────────────────────────

  describe("cancel", () => {
    it("stops all pending pulses; none fire after cancel is called", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });
      // 1 call so far (synchronous transition).

      act(() => {
        result.current.cancel();
      });

      await advance(5000);

      // Only the synchronous transition call; the 3 queued pulses were cancelled.
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("is idempotent — calling cancel multiple times does not throw", () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });

      expect(() => {
        act(() => {
          result.current.cancel();
          result.current.cancel();
          result.current.cancel();
        });
      }).not.toThrow();

      unmount();
    });

    it("is safe to call cancel before any beginPhase", () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      expect(() => {
        act(() => {
          result.current.cancel();
        });
      }).not.toThrow();

      expect(mockImpactAsync).not.toHaveBeenCalled();

      unmount();
    });
  });

  // ── Cleanup behavior ────────────────────────────────────────────────────────

  describe("cleanup behavior", () => {
    it("cancels all pending pulses on unmount", async () => {
      const { result, unmount } = renderHapticsHook({ hapticsEnabled: true });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });
      // 1 call so far (synchronous transition).

      unmount();
      await advance(5000);

      // The 3 queued pulses did not fire after unmount.
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    });

    it("cancels pending pulses when hapticsEnabled toggles to false mid-phase", async () => {
      const { result, rerender, unmount } = renderHapticsHook({
        hapticsEnabled: true,
      });

      act(() => {
        result.current.beginPhase(PHASE_4S);
      });
      // 1 call so far (synchronous transition).

      // The useEffect watching hapticsEnabled calls cancel() on the next render.
      rerender({ hapticsEnabled: false });

      await advance(5000);

      // Only the one transition fired before the toggle; no scheduled pulses fired.
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("fires nothing if beginPhase is never called before unmount", () => {
      const { unmount } = renderHapticsHook({ hapticsEnabled: true });
      unmount();
      expect(mockImpactAsync).not.toHaveBeenCalled();
    });
  });
});
