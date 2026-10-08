/// <reference path="./react-test-renderer.d.ts" />
/**
 * Behavioral tests for useGlobalPresence (the Global Room client).
 *
 * The hook builds a ReconnectingSocket around `new WebSocket(...)`, so a MockWebSocket global
 * lets tests play the server. `react-native`'s AppState is mocked so foreground/background
 * transitions can be driven directly. Jest fake timers drive backoff, ghost fade-out, ripple
 * retention and the pulse cooldown (the modern fake timers also move Date.now()).
 *
 * Covers: initial connection + snapshot, empty room, join/leave + ghost fade, sending and
 * receiving pulses, cooldown, overlapping pulses, malformed frames, reconnect with fresh state and
 * no replay, background/foreground, enabled toggling, and full teardown (no leaked timers/sockets).
 */

import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { GHOST_TTL_MS, PULSE_RETENTION_MS, type PulseEvent } from "@/lib/globalPresenceState";
import { INITIAL_CONNECT_BACKOFF_MS } from "@/lib/reconnectingSocket";
import { MockWebSocket, installMockWebSocket, latestSocket } from "../../jest/mockWebSocket";

type AppStateHandler = (status: string) => void;

jest.mock("react-native", () => {
  const handlers = new Set<(status: string) => void>();
  const appState = {
    currentState: "active",
    addEventListener: jest.fn((_event: string, handler: (status: string) => void) => {
      handlers.add(handler);
      return { remove: () => handlers.delete(handler) };
    }),
    // test helpers
    __handlerCount: () => handlers.size,
    __set: (status: string) => {
      appState.currentState = status;
      handlers.forEach((h) => h(status));
    },
  };
  return { AppState: appState };
});

// eslint-disable-next-line import/order
import { AppState } from "react-native";

const appState = AppState as unknown as {
  currentState: string;
  __handlerCount: () => number;
  __set: (status: string) => void;
};

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = NonNullable<Parameters<typeof useGlobalPresence>[0]>;

/** Unmount callbacks for every harness rendered by the current test (run in afterEach). */
let pendingUnmounts: (() => void)[] = [];

function renderPresence(initialProps: Props = {}) {
  const result: { current: ReturnType<typeof useGlobalPresence> } = {
    current: undefined as unknown as ReturnType<typeof useGlobalPresence>,
  };
  let props = initialProps;
  let unmounted = false;

  function Harness() {
    result.current = useGlobalPresence(props);
    return null;
  }

  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(createElement(Harness));
  });

  const unmount = () => {
    if (unmounted) return;
    unmounted = true;
    act(() => {
      renderer.unmount();
    });
  };
  // A failing assertion must not leak this hook's AppState listener / socket into later tests.
  pendingUnmounts.push(unmount);

  return {
    result,
    rerender(next: Props) {
      props = next;
      act(() => {
        renderer.update(createElement(Harness));
      });
    },
    unmount,
  };
}

const dot = (id: string, lat = 10, lon = 20) => ({ id, lat, lon });

const snapshot = (selfId: string, others: ReturnType<typeof dot>[] = [], cooldown = 5000) => ({
  type: "snapshot",
  v: 1,
  serverTimeMs: Date.now(),
  selfId,
  pulseCooldownMs: cooldown,
  participants: [dot(selfId, 1, 2), ...others],
});

/**
 * Advance fake time in 250 ms steps, each inside its own `act`, so React commits (and arms the next
 * expiry timer) between steps — as it does on a real device. One big jump would let several timers
 * fire before the hook could schedule the next one.
 */
async function advance(ms: number) {
  const STEP_MS = 250;
  for (let left = ms; left > 0; left -= STEP_MS) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(Math.min(STEP_MS, left));
    });
  }
}

function serverSend(payload: unknown, socket: MockWebSocket = latestSocket()) {
  act(() => {
    socket.simulateMessage(payload);
  });
}

/** Open the latest socket and deliver a snapshot (the normal "joined the room" moment). */
function connectAs(selfId: string, others: ReturnType<typeof dot>[] = [], cooldownMs = 5000) {
  act(() => {
    latestSocket().simulateOpen();
  });
  serverSend(snapshot(selfId, others, cooldownMs));
}

