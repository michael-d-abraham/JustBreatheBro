/**
 * Behavioral tests for useGlobalBreathingRoom (live "Breathe Together" room).
 *
 * The hook constructs `new WebSocket(wsUrl)` inside its connect effect and drives
 * the whole state machine off `onopen` / `onmessage` / `onclose`. We inject a
 * MockWebSocket as the global so tests can simulate server behavior, and use
 * Jest fake timers to drive the reconnect backoff. The hook is NOT modified.
 *
 * Covers: join, leave (disconnect), reconnect with backoff, and cleanup on unmount.
 */

/// <reference path="./react-test-renderer.d.ts" />
import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import {
  BREATH_ROOM_BOX,
  GlobalRoomPhaseStepPayload,
  useGlobalBreathingRoom,
} from "@/hooks/useGlobalBreathingRoom";

// Tell React 19 this is an act() environment so state updates flush correctly
// and the "not configured to support act(...)" warning is suppressed.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type CloseHandler = (ev: { code?: number }) => void;
type MessageHandler = (ev: { data: string }) => void;
type GenericHandler = (ev: unknown) => void;

/**
 * Minimal WebSocket stand-in. Records sent payloads and exposes simulate*
 * helpers so tests can drive the hook's socket lifecycle deterministically.
 */
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  /** Every socket the hook has opened this test, in creation order. */
  static instances: MockWebSocket[] = [];

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  sent: string[] = [];

  onopen: GenericHandler | null = null;
  onmessage: MessageHandler | null = null;
  onerror: GenericHandler | null = null;
  onclose: CloseHandler | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  /**
   * Mirrors the hook closing old sockets: flips readyState to CLOSED without
   * firing onclose, so it neither schedules a reconnect nor pushes state after
   * unmount. Server-initiated drops use simulateServerClose() instead.
   */
  close() {
    if (this.readyState === MockWebSocket.CLOSED) return;
    this.readyState = MockWebSocket.CLOSED;
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({});
  }

  simulateMessage(obj: unknown) {
    this.onmessage?.({ data: JSON.stringify(obj) });
  }

  simulateError() {
    this.onerror?.({});
  }

  /** Mimic the server/connection dropping: fire onclose so reconnect kicks in. */
  simulateServerClose(code = 1006) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code });
  }

  /** All join payloads this socket received, parsed. */
  joinMessages() {
    return this.sent
      .map((s) => JSON.parse(s) as Record<string, unknown>)
      .filter((m) => m.type === "join");
  }
}

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

/** Advance fake timers by `ms`, flushing any async chains. */
async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

/** The most recently created socket (the one the hook is currently using). */
function latestSocket(): MockWebSocket {
  const list = MockWebSocket.instances;
  return list[list.length - 1];
}

/** A valid server phase payload; override fields per test. */
function phasePayload(
  over: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    type: "phase",
    phase: "inhale",
    phaseSeq: 1,
    phaseDurationMs: 4000,
    phaseEndsAtMs: Date.now() + 4000,
    cycleIndex: 0,
    serverTimeMs: Date.now(),
    roomId: "deep",
    ...over,
  };
}

