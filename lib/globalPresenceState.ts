/**
 * Pure state machine for the Global Room: who is here, who just left, which pulses are visible,
 * and the local pulse cooldown. No timers and no I/O — callers pass `nowMs` — so every rule here
 * is unit-testable and the hook only has to schedule one wake-up for the next expiry.
 */

import {
  DEFAULT_PULSE_COOLDOWN_MS,
  type GlobalDot,
  type GlobalServerMessage,
} from "@/lib/globalPresenceProtocol";

/** How long a departed dot lingers (dimmed) before it disappears. Local only; the server keeps no history. */
export const GHOST_TTL_MS = 20_000;

/** How long a pulse stays in state so its ripple can finish animating. */
export const PULSE_RETENTION_MS = 3_800;

/** Upper bound on simultaneously retained pulses (overlapping bursts never grow state unbounded). */
export const MAX_ACTIVE_PULSES = 24;

export type GhostDot = GlobalDot & { leftAtMs: number };

export type PulseEvent = {
  /** Monotonic per-connection counter — stable React key and haptic de-dupe handle. */
  seq: number;
  id: string;
  lat: number;
  lon: number;
  isSelf: boolean;
  atMs: number;
};

export type GlobalPresenceState = {
  selfId: string | null;
  /** Currently connected, including self. Insertion-ordered. */
  participants: Record<string, GlobalDot>;
  /** Recently departed (never includes self). */
  ghosts: Record<string, GhostDot>;
  pulses: PulseEvent[];
  pulseSeq: number;
  /** Advertised by the server; used to start the local cooldown after our own pulse. */
  pulseCooldownMs: number;
  /** Local-clock deadline; 0 when no cooldown is active. */
  cooldownUntilMs: number;
};

export function createInitialPresenceState(): GlobalPresenceState {
  return {
    selfId: null,
    participants: {},
    ghosts: {},
    pulses: [],
    pulseSeq: 0,
    pulseCooldownMs: DEFAULT_PULSE_COOLDOWN_MS,
    cooldownUntilMs: 0,
  };
}

export type ApplyResult = {
  state: GlobalPresenceState;
  /** Set when this message produced a new visible pulse (callers use it for haptics). */
  pulse: PulseEvent | null;
};

/**
 * Apply one decoded server message.
 *
 * - `snapshot` replaces everything: after a reconnect nothing from the previous session survives
 *   and no pulse is ever replayed.
 * - A `pulse` from an id we do not know is ignored (we would not know where to draw it).
 */
export function applyGlobalMessage(
  state: GlobalPresenceState,
  message: GlobalServerMessage,
  nowMs: number,
): ApplyResult {
  switch (message.type) {
    case "snapshot": {
      const participants: Record<string, GlobalDot> = {};
      for (const dot of message.participants) participants[dot.id] = dot;
      return {
        state: {
          ...createInitialPresenceState(),
          selfId: message.selfId,
          participants,
          pulseCooldownMs: message.pulseCooldownMs,
        },
        pulse: null,
      };
    }

    case "join": {
      const dot = message.participant;
      if (state.participants[dot.id]) {
        return { state: { ...state, participants: { ...state.participants, [dot.id]: dot } }, pulse: null };
      }
      // A dot with a previously-seen id is live again: drop any lingering ghost of it.
      const ghosts = { ...state.ghosts };
      delete ghosts[dot.id];
      return {
        state: { ...state, participants: { ...state.participants, [dot.id]: dot }, ghosts },
        pulse: null,
      };
    }

    case "leave": {
      const dot = state.participants[message.id];
      if (!dot || message.id === state.selfId) return { state, pulse: null };
      const participants = { ...state.participants };
      delete participants[message.id];
      return {
        state: {
          ...state,
          participants,
          ghosts: { ...state.ghosts, [message.id]: { ...dot, leftAtMs: nowMs } },
        },
        pulse: null,
      };
    }

    case "pulse": {
      const dot = state.participants[message.id];
      if (!dot) return { state, pulse: null };
      const isSelf = message.id === state.selfId;
      const seq = state.pulseSeq + 1;
      const pulse: PulseEvent = {
        seq,
        id: dot.id,
        lat: dot.lat,
        lon: dot.lon,
        isSelf,
        atMs: nowMs,
      };
      const pulses = [...state.pulses, pulse].slice(-MAX_ACTIVE_PULSES);
      return {
        state: {
          ...state,
          pulses,
          pulseSeq: seq,
          cooldownUntilMs: isSelf ? nowMs + state.pulseCooldownMs : state.cooldownUntilMs,
        },
        pulse,
      };
    }

    case "cooldown":
      return {
        state: { ...state, cooldownUntilMs: nowMs + message.retryAfterMs },
        pulse: null,
      };
  }
}

/** Drop expired ghosts and pulses and clear an elapsed cooldown. Returns the same object if nothing changed. */
export function expirePresenceState(state: GlobalPresenceState, nowMs: number): GlobalPresenceState {
  let ghosts = state.ghosts;
  for (const [id, ghost] of Object.entries(state.ghosts)) {
    if (nowMs - ghost.leftAtMs >= GHOST_TTL_MS) {
      if (ghosts === state.ghosts) ghosts = { ...state.ghosts };
      delete ghosts[id];
    }
  }

  const livePulses = state.pulses.filter((p) => nowMs - p.atMs < PULSE_RETENTION_MS);
  const pulses = livePulses.length === state.pulses.length ? state.pulses : livePulses;

  const cooldownUntilMs =
    state.cooldownUntilMs !== 0 && nowMs >= state.cooldownUntilMs ? 0 : state.cooldownUntilMs;

  if (ghosts === state.ghosts && pulses === state.pulses && cooldownUntilMs === state.cooldownUntilMs) {
    return state;
  }
  return { ...state, ghosts, pulses, cooldownUntilMs };
}

/** The next moment `expirePresenceState` would change something, or `null` if nothing is pending. */
export function nextExpiryAtMs(state: GlobalPresenceState): number | null {
  let next: number | null = null;
  const consider = (t: number) => {
    if (next === null || t < next) next = t;
  };
  for (const ghost of Object.values(state.ghosts)) consider(ghost.leftAtMs + GHOST_TTL_MS);
  for (const pulse of state.pulses) consider(pulse.atMs + PULSE_RETENTION_MS);
  if (state.cooldownUntilMs !== 0) consider(state.cooldownUntilMs);
  return next;
}

export function isCoolingDown(state: GlobalPresenceState, nowMs: number): boolean {
  return state.cooldownUntilMs !== 0 && nowMs < state.cooldownUntilMs;
}