describe("useGlobalPresence", () => {
  let restoreWs: () => void;
  let randomSpy: jest.SpyInstance;
  const envKeys = ["EXPO_PUBLIC_BREATH_ROOM_WS_URL", "EXPO_PUBLIC_WS_URL"] as const;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of envKeys) {
      savedEnv[k] = process.env[k];
      delete process.env[k];
    }
    jest.useFakeTimers();
    restoreWs = installMockWebSocket();
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    appState.currentState = "active";
  });

  afterEach(() => {
    pendingUnmounts.forEach((u) => u());
    pendingUnmounts = [];
    randomSpy.mockRestore();
    restoreWs();
    jest.clearAllTimers();
    jest.useRealTimers();
    for (const k of envKeys) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
  });

  describe("initial connection and snapshot", () => {
    it("connects to /global on the production host and sends nothing on open (connecting is joining)", () => {
      const { result, unmount } = renderPresence();

      expect(MockWebSocket.instances).toHaveLength(1);
      expect(latestSocket().url).toBe("wss://api.hellobreathbro.app/global");
      expect(result.current.connectionState).toBe("connecting");
      expect(result.current.isConnected).toBe(false);

      act(() => {
        latestSocket().simulateOpen();
      });
      expect(result.current.connectionState).toBe("connected");
      expect(latestSocket().sent).toEqual([]);

      unmount();
    });

    it("applies the snapshot: self id, own dot and everyone else", () => {
      const { result, unmount } = renderPresence();
      connectAs("me", [dot("a", 35, 139), dot("b", -14, -49)]);

      expect(result.current.selfId).toBe("me");
      expect(result.current.selfDot).toEqual(dot("me", 1, 2));
      expect(result.current.dots.map((d) => d.id)).toEqual(["me", "a", "b"]);
      expect(result.current.participantCount).toBe(3);
      expect(result.current.ghosts).toEqual([]);

      unmount();
    });

    it("empty room: you alone are still a complete, renderable state", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");

      expect(result.current.dots).toEqual([dot("me", 1, 2)]);
      expect(result.current.selfDot).not.toBeNull();
      expect(result.current.participantCount).toBe(1);

      unmount();
    });
  });

  describe("presence updates", () => {
    it("shows joiners and fades leavers out as ghosts after the TTL", async () => {
      const { result, unmount } = renderPresence();
      connectAs("me");

      serverSend({ type: "join", participant: dot("a", 5, 6) });
      expect(result.current.dots.map((d) => d.id)).toEqual(["me", "a"]);

      serverSend({ type: "leave", id: "a" });
      expect(result.current.dots.map((d) => d.id)).toEqual(["me"]);
      expect(result.current.ghosts.map((g) => g.id)).toEqual(["a"]);

      await advance(GHOST_TTL_MS - 100);
      expect(result.current.ghosts).toHaveLength(1);
      await advance(200);
      expect(result.current.ghosts).toEqual([]);
      expect(jest.getTimerCount()).toBe(0);

      unmount();
    });

    it("never turns you into a ghost, even if the server says you left", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      serverSend({ type: "leave", id: "me" });
      expect(result.current.selfDot).not.toBeNull();
      expect(result.current.ghosts).toEqual([]);
      unmount();
    });
  });

  describe("receiving pulses", () => {
    it("fires onPulse once per pulse with origin info, then retires the ripple", async () => {
      const onPulse = jest.fn<void, [PulseEvent]>();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me", [dot("a", 35, 139)]);

      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 });

      expect(onPulse).toHaveBeenCalledTimes(1);
      expect(onPulse.mock.calls[0][0]).toMatchObject({ id: "a", lat: 35, lon: 139, isSelf: false });
      expect(result.current.pulses).toHaveLength(1);
      expect(result.current.isCoolingDown).toBe(false);

      await advance(PULSE_RETENTION_MS + 50);
      expect(result.current.pulses).toEqual([]);
      expect(onPulse).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("overlapping pulses each get their own ripple and their own callback", () => {
      const onPulse = jest.fn<void, [PulseEvent]>();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me", [dot("a"), dot("b")]);

      act(() => {
        latestSocket().simulateMessage({ type: "pulse", id: "a", serverTimeMs: 1 });
        latestSocket().simulateMessage({ type: "pulse", id: "b", serverTimeMs: 1 });
        latestSocket().simulateMessage({ type: "pulse", id: "a", serverTimeMs: 2 });
      });

      expect(onPulse).toHaveBeenCalledTimes(3);
      expect(result.current.pulses.map((p) => p.seq)).toEqual([1, 2, 3]);

      unmount();
    });

    it("ignores a pulse from someone we have no dot for", () => {
      const onPulse = jest.fn();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me");
      serverSend({ type: "pulse", id: "stranger", serverTimeMs: 1 });
      expect(onPulse).not.toHaveBeenCalled();
      expect(result.current.pulses).toEqual([]);
      unmount();
    });

    it("always calls the latest onPulse callback", () => {
      const first = jest.fn();
      const second = jest.fn();
      const { rerender, unmount } = renderPresence({ onPulse: first });
      connectAs("me", [dot("a")]);

      rerender({ onPulse: second });
      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 });

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      expect(MockWebSocket.instances).toHaveLength(1); // a new callback must not reconnect
      unmount();
    });
  });

  describe("sending pulses", () => {
    it("sends a single {type:'pulse'} and shows nothing until the server echoes it", () => {
      const onPulse = jest.fn<void, [PulseEvent]>();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me");

      let sent = false;
      act(() => {
        sent = result.current.sendPulse();
      });
      expect(sent).toBe(true);
      expect(latestSocket().sentJson()).toEqual([{ type: "pulse" }]);
      expect(result.current.pulses).toEqual([]);
      expect(onPulse).not.toHaveBeenCalled();

      serverSend({ type: "pulse", id: "me", serverTimeMs: 1 });
      expect(onPulse).toHaveBeenCalledTimes(1);
      expect(onPulse.mock.calls[0][0].isSelf).toBe(true);
      expect(result.current.pulses).toHaveLength(1);
      expect(result.current.isCoolingDown).toBe(true);

      unmount();
    });

    it("empty room: a lone user pulses and sees their own ripple", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      act(() => {
        result.current.sendPulse();
      });
      serverSend({ type: "pulse", id: "me", serverTimeMs: 1 });
      expect(result.current.pulses.map((p) => p.id)).toEqual(["me"]);
      unmount();
    });

    it("blocks sending during the cooldown and allows it again once it ends", async () => {
      const { result, unmount } = renderPresence();
      connectAs("me", [], 5000);

      act(() => {
        result.current.sendPulse();
      });
      serverSend({ type: "pulse", id: "me", serverTimeMs: 1 });
      expect(result.current.isCoolingDown).toBe(true);

      await advance(1000);
      let sent = true;
      act(() => {
        sent = result.current.sendPulse();
      });
      expect(sent).toBe(false);
      expect(latestSocket().sent).toHaveLength(1);

      await advance(4100);
      expect(result.current.isCoolingDown).toBe(false);
      act(() => {
        sent = result.current.sendPulse();
      });
      expect(sent).toBe(true);
      expect(latestSocket().sent).toHaveLength(2);

      unmount();
    });

    it("a server cooldown message (rejected pulse) starts the local cooldown without any ripple", async () => {
      const onPulse = jest.fn();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me");

      act(() => {
        result.current.sendPulse();
      });
      serverSend({ type: "cooldown", retryAfterMs: 3000 });

      expect(result.current.isCoolingDown).toBe(true);
      expect(result.current.pulses).toEqual([]);
      expect(onPulse).not.toHaveBeenCalled();

      await advance(3050);
      expect(result.current.isCoolingDown).toBe(false);

      unmount();
    });

    it("a rapid double tap sends only one request", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      act(() => {
        result.current.sendPulse();
        result.current.sendPulse();
        result.current.sendPulse();
      });
      expect(latestSocket().sent).toHaveLength(1);
      unmount();
    });

    it("returns false and sends nothing while disconnected", () => {
      const { result, unmount } = renderPresence();
      // Still connecting.
      let sent = true;
      act(() => {
        sent = result.current.sendPulse();
      });
      expect(sent).toBe(false);
      expect(latestSocket().sent).toEqual([]);
      unmount();
    });
  });

  describe("malformed and hostile frames", () => {
    it("ignores garbage without throwing, and the room keeps working", () => {
      const onPulse = jest.fn();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me", [dot("a")]);
      const before = result.current.dots;

      act(() => {
        const s = latestSocket();
        for (const frame of [
          "not json",
          "",
          "[]",
          "null",
          '{"type":"snapshot"}',
          '{"type":"join","participant":{"id":"x","lat":999,"lon":0}}',
          '{"type":"leave"}',
          '{"type":"pulse"}',
          '{"type":"cooldown","retryAfterMs":-1}',
          '{"type":"chat","text":"hi"}',
        ]) {
          expect(() => s.simulateMessage(frame)).not.toThrow();
        }
        s.simulateRawMessage(new ArrayBuffer(4));
        s.simulateRawMessage(undefined);
      });

      expect(result.current.dots).toEqual(before);
      expect(onPulse).not.toHaveBeenCalled();
      expect(result.current.isCoolingDown).toBe(false);

      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 });
      expect(onPulse).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe("reconnection", () => {
    it("clears the map immediately on a drop, then rejoins with fresh state and no pulse replay", async () => {
      const onPulse = jest.fn<void, [PulseEvent]>();
      const { result, unmount } = renderPresence({ onPulse });
      connectAs("me", [dot("a")]);
      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 });
      expect(onPulse).toHaveBeenCalledTimes(1);

      act(() => {
        latestSocket().simulateServerClose();
      });
      expect(result.current.connectionState).toBe("reconnecting");
      expect(result.current.dots).toEqual([]);
      expect(result.current.selfId).toBeNull();
      expect(result.current.pulses).toEqual([]);

      await advance(INITIAL_CONNECT_BACKOFF_MS);
      expect(MockWebSocket.instances).toHaveLength(2);
      connectAs("me2", [dot("b")]);

      expect(result.current.selfId).toBe("me2");
      expect(result.current.dots.map((d) => d.id)).toEqual(["me2", "b"]);
      expect(result.current.pulses).toEqual([]);
      expect(onPulse).toHaveBeenCalledTimes(1); // nothing replayed

      unmount();
    });

    it("a pulse cooldown from the old session does not carry over", async () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      act(() => {
        result.current.sendPulse();
      });
      serverSend({ type: "pulse", id: "me", serverTimeMs: 1 });
      expect(result.current.isCoolingDown).toBe(true);

      act(() => {
        latestSocket().simulateServerClose();
      });
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      connectAs("fresh");
      expect(result.current.isCoolingDown).toBe(false);

      unmount();
    });

    it("reconnectNow() skips the backoff wait", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      act(() => {
        latestSocket().simulateServerClose();
      });
      expect(MockWebSocket.instances).toHaveLength(1);
      act(() => {
        result.current.reconnectNow();
      });
      expect(MockWebSocket.instances).toHaveLength(2);
      unmount();
    });

    it("keeps retrying through repeated failures without ever stacking sockets", async () => {
      const { unmount } = renderPresence();
      for (let i = 0; i < 4; i += 1) {
        act(() => {
          latestSocket().simulateServerClose();
        });
        await advance(60_000);
      }
      expect(MockWebSocket.instances).toHaveLength(5);
      expect(MockWebSocket.instances.filter((s) => s.readyState !== MockWebSocket.CLOSED)).toHaveLength(1);
      unmount();
    });
  });

  describe("app background / foreground", () => {
    it("closes the connection and clears state in the background, and never reconnects there", async () => {
      const { result, unmount } = renderPresence();
      connectAs("me", [dot("a")]);
      const socket = latestSocket();

      act(() => {
        appState.__set("background");
      });
      expect(socket.readyState).toBe(MockWebSocket.CLOSED);
      expect(result.current.connectionState).toBe("disconnected");
      expect(result.current.dots).toEqual([]);

      await advance(120_000);
      expect(MockWebSocket.instances).toHaveLength(1);

      unmount();
    });

    it("returning to the foreground opens a brand-new connection with a fresh snapshot", () => {
      const { result, unmount } = renderPresence();
      connectAs("me", [dot("a")]);

      act(() => {
        appState.__set("background");
      });
      act(() => {
        appState.__set("active");
      });
      expect(MockWebSocket.instances).toHaveLength(2);
      expect(result.current.connectionState).toBe("connecting");

      connectAs("me-again", [dot("c")]);
      expect(result.current.selfId).toBe("me-again");
      expect(result.current.dots.map((d) => d.id)).toEqual(["me-again", "c"]);

      unmount();
    });

    it("repeated background/active signals never duplicate sockets", () => {
      const { unmount } = renderPresence();
      act(() => {
        appState.__set("active");
        appState.__set("active");
      });
      expect(MockWebSocket.instances).toHaveLength(1);

      act(() => {
        appState.__set("background");
        appState.__set("background");
      });
      act(() => {
        appState.__set("active");
        appState.__set("active");
      });
      expect(MockWebSocket.instances).toHaveLength(2);
      unmount();
    });

    it("`inactive` (Control Center, notification pull) keeps the connection", () => {
      const { result, unmount } = renderPresence();
      connectAs("me");
      act(() => {
        appState.__set("inactive");
      });
      expect(result.current.connectionState).toBe("connected");
      expect(MockWebSocket.instances).toHaveLength(1);
      unmount();
    });

    it("does not connect at all when mounted while already in the background", () => {
      appState.currentState = "background";
      const { result, unmount } = renderPresence();
      expect(MockWebSocket.instances).toHaveLength(0);
      expect(result.current.connectionState).toBe("idle");
      act(() => {
        appState.__set("active");
      });
      expect(MockWebSocket.instances).toHaveLength(1);
      unmount();
    });
  });

  describe("enabled flag", () => {
    it("does not connect while disabled, connects when enabled, and tears down when disabled again", () => {
      const { result, rerender, unmount } = renderPresence({ enabled: false });
      expect(MockWebSocket.instances).toHaveLength(0);
      expect(appState.__handlerCount()).toBe(0);

      rerender({ enabled: true });
      expect(MockWebSocket.instances).toHaveLength(1);
      connectAs("me");
      expect(result.current.isConnected).toBe(true);

      const socket = latestSocket();
      rerender({ enabled: false });
      expect(socket.readyState).toBe(MockWebSocket.CLOSED);
      expect(appState.__handlerCount()).toBe(0);

      unmount();
    });
  });

  describe("teardown", () => {
    it("unmount closes the socket, removes the AppState listener, and leaves no timers behind", async () => {
      const { result, unmount } = renderPresence();
      connectAs("me", [dot("a")]);
      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 }); // schedules an expiry timer
      serverSend({ type: "leave", id: "a" });
      expect(appState.__handlerCount()).toBe(1);

      const socket = latestSocket();
      unmount();

      expect(socket.readyState).toBe(MockWebSocket.CLOSED);
      expect(appState.__handlerCount()).toBe(0);
      expect(jest.getTimerCount()).toBe(0);

      await advance(120_000);
      expect(MockWebSocket.instances).toHaveLength(1);
      // sendPulse after unmount is inert.
      let sent = true;
      act(() => {
        sent = result.current.sendPulse();
      });
      expect(sent).toBe(false);
    });

    it("unmount during a pending reconnect cancels it", async () => {
      const { unmount } = renderPresence();
      connectAs("me");
      act(() => {
        latestSocket().simulateServerClose();
      });
      unmount();
      await advance(120_000);
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(jest.getTimerCount()).toBe(0);
    });

    it("keeps at most one expiry timer however many things are pending", () => {
      const { unmount } = renderPresence();
      connectAs("me", [dot("a"), dot("b")]);
      serverSend({ type: "pulse", id: "a", serverTimeMs: 1 });
      serverSend({ type: "pulse", id: "b", serverTimeMs: 1 });
      serverSend({ type: "leave", id: "a" });
      serverSend({ type: "cooldown", retryAfterMs: 4000 });
      expect(jest.getTimerCount()).toBe(1);
      unmount();
    });
  });
});