describe("useGlobalBreathingRoom (behavior)", () => {
  let realWebSocket: typeof globalThis.WebSocket;
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    MockWebSocket.instances = [];
    realWebSocket = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket as
      | typeof globalThis.WebSocket;
    (globalThis as { WebSocket: unknown }).WebSocket = MockWebSocket;
    // Deterministic backoff: jitter term (Math.random() * 500) becomes 0.
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    (globalThis as { WebSocket: unknown }).WebSocket = realWebSocket;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("join", () => {
    it("connects and sends a single join for the default room on open", () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      // Socket is created immediately; not connected until it opens.
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(result.current.connectionState).toBe("connecting");

      act(() => {
        latestSocket().simulateOpen();
      });

      expect(result.current.connectionState).toBe("connected");
      expect(result.current.isConnected).toBe(true);
      expect(result.current.wsError).toBeNull();

      const joins = latestSocket().joinMessages();
      expect(joins).toEqual([{ type: "join", room: "deep" }]);

      unmount();
    });

    it("honors initialRoomId in the join payload", () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep, initialRoomId: BREATH_ROOM_BOX }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });

      expect(result.current.selectedRoomId).toBe(BREATH_ROOM_BOX);
      expect(latestSocket().joinMessages()).toEqual([
        { type: "join", room: "box" },
      ]);

      unmount();
    });

    it("applies a snapshot: pattern, participantCount, and first phase step", () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });

      act(() => {
        latestSocket().simulateMessage({
          ...phasePayload(),
          type: "snapshot",
          participantCount: 7,
          pattern: { inhaleSec: 5, hold1Sec: 0, exhaleSec: 5, hold2Sec: 0 },
        });
      });

      expect(result.current.participantCount).toBe(7);
      expect(result.current.pattern).toEqual({
        inhaleSec: 5,
        hold1Sec: 0,
        exhaleSec: 5,
        hold2Sec: 0,
      });
      expect(result.current.roomId).toBe("deep");
      expect(result.current.phase).toBe("inhale");

      expect(onPhaseStep).toHaveBeenCalledTimes(1);
      const payload = onPhaseStep.mock.calls[0][0];
      expect(payload.phase).toBe("inhale");
      expect(payload.phaseSeq).toBe(1);
      // First step after connect must suppress cue audio.
      expect(payload.skipBreathCueAudio).toBe(true);

      unmount();
    });
  });

  describe("leave", () => {
    it("disconnect() marks disconnected, closes the socket, and does not reconnect", async () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });
      expect(result.current.connectionState).toBe("connected");

      const socket = latestSocket();
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.connectionState).toBe("disconnected");
      expect(socket.readyState).toBe(MockWebSocket.CLOSED);

      // Even far past any backoff window, no new socket is opened.
      await advance(60000);
      expect(MockWebSocket.instances).toHaveLength(1);

      unmount();
    });
  });

  describe("reconnect", () => {
    it("schedules a backoff reconnect on a dropped connection, then rejoins", async () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });
      expect(result.current.connectionState).toBe("connected");

      // Server drops the connection.
      act(() => {
        latestSocket().simulateServerClose();
      });

      expect(result.current.connectionState).toBe("reconnecting");
      expect(result.current.wsError).toBeTruthy();

      // Before the 2000ms initial backoff elapses, no new socket yet.
      await advance(1999);
      expect(MockWebSocket.instances).toHaveLength(1);

      // After the backoff delay, the hook opens a fresh socket.
      await advance(1);
      expect(MockWebSocket.instances).toHaveLength(2);
      expect(result.current.connectionState).toBe("connecting");

      // Opening the new socket reconnects and re-sends join.
      act(() => {
        latestSocket().simulateOpen();
      });
      expect(result.current.connectionState).toBe("connected");
      expect(latestSocket().joinMessages()).toEqual([
        { type: "join", room: "deep" },
      ]);

      unmount();
    });

    it("dedupes repeated phases and resets cue suppression after reconnect", async () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });

      // Same roomId:phaseSeq delivered twice -> only one onPhaseStep.
      act(() => {
        latestSocket().simulateMessage(phasePayload({ phaseSeq: 1 }));
        latestSocket().simulateMessage(phasePayload({ phaseSeq: 1 }));
      });
      expect(onPhaseStep).toHaveBeenCalledTimes(1);
      expect(onPhaseStep.mock.calls[0][0].skipBreathCueAudio).toBe(true);

      // A new phaseSeq is a distinct step; cue audio no longer suppressed.
      act(() => {
        latestSocket().simulateMessage(phasePayload({ phaseSeq: 2 }));
      });
      expect(onPhaseStep).toHaveBeenCalledTimes(2);
      expect(onPhaseStep.mock.calls[1][0].skipBreathCueAudio).toBe(false);

      // Drop + reconnect: per-connection refs reset, so the first step after
      // reconnect suppresses cue audio again even for a repeated phaseSeq.
      act(() => {
        latestSocket().simulateServerClose();
      });
      await advance(2000);
      act(() => {
        latestSocket().simulateOpen();
        latestSocket().simulateMessage(phasePayload({ phaseSeq: 2 }));
      });

      expect(onPhaseStep).toHaveBeenCalledTimes(3);
      expect(onPhaseStep.mock.calls[2][0].skipBreathCueAudio).toBe(true);

      unmount();
    });
  });

  describe("cleanup", () => {
    it("closes the socket on unmount and stops all timers/callbacks", async () => {
      const onPhaseStep = jest.fn<void, [GlobalRoomPhaseStepPayload]>();
      const { result, unmount } = renderHook(() =>
        useGlobalBreathingRoom({ onPhaseStep }),
      );

      act(() => {
        latestSocket().simulateOpen();
      });
      expect(result.current.connectionState).toBe("connected");

      const socket = latestSocket();
      unmount();

      expect(socket.readyState).toBe(MockWebSocket.CLOSED);

      const callsAtUnmount = onPhaseStep.mock.calls.length;
      // No reconnect socket is created and no further callbacks fire.
      await advance(60000);
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(onPhaseStep.mock.calls.length).toBe(callsAtUnmount);
    });
  });
});
