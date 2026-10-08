import { getGlobalRoomWsUrl } from "@/lib/breathRoomBackend";
import {
  GLOBAL_PULSE_REQUEST,
  decodeGlobalMessage,
} from "@/lib/globalPresenceProtocol";
import {
  applyGlobalMessage,
  createInitialPresenceState,
  expirePresenceState,
  isCoolingDown,
  nextExpiryAtMs,
  type GlobalPresenceState,
  type PulseEvent,
} from "@/lib/globalPresenceState";
import {
  ReconnectingSocket,
  type SocketConnectionState,
} from "@/lib/reconnectingSocket";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

/** Ignore a second tap that lands before the server has had a chance to answer the first. */
const SEND_GUARD_MS = 750;

type UseGlobalPresenceOptions = {
  /** Called once for every new visible pulse, own and others'. Never replayed after a reconnect. */
  onPulse?: (pulse: PulseEvent) => void;
  /** Connect only while true (e.g. screen focused). Defaults to true. */
  enabled?: boolean;
};

/**
 * Global Room client: ephemeral presence + pulses over one WebSocket.
 *
 * Lifecycle (idempotent, fully torn down):
 *  - connects while the app is in the foreground and `enabled`;
 *  - on `background` the socket is closed and all presence state cleared; on return a brand-new
 *    connection gets a fresh snapshot (new session id, no pulse replay);
 *  - on unmount / `enabled=false` the socket, retry timer, AppState listener and expiry timer
 *    are all released.
 *
 * There is exactly one expiry timer at a time (ghost dots, ripple retention, cooldown), rescheduled
 * from state — no intervals, no per-dot timers.
 */
export function useGlobalPresence({
  onPulse,
  enabled = true,
}: UseGlobalPresenceOptions = {}) {
  const [state, setState] = useState<GlobalPresenceState>(createInitialPresenceState);
  const [connectionState, setConnectionState] =
    useState<SocketConnectionState>("idle");
  const [wake, setWake] = useState(0);

  const stateRef = useRef(state);
  const onPulseRef = useRef(onPulse);
  onPulseRef.current = onPulse;
  const socketRef = useRef<ReconnectingSocket | null>(null);
  const lastSentAtRef = useRef(0);

  const commit = useCallback((next: GlobalPresenceState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const socket = new ReconnectingSocket({
      url: getGlobalRoomWsUrl(),
      onStateChange: (next) => {
        if (disposed) return;
        setConnectionState(next);
        // Anything but a live connection means whatever we were showing is no longer true.
        if (next !== "connected") commit(createInitialPresenceState());
      },
      onMessage: (raw) => {
        if (disposed) return;
        const message = decodeGlobalMessage(raw);
        if (!message) return;
        const { state: next, pulse } = applyGlobalMessage(
          stateRef.current,
          message,
          Date.now(),
        );
        commit(next);
        if (pulse) onPulseRef.current?.(pulse);
      },
    });
    socketRef.current = socket;

    // Only `background` closes the connection. iOS `inactive` also happens for Control Center and
    // notification pulls; tearing down for those would drop the user's dot for no reason.
    const sync = (status: AppStateStatus) => {
      if (status === "background") socket.stop();
      else socket.start();
    };
    sync(AppState.currentState);
    const subscription = AppState.addEventListener("change", sync);

    return () => {
      disposed = true;
      subscription.remove();
      socket.stop();
      socketRef.current = null;
    };
  }, [enabled, commit]);

  // Single wake-up for the next expiry (ghost fade-out, ripple retention, cooldown end).
  const nextExpiry = nextExpiryAtMs(state);
  useEffect(() => {
    if (nextExpiry === null) return;
    const id = setTimeout(
      () => {
        const next = expirePresenceState(stateRef.current, Date.now());
        if (next !== stateRef.current) commit(next);
        // Re-arm even if the timer fired marginally early and nothing had expired yet.
        else setWake((w) => w + 1);
      },
      Math.max(0, nextExpiry - Date.now()) + 5,
    );
    return () => clearTimeout(id);
  }, [nextExpiry, wake, commit]);

  /**
   * Ask the server to send a pulse. Returns whether a request was sent. The pulse (and its ripple)
   * only appears once the server echoes it back, so a rejected pulse never ripples.
   */
  const sendPulse = useCallback((): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.getState() !== "connected") return false;
    const now = Date.now();
    if (isCoolingDown(stateRef.current, now)) return false;
    if (now - lastSentAtRef.current < SEND_GUARD_MS) return false;
    if (!socket.send(GLOBAL_PULSE_REQUEST)) return false;
    lastSentAtRef.current = now;
    return true;
  }, []);

  /** Skip the backoff wait when the user taps "try now". */
  const reconnectNow = useCallback(() => {
    socketRef.current?.reconnectNow();
  }, []);

  const dots = Object.values(state.participants);
  const selfDot = state.selfId ? (state.participants[state.selfId] ?? null) : null;

  return {
    connectionState,
    isConnected: connectionState === "connected",
    selfId: state.selfId,
    selfDot,
    /** Everyone currently connected, including you. */
    dots,
    /** Recently departed, for dim fading dots. Never includes you. */
    ghosts: Object.values(state.ghosts),
    /** Pulses whose ripples are still animating. */
    pulses: state.pulses,
    participantCount: dots.length,
    /** True from your own pulse until the cooldown ends. */
    isCoolingDown: state.cooldownUntilMs !== 0,
    sendPulse,
    reconnectNow,
  };
}
