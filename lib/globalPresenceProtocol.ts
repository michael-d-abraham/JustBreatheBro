/**
 * Global Room wire protocol (client side). Mirrors the server spec:
 * breatheAppWebSocketBackEnd → server/GLOBAL_PRESENCE.md
 *
 * Everything the server sends is untrusted input: decode defensively and drop anything that does
 * not match, so a malformed frame can never throw or corrupt UI state.
 */

/** A participant as the server shares it: an ephemeral id and a coarse point. Nothing else. */
export type GlobalDot = {
  id: string;
  lat: number;
  lon: number;
};

export type GlobalSnapshotMessage = {
  type: "snapshot";
  selfId: string;
  pulseCooldownMs: number;
  participants: GlobalDot[];
  serverTimeMs: number;
};

export type GlobalJoinMessage = { type: "join"; participant: GlobalDot };
export type GlobalLeaveMessage = { type: "leave"; id: string };
export type GlobalPulseMessage = { type: "pulse"; id: string; serverTimeMs: number };
export type GlobalCooldownMessage = { type: "cooldown"; retryAfterMs: number };

export type GlobalServerMessage =
  | GlobalSnapshotMessage
  | GlobalJoinMessage
  | GlobalLeaveMessage
  | GlobalPulseMessage
  | GlobalCooldownMessage;

/** The only message the client ever sends. */
export const GLOBAL_PULSE_REQUEST = JSON.stringify({ type: "pulse" });

/** Used when a snapshot omits or mangles the advertised cooldown. */
export const DEFAULT_PULSE_COOLDOWN_MS = 5000;

const MAX_ID_LENGTH = 64;
const MAX_PARTICIPANTS = 2000;
const MAX_COOLDOWN_MS = 60_000;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isId(x: unknown): x is string {
  return typeof x === "string" && x.length > 0 && x.length <= MAX_ID_LENGTH;
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function decodeDot(x: unknown): GlobalDot | null {
  if (!isRecord(x)) return null;
  const { id, lat, lon } = x;
  if (!isId(id)) return null;
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) return null;
  if (!isFiniteNumber(lon) || lon < -180 || lon > 180) return null;
  // Rebuild so extra fields from a future/hostile server can never leak into state.
  return { id, lat, lon };
}

function clampCooldown(ms: unknown, fallback: number): number {
  if (!isFiniteNumber(ms) || ms < 0) return fallback;
  return Math.min(ms, MAX_COOLDOWN_MS);
}

/**
 * Parse one WebSocket frame. Returns `null` for anything that is not a well-formed Global Room
 * message (wrong type, bad JSON, out-of-range coordinates, non-string frames, …).
 */
export function decodeGlobalMessage(raw: unknown): GlobalServerMessage | null {
  if (typeof raw !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;

  switch (parsed.type) {
    case "snapshot": {
      if (!isId(parsed.selfId)) return null;
      if (!Array.isArray(parsed.participants)) return null;
      const seen = new Set<string>();
      const participants: GlobalDot[] = [];
      for (const entry of parsed.participants.slice(0, MAX_PARTICIPANTS)) {
        const dot = decodeDot(entry);
        if (dot && !seen.has(dot.id)) {
          seen.add(dot.id);
          participants.push(dot);
        }
      }
      return {
        type: "snapshot",
        selfId: parsed.selfId,
        pulseCooldownMs: clampCooldown(parsed.pulseCooldownMs, DEFAULT_PULSE_COOLDOWN_MS),
        participants,
        serverTimeMs: isFiniteNumber(parsed.serverTimeMs) ? parsed.serverTimeMs : 0,
      };
    }
    case "join": {
      const participant = decodeDot(parsed.participant);
      return participant ? { type: "join", participant } : null;
    }
    case "leave":
      return isId(parsed.id) ? { type: "leave", id: parsed.id } : null;
    case "pulse":
      return isId(parsed.id)
        ? {
            type: "pulse",
            id: parsed.id,
            serverTimeMs: isFiniteNumber(parsed.serverTimeMs) ? parsed.serverTimeMs : 0,
          }
        : null;
    case "cooldown": {
      if (!isFiniteNumber(parsed.retryAfterMs) || parsed.retryAfterMs <= 0) return null;
      return { type: "cooldown", retryAfterMs: clampCooldown(parsed.retryAfterMs, DEFAULT_PULSE_COOLDOWN_MS) };
    }
    default:
      return null;
  }
}
