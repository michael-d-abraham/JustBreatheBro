import {
  BACKOFF_JITTER_MS,
  INITIAL_CONNECT_BACKOFF_MS,
  MAX_RECONNECT_BACKOFF_MS,
  ReconnectingSocket,
  type SocketConnectionState,
} from "@/lib/reconnectingSocket";
import { MockWebSocket, installMockWebSocket, latestSocket } from "../../jest/mockWebSocket";

describe("ReconnectingSocket", () => {
  let restore: () => void;
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    restore = installMockWebSocket();
    // Deterministic backoff: jitter term becomes 0.
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    restore();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function make() {
    const states: SocketConnectionState[] = [];
    const messages: unknown[] = [];
    const onOpen = jest.fn();
    const socket = new ReconnectingSocket({
      url: "wss://example.test/global",
      onOpen,
      onMessage: (d) => messages.push(d),
      onStateChange: (s) => states.push(s),
    });
    return { socket, states, messages, onOpen };
  }

  const advance = (ms: number) => jest.advanceTimersByTimeAsync(ms);

  describe("start / stop lifecycle", () => {
    it("is idle until started and opens exactly one socket on start", () => {
      const { socket, states } = make();
      expect(socket.getState()).toBe("idle");
      expect(MockWebSocket.instances).toHaveLength(0);

      socket.start();
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(latestSocket().url).toBe("wss://example.test/global");
      expect(states).toEqual(["connecting"]);
    });

    it("start() is idempotent: repeated calls never open a second socket", () => {
      const { socket } = make();
      socket.start();
      socket.start();
      socket.start();
      expect(MockWebSocket.instances).toHaveLength(1);
    });

    it("connects, reports connected, and calls onOpen once", () => {
      const { socket, states, onOpen } = make();
      socket.start();
      latestSocket().simulateOpen();
      expect(socket.getState()).toBe("connected");
      expect(states).toEqual(["connecting", "connected"]);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("stop() closes the socket, goes disconnected, and never reconnects", async () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateOpen();
      const s = latestSocket();

      socket.stop();
      expect(s.readyState).toBe(MockWebSocket.CLOSED);
      expect(socket.getState()).toBe("disconnected");

      await advance(120_000);
      expect(MockWebSocket.instances).toHaveLength(1);
    });

    it("stop() is idempotent and emits the state change once", () => {
      const { socket, states } = make();
      socket.start();
      latestSocket().simulateOpen();
      socket.stop();
      socket.stop();
      socket.stop();
      expect(states.filter((s) => s === "disconnected")).toHaveLength(1);
      expect(latestSocket().closeCalls).toBe(1);
    });

    it("stop() before start() is a no-op and leaves the socket idle", () => {
      const { socket, states } = make();
      socket.stop();
      expect(socket.getState()).toBe("idle");
      expect(states).toEqual([]);
    });

    it("can be restarted after stop() with a fresh socket and a reset backoff", async () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      latestSocket().simulateServerClose(); // second failure → next delay is 4 s
      socket.stop();

      socket.start();
      expect(MockWebSocket.instances).toHaveLength(3);
      latestSocket().simulateServerClose();
      // Backoff restarted from the initial delay, not 4 s.
      await advance(INITIAL_CONNECT_BACKOFF_MS - 1);
      expect(MockWebSocket.instances).toHaveLength(3);
      await advance(1);
      expect(MockWebSocket.instances).toHaveLength(4);
    });

    it("stop() cancels a pending retry timer", async () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateServerClose();
      expect(socket.getState()).toBe("reconnecting");
      socket.stop();
      expect(jest.getTimerCount()).toBe(0);
      await advance(120_000);
      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });

  describe("reconnect with backoff", () => {
    it("a dropped connection becomes reconnecting and retries after the initial backoff", async () => {
      const { socket, states } = make();
      socket.start();
      latestSocket().simulateOpen();
      latestSocket().simulateServerClose();

      expect(socket.getState()).toBe("reconnecting");
      await advance(INITIAL_CONNECT_BACKOFF_MS - 1);
      expect(MockWebSocket.instances).toHaveLength(1);
      await advance(1);
      expect(MockWebSocket.instances).toHaveLength(2);
      expect(states.slice(-1)).toEqual(["connecting"]);
    });

    it("doubles the delay on each failed attempt and caps at the maximum", async () => {
      const { socket } = make();
      socket.start();

      let expected = INITIAL_CONNECT_BACKOFF_MS;
      for (let i = 0; i < 9; i += 1) {
        const before = MockWebSocket.instances.length;
        latestSocket().simulateServerClose();
        const delay = Math.min(MAX_RECONNECT_BACKOFF_MS, expected);
        await advance(delay - 1);
        expect(MockWebSocket.instances).toHaveLength(before);
        await advance(1);
        expect(MockWebSocket.instances).toHaveLength(before + 1);
        expected *= 2;
      }
      // Well past the cap by now: one more failure still waits exactly the max.
      const before = MockWebSocket.instances.length;
      latestSocket().simulateServerClose();
      await advance(MAX_RECONNECT_BACKOFF_MS - 1);
      expect(MockWebSocket.instances).toHaveLength(before);
      await advance(1);
      expect(MockWebSocket.instances).toHaveLength(before + 1);
    });

    it("adds jitter on top of the base delay", async () => {
      randomSpy.mockReturnValue(0.999);
      const { socket } = make();
      socket.start();
      latestSocket().simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      expect(MockWebSocket.instances).toHaveLength(1);
      await advance(BACKOFF_JITTER_MS);
      expect(MockWebSocket.instances).toHaveLength(2);
    });

    it("a successful open resets the backoff", async () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      latestSocket().simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS * 2);
      latestSocket().simulateOpen(); // success after two failures
      latestSocket().simulateServerClose();

      await advance(INITIAL_CONNECT_BACKOFF_MS - 1);
      const count = MockWebSocket.instances.length;
      await advance(1);
      expect(MockWebSocket.instances).toHaveLength(count + 1);
    });

    it("an error event alone does not reconnect; the following close does", async () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateError();
      expect(socket.getState()).toBe("connecting");
      await advance(60_000);
      expect(MockWebSocket.instances).toHaveLength(1);

      latestSocket().simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      expect(MockWebSocket.instances).toHaveLength(2);
    });

    it("an invalid URL (constructor throws) schedules a retry instead of crashing", async () => {
      MockWebSocket.throwOnConstruct = true;
      const { socket } = make();
      expect(() => socket.start()).not.toThrow();
      expect(socket.getState()).toBe("reconnecting");

      MockWebSocket.throwOnConstruct = false;
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      expect(MockWebSocket.instances).toHaveLength(1);
      latestSocket().simulateOpen();
      expect(socket.getState()).toBe("connected");
    });

    it("reconnectNow() skips the wait; it is a no-op when connected or stopped", async () => {
      const { socket } = make();
      socket.start();
      socket.reconnectNow(); // connecting → no-op
      expect(MockWebSocket.instances).toHaveLength(1);

      latestSocket().simulateServerClose();
      expect(socket.getState()).toBe("reconnecting");
      socket.reconnectNow();
      expect(MockWebSocket.instances).toHaveLength(2);
      expect(jest.getTimerCount()).toBe(0); // the pending retry was cleared

      latestSocket().simulateOpen();
      socket.reconnectNow(); // connected → no-op
      expect(MockWebSocket.instances).toHaveLength(2);

      socket.stop();
      socket.reconnectNow();
      expect(MockWebSocket.instances).toHaveLength(2);
    });
  });

  describe("stale-socket guard", () => {
    it("ignores messages and closes from a superseded socket", async () => {
      const { socket, messages } = make();
      socket.start();
      const first = latestSocket();
      first.simulateOpen();
      first.simulateServerClose();
      await advance(INITIAL_CONNECT_BACKOFF_MS);
      const second = latestSocket();
      second.simulateOpen();

      first.simulateMessage({ type: "pulse", from: "old" });
      first.simulateServerClose(); // a late close from the old socket must not tear down the new one
      expect(messages).toEqual([]);
      expect(socket.getState()).toBe("connected");

      second.simulateMessage({ type: "pulse", from: "new" });
      expect(messages).toHaveLength(1);
    });

    it("a late open from a stopped socket does not resurrect the connection", () => {
      const { socket, onOpen } = make();
      socket.start();
      const s = latestSocket();
      socket.stop();
      s.simulateOpen();
      expect(onOpen).not.toHaveBeenCalled();
      expect(socket.getState()).toBe("disconnected");
    });
  });

  describe("send", () => {
    it("returns false until the socket is open, true once open, false after stop", () => {
      const { socket } = make();
      expect(socket.send("x")).toBe(false); // never started
      socket.start();
      expect(socket.send("x")).toBe(false); // connecting
      latestSocket().simulateOpen();
      expect(socket.send("hello")).toBe(true);
      expect(latestSocket().sent).toEqual(["hello"]);
      socket.stop();
      expect(socket.send("late")).toBe(false);
    });

    it("returns false (does not throw) when the underlying send throws", () => {
      const { socket } = make();
      socket.start();
      latestSocket().simulateOpen();
      latestSocket().send = () => {
        throw new Error("boom");
      };
      expect(socket.send("x")).toBe(false);
    });
  });

  it("forwards raw frames to onMessage untouched", () => {
    const { socket, messages } = make();
    socket.start();
    latestSocket().simulateOpen();
    latestSocket().simulateMessage('{"a":1}');
    latestSocket().simulateRawMessage(42);
    expect(messages).toEqual(['{"a":1}', 42]);
  });
});
