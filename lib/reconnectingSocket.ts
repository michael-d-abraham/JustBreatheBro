/**
 * Small reconnecting WebSocket wrapper — the transport lifecycle carried over from the retired
 * `useGlobalBreathingRoom` hook, unchanged in behaviour:
 *
 *  - exponential backoff with jitter (first retry 2 s so Render cold starts do not look like failures)
 *  - stale-socket guard: events from a superseded socket are ignored
 *  - `start()` / `stop()` are idempotent and safe to call repeatedly (start/pause/stop invariant)
 *  - `stop()` closes the socket and cancels any pending retry: no leaked timers or sockets
 *
 * It knows nothing about message formats; callers own `onMessage`.
 */

export type SocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export const INITIAL_CONNECT_BACKOFF_MS = 2000;
export const MAX_RECONNECT_BACKOFF_MS = 45_000;
export const BACKOFF_JITTER_MS = 500;

/** Highest exponent worth computing: 2000 * 2^5 already exceeds the 45 s cap. */
const MAX_BACKOFF_EXPONENT = 6;

export type ReconnectingSocketOptions = {
  url: string;
  /** Fires on every successful (re)connect, before any message. */
  onOpen?: () => void;
  /** Raw frame payload; decoding and validation belong to the caller. */
  onMessage?: (data: unknown) => void;
  onStateChange?: (state: SocketConnectionState) => void;
};

export class ReconnectingSocket {
  private readonly url: string;
  private readonly onOpen?: () => void;
  private readonly onMessage?: (data: unknown) => void;
  private readonly onStateChange?: (state: SocketConnectionState) => void;

  private socket: WebSocket | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private running = false;
  private state: SocketConnectionState = "idle";

  constructor(options: ReconnectingSocketOptions) {
    this.url = options.url;
    this.onOpen = options.onOpen;
    this.onMessage = options.onMessage;
    this.onStateChange = options.onStateChange;
  }

  getState(): SocketConnectionState {
    return this.state;
  }

  /** Begin (or no-op if already running). Resets the backoff so a foreground return retries promptly. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.attempt = 0;
    this.connectNow();
  }

  /** Halt: close the socket, cancel retries. No-op if already stopped. */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.clearRetryTimer();
    this.closeSocket();
    this.setState("disconnected");
  }

  /** Skip the backoff wait ("Try now"). No-op when stopped or already connected/connecting. */
  reconnectNow(): void {
    if (!this.running) return;
    if (this.state !== "reconnecting") return;
    this.connectNow();
  }

  /** Returns true only if the frame was handed to an open socket. */
  send(data: string): boolean {
    const s = this.socket;
    if (!s || s.readyState !== WebSocket.OPEN) return false;
    try {
      s.send(data);
      return true;
    } catch {
      return false;
    }
  }

  private setState(next: SocketConnectionState): void {
    if (this.state === next) return;
    this.state = next;
    this.onStateChange?.(next);
  }

  private clearRetryTimer(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private closeSocket(): void {
    const s = this.socket;
    this.socket = null;
    if (!s) return;
    try {
      s.close();
    } catch {
      // ignore
    }
  }

  private scheduleReconnect(): void {
    if (!this.running) return;
    this.clearRetryTimer();
    const exponent = Math.min(this.attempt, MAX_BACKOFF_EXPONENT);
    const delay =
      Math.min(MAX_RECONNECT_BACKOFF_MS, INITIAL_CONNECT_BACKOFF_MS * 2 ** exponent) +
      Math.random() * BACKOFF_JITTER_MS;
    this.attempt += 1;
    this.setState("reconnecting");
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.running) return;
      this.connectNow();
    }, delay);
  }

  private connectNow(): void {
    if (!this.running) return;
    this.clearRetryTimer();
    this.closeSocket();
    this.setState("connecting");

    let s: WebSocket;
    try {
      s = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = s;

    s.onopen = () => {
      if (!this.running || this.socket !== s) return;
      this.attempt = 0;
      this.setState("connected");
      this.onOpen?.();
    };

    s.onmessage = (ev: { data?: unknown }) => {
      if (this.socket !== s) return;
      this.onMessage?.(ev.data);
    };

    // `onclose` always follows `onerror`; reconnect handling lives there only.
    s.onerror = () => {};

    s.onclose = () => {
      if (this.socket !== s) return;
      this.socket = null;
      if (!this.running) {
        this.setState("disconnected");
        return;
      }
      this.scheduleReconnect();
    };
  }
}
