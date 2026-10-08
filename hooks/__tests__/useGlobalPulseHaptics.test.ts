/// <reference path="./react-test-renderer.d.ts" />
/**
 * Behavioral tests for useGlobalPulseHaptics.
 *
 * expo-haptics is a native module — impactAsync is mocked. Date.now() is driven by Jest's modern
 * fake timers so the coalescing window is deterministic.
 *
 * Covers: one soft tap per incoming pulse, no tap for your own pulse, haptics disabled (and
 * toggled live), overlapping pulses coalescing, unavailable haptics (sync throw / rejected
 * promise), and a stable callback identity.
 */

import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import {
  PULSE_HAPTIC_COALESCE_MS,
  useGlobalPulseHaptics,
} from "@/hooks/useGlobalPulseHaptics";
import type { PulseEvent } from "@/lib/globalPresenceState";

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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let seq = 0;
const pulse = (overrides: Partial<PulseEvent> = {}): PulseEvent => ({
  seq: (seq += 1),
  id: "other",
  lat: 10,
  lon: 20,
  isSelf: false,
  atMs: Date.now(),
  ...overrides,
});

function renderHaptics(initial: { hapticsEnabled: boolean }) {
  const result: { current: ReturnType<typeof useGlobalPulseHaptics> } = {
    current: undefined as unknown as ReturnType<typeof useGlobalPulseHaptics>,
  };
  let props = initial;

  function Harness() {
    result.current = useGlobalPulseHaptics(props);
    return null;
  }

  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(createElement(Harness));
  });

  return {
    result,
    setProps(next: { hapticsEnabled: boolean }) {
      props = next;
      act(() => {
        renderer.update(createElement(Harness));
      });
    },
    unmount: () =>
      act(() => {
        renderer.unmount();
      }),
  };
}

describe("useGlobalPulseHaptics", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockImpactAsync.mockReset();
    mockImpactAsync.mockResolvedValue(undefined);
    seq = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("plays exactly one Soft impact for an incoming pulse", () => {
    const { result, unmount } = renderHaptics({ hapticsEnabled: true });

    let played = false;
    act(() => {
      played = result.current.playPulseHaptic(pulse());
    });

    expect(played).toBe(true);
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith("Soft");
    unmount();
  });

  it("does not tap you for your own pulse", () => {
    const { result, unmount } = renderHaptics({ hapticsEnabled: true });
    let played = true;
    act(() => {
      played = result.current.playPulseHaptic(pulse({ isSelf: true }));
    });
    expect(played).toBe(false);
    expect(mockImpactAsync).not.toHaveBeenCalled();
    unmount();
  });

  describe("user preference", () => {
    it("plays nothing when haptics are disabled", () => {
      const { result, unmount } = renderHaptics({ hapticsEnabled: false });
      let played = true;
      act(() => {
        played = result.current.playPulseHaptic(pulse());
      });
      expect(played).toBe(false);
      expect(mockImpactAsync).not.toHaveBeenCalled();
      unmount();
    });

    it("honours a preference change immediately, with the same callback", () => {
      const { result, setProps, unmount } = renderHaptics({ hapticsEnabled: true });
      const callback = result.current.playPulseHaptic;

      setProps({ hapticsEnabled: false });
      expect(result.current.playPulseHaptic).toBe(callback);
      act(() => {
        callback(pulse());
      });
      expect(mockImpactAsync).not.toHaveBeenCalled();

      setProps({ hapticsEnabled: true });
      act(() => {
        callback(pulse());
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      unmount();
    });
  });

  describe("overlapping pulses", () => {
    it("coalesces pulses inside the window into a single tap", () => {
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });
      act(() => {
        result.current.playPulseHaptic(pulse({ id: "a" }));
        result.current.playPulseHaptic(pulse({ id: "b" }));
        result.current.playPulseHaptic(pulse({ id: "c" }));
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      unmount();
    });

    it("taps again once the window has passed", () => {
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });
      act(() => {
        result.current.playPulseHaptic(pulse());
      });
      act(() => {
        jest.advanceTimersByTime(PULSE_HAPTIC_COALESCE_MS - 1);
      });
      act(() => {
        result.current.playPulseHaptic(pulse());
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(2);
      });
      act(() => {
        result.current.playPulseHaptic(pulse());
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(2);
      unmount();
    });

    it("your own pulse does not open a coalescing window for others", () => {
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });
      act(() => {
        result.current.playPulseHaptic(pulse({ isSelf: true }));
        result.current.playPulseHaptic(pulse({ id: "a" }));
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      unmount();
    });
  });

  describe("haptics unavailable (visual-only fallback)", () => {
    it("swallows a rejected impactAsync without an unhandled rejection", async () => {
      mockImpactAsync.mockRejectedValue(new Error("no haptic engine"));
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });

      expect(() => {
        act(() => {
          result.current.playPulseHaptic(pulse());
        });
      }).not.toThrow();
      await act(async () => {
        await Promise.resolve();
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      unmount();
    });

    it("swallows a synchronous throw and reports that nothing played", () => {
      mockImpactAsync.mockImplementation(() => {
        throw new Error("native module missing");
      });
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });

      let played = true;
      expect(() => {
        act(() => {
          played = result.current.playPulseHaptic(pulse());
        });
      }).not.toThrow();
      expect(played).toBe(false);
      unmount();
    });

    it("a failed attempt does not suppress the next pulse", () => {
      mockImpactAsync.mockImplementationOnce(() => {
        throw new Error("transient");
      });
      const { result, unmount } = renderHaptics({ hapticsEnabled: true });

      act(() => {
        result.current.playPulseHaptic(pulse());
        result.current.playPulseHaptic(pulse());
      });
      expect(mockImpactAsync).toHaveBeenCalledTimes(2);
      unmount();
    });
  });

  it("schedules nothing: no timers to leak on unmount", () => {
    const { result, unmount } = renderHaptics({ hapticsEnabled: true });
    act(() => {
      result.current.playPulseHaptic(pulse());
    });
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
