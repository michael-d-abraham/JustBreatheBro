/**
 * Central config for the Global Room WebSocket.
 *
 * Default (no env): production — wss://api.hellobreathbro.app
 *
 * Override via env when testing:
 * - EXPO_PUBLIC_BREATH_ROOM_WS_URL or EXPO_PUBLIC_WS_URL — full WebSocket URL
 *   (e.g. ws://localhost:8085, ws://10.0.2.2:8085, or a staging wss://… URL)
 *
 * Remove or comment out those in .env when you want the app to use production only.
 */

export const BREATH_ROOM_PRODUCTION_WS_URL = "wss://api.hellobreathbro.app";

/** Suggested value for EXPO_PUBLIC_BREATH_ROOM_WS_URL when testing against a local server. */
export const BREATH_ROOM_DEV_WS_URL = "ws://localhost:8085";

function firstNonEmptyEnvWs(): string | null {
  const candidates = [
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL,
    process.env.EXPO_PUBLIC_WS_URL,
  ];
  for (const u of candidates) {
    if (typeof u !== "string") continue;
    const t = u.trim();
    if (t.length > 0) return t;
  }
  return null;
}

/** Env wins; otherwise always production (not localhost / not Render unless you set env). */
export function getBreathRoomWsUrl(): string {
  return firstNonEmptyEnvWs() ?? BREATH_ROOM_PRODUCTION_WS_URL;
}

/** WebSocket path of the Global Room (presence + pulses) on the same server as the breathing rooms. */
export const GLOBAL_ROOM_WS_PATH = "/global";

/**
 * Full WebSocket URL for the Global Room: the configured base (env override or production) with
 * the `/global` path. Any path or query already on the base URL is replaced, not appended to.
 */
export function getGlobalRoomWsUrl(): string {
  const base = getBreathRoomWsUrl().trim();
  // Plain string handling on purpose: React Native's `URL` does not reliably support setters
  // (`pathname`, `search`) on device, so a URL-based version would behave differently than in Jest.
  const origin = /^(wss?:\/\/[^/?#]+)/i.exec(base)?.[1];
  const root = origin ?? base.replace(/[?#].*$/, "").replace(/\/+$/, "");
  return `${root}${GLOBAL_ROOM_WS_PATH}`;
}