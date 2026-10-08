/**
 * Minimal WebSocket stand-in for Jest. Records sent frames and exposes `simulate*` helpers so tests
 * can drive a socket's lifecycle deterministically. Lives outside `__tests__/` on purpose (Jest would
 * otherwise treat it as a test file).
 */

type Handler = ((ev: never) => void) | null;

export class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  /** Every socket constructed since the last `installMockWebSocket()`, in creation order. */
  static instances: MockWebSocket[] = [];
  /** When true, `new MockWebSocket()` throws (simulates an invalid URL). */
  static throwOnConstruct = false;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  sent: string[] = [];
  closeCalls = 0;

  onopen: Handler = null;
  onmessage: Handler = null;
  onerror: Handler = null;
  onclose: Handler = null;

  constructor(url: string) {
    if (MockWebSocket.throwOnConstruct) throw new Error("invalid url");
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) throw new Error("socket not open");
    this.sent.push(data);
  }

  /** Client-initiated close: flips to CLOSED without firing `onclose` (like a halted socket). */
  close() {
    this.closeCalls += 1;
    this.readyState = MockWebSocket.CLOSED;
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    (this.onopen as ((ev: unknown) => void) | null)?.({});
  }

  simulateMessage(payload: unknown) {
    const data = typeof payload === "string" ? payload : JSON.stringify(payload);
    (this.onmessage as ((ev: { data: unknown }) => void) | null)?.({ data });
  }

  /** Deliver a non-string frame (e.g. binary) exactly as given. */
  simulateRawMessage(data: unknown) {
    (this.onmessage as ((ev: { data: unknown }) => void) | null)?.({ data });
  }

  simulateError() {
    (this.onerror as ((ev: unknown) => void) | null)?.({});
  }

  /** Server/connection drop: fires `onclose` so reconnect logic runs. */
  simulateServerClose(code = 1006) {
    this.readyState = MockWebSocket.CLOSED;
    (this.onclose as ((ev: { code: number }) => void) | null)?.({ code });
  }

  /** Parsed JSON frames the client sent on this socket. */
  sentJson(): Record<string, unknown>[] {
    return this.sent.map((s) => JSON.parse(s) as Record<string, unknown>);
  }
}

export function latestSocket(): MockWebSocket {
  const list = MockWebSocket.instances;
  return list[list.length - 1];
}

/** Replace the global WebSocket with the mock. Returns a restore function for `afterEach`. */
export function installMockWebSocket(): () => void {
  MockWebSocket.instances = [];
  MockWebSocket.throwOnConstruct = false;
  const g = globalThis as { WebSocket?: unknown };
  const previous = g.WebSocket;
  g.WebSocket = MockWebSocket;
  return () => {
    g.WebSocket = previous;
  };
}
