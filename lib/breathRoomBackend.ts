/**
 * Central config for Breathe Together (shared WebSocket + HTTP stats).
 *
 * Default (no env): production — wss://api.hellobreathbro.app
 *
 * Override via env when testing:
 * - EXPO_PUBLIC_BREATH_ROOM_WS_URL or EXPO_PUBLIC_WS_URL — full WebSocket URL
 *   (e.g. ws://localhost:8085, ws://10.0.2.2:8085, or a staging wss://… URL)
 * - EXPO_PUBLIC_API_BASE_URL — HTTP origin for GET /api/rooms (no trailing slash)
 *
 * Remove or comment out those in .env when you want the app to use production only.
 */

export const BREATH_ROOM_PRODUCTION_WS_URL = "wss://api.hellobreathbro.app";
export const BREATH_ROOM_PRODUCTION_API_BASE_URL =
  "https://api.hellobreathbro.app";

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

/**
 * HTTP origin for GET /api/rooms (no trailing slash).
 * Uses EXPO_PUBLIC_API_BASE_URL if set; otherwise derives scheme from the WebSocket URL;
 * if parsing fails, uses the production API host.
 */
export function getBreathRoomApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof explicit === "string") {
    const t = explicit.trim().replace(/\/$/, "");
    if (t.length > 0) return t;
  }
  const ws = getBreathRoomWsUrl();
  try {
    const u = new URL(ws);
    u.protocol = u.protocol === "wss:" ? "https:" : "http:";
    u.pathname = "";
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return BREATH_ROOM_PRODUCTION_API_BASE_URL.replace(/\/$/, "");
  }
}
