import { getBreathRoomWsUrl } from "@/lib/breathRoomBackend";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export {
  getBreathRoomApiBaseUrl,
  getBreathRoomWsUrl
} from "@/lib/breathRoomBackend";

/** Server pattern (seconds). From snapshot only. */
export type BreathRoomPattern = {
  inhaleSec: number;
  hold1Sec: number;
  exhaleSec: number;
  hold2Sec: number;
};

export type GlobalRoomPhase = "inhale" | "hold1" | "exhale" | "hold2";

/** Canonical room ids — must match server (see normalizeRoomId / ROOM_PATTERNS). */
export const BREATH_ROOM_DEEP = "deep";
export const BREATH_ROOM_BOX = "box";
export const BREATH_ROOM_EXTENDED_EXHALE = "extended-exhale";

export const BREATH_ROOM_CATALOG = [
  {
    id: BREATH_ROOM_DEEP,
    title: "Deep Rest",
    exerciseLine: "Coherent Breathing 5-0-5-0",
    subtext:
      "A steady shared rhythm to quiet your mind and settle in.",
  },
  {
    id: BREATH_ROOM_BOX,
    title: "Clear Focus",
    exerciseLine: "Box Breathing (4-4-4-4)",
    subtext:
      "A structured rhythm to clear distraction and return to the present.",
  },
  {
    id: BREATH_ROOM_EXTENDED_EXHALE,
    title: "Gentle Unwind",
    exerciseLine: "Extended exhale 4-0-6-0",
    subtext:
      "Longer exhales to let go, soften your body, and unwind.",
  },
] as const;

export type CanonicalBreathRoomId = (typeof BREATH_ROOM_CATALOG)[number]["id"];

export type BreathRoomCatalogEntry = (typeof BREATH_ROOM_CATALOG)[number];

const CANONICAL_ROOM_IDS = new Set<string>(
  BREATH_ROOM_CATALOG.map((o) => o.id),
);

const CATALOG_BY_ID = new Map<CanonicalBreathRoomId, BreathRoomCatalogEntry>(
  BREATH_ROOM_CATALOG.map((e) => [e.id, e]),
);

export function isCanonicalBreathRoomId(
  id: string,
): id is CanonicalBreathRoomId {
  return CANONICAL_ROOM_IDS.has(id);
}

export function getBreathRoomCatalogEntry(
  roomId: string | null | undefined,
): BreathRoomCatalogEntry | null {
  if (typeof roomId !== "string" || !roomId) return null;
  if (!isCanonicalBreathRoomId(roomId)) return null;
  return CATALOG_BY_ID.get(roomId) ?? null;
}

/**
 * GET /api/rooms — returns per-room connection counts (see server ROOM_STATS.md).
 * Always fills deep / box / extended-exhale (defaults 0 if missing in JSON).
 */
export async function fetchBreathRoomStats(
  apiBase: string,
): Promise<Record<CanonicalBreathRoomId, number> | null> {
  const base = apiBase.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/rooms`);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!isRecord(data) || data.type !== "room_stats") return null;
    const roomsRaw = data.rooms;
    if (!isRecord(roomsRaw)) return null;
    const out = {
      [BREATH_ROOM_DEEP]: 0,
      [BREATH_ROOM_BOX]: 0,
      [BREATH_ROOM_EXTENDED_EXHALE]: 0,
    } as Record<CanonicalBreathRoomId, number>;
    for (const row of BREATH_ROOM_CATALOG) {
      const v = roomsRaw[row.id];
      if (typeof v === "number" && Number.isFinite(v)) {
        out[row.id] = Math.max(0, Math.floor(v));
      }
    }
    return out;
  } catch {
    return null;
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function asPhase(s: unknown): GlobalRoomPhase | null {
  if (s === "inhale" || s === "hold1" || s === "exhale" || s === "hold2")
    return s;
  return null;
}

export type GlobalRoomPhaseStepPayload = {
  phase: GlobalRoomPhase;
  phaseDurationMs: number;
  remainingMs: number;
  phaseSeq: number;
  /** First step after connect/reconnect — skip inhale/exhale cue audio (files won't match wall clock). */
  skipBreathCueAudio: boolean;
};

type UseGlobalBreathingRoomOptions = {
  onPhaseStep: (payload: GlobalRoomPhaseStepPayload) => void;
  /** Initial room to join on open (default deep). */
  initialRoomId?: CanonicalBreathRoomId;
  /** Called when the user picks a room (persists across reconnect if parent stores it). */
  onSelectedRoomIdChange?: (room: CanonicalBreathRoomId) => void;
};

export type BreathRoomConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

/** First attempt uses a longer delay so Render cold starts don’t look like failures. */
const INITIAL_CONNECT_BACKOFF_MS = 2000;
const MAX_RECONNECT_BACKOFF_MS = 45000;
const BACKOFF_JITTER_MS = 500;

export function useGlobalBreathingRoom({
  onPhaseStep,
  initialRoomId = BREATH_ROOM_DEEP,
  onSelectedRoomIdChange,
}: UseGlobalBreathingRoomOptions) {
  const onPhaseStepRef = useRef(onPhaseStep);
  onPhaseStepRef.current = onPhaseStep;

  const [connectionState, setConnectionState] =
    useState<BreathRoomConnectionState>("idle");
  const [wsError, setWsError] = useState<string | null>(null);

  const [participantCount, setParticipantCount] = useState(0);
  const [pattern, setPattern] = useState<BreathRoomPattern | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] =
    useState<CanonicalBreathRoomId>(initialRoomId);

  const [phase, setPhase] = useState<GlobalRoomPhase | null>(null);
  const [phaseSeq, setPhaseSeq] = useState<number | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phaseDurationMs, setPhaseDurationMs] = useState(0);
  const [phaseEndsAtMs, setPhaseEndsAtMs] = useState(0);
  const [offsetMs, setOffsetMs] = useState(0);

  const [tick, setTick] = useState(0);

  /** Dedupe phase transitions per room (phaseSeq can repeat across different rooms). */
  const lastHandledRoomPhaseKeyRef = useRef<string | null>(null);
  const lastStepRoomIdForAudioRef = useRef<string | null>(null);
  const selectedRoomRef = useRef<CanonicalBreathRoomId>(initialRoomId);
  selectedRoomRef.current = selectedRoomId;
  const wsRef = useRef<WebSocket | null>(null);
  /** Stops auto-reconnect and closes the socket (user leave or unmount). */
  const haltReconnectRef = useRef<(() => void) | null>(null);
  const handleSnapshotRef = useRef<(payload: Record<string, unknown>) => void>(
    () => {},
  );
  const handlePhasePayloadRef = useRef<
    (payload: Record<string, unknown>) => void
  >(() => {});
  const handlePresenceRef = useRef<(payload: Record<string, unknown>) => void>(
    () => {},
  );
  /** Last known room from server (phase may repeat omit roomId in some builds). */
  const lastServerRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSelectedRoomId(initialRoomId);
    const w = wsRef.current;
    if (w && w.readyState === WebSocket.OPEN) {
      try {
        w.send(JSON.stringify({ type: "join", room: initialRoomId }));
      } catch {
        // ignore
      }
    }
  }, [initialRoomId]);

  const applyServerTime = useCallback((serverTimeMs: unknown) => {
    if (typeof serverTimeMs !== "number" || !Number.isFinite(serverTimeMs))
      return;
    setOffsetMs(serverTimeMs - Date.now());
  }, []);

  const handlePhasePayload = useCallback(
    (payload: Record<string, unknown>) => {
      const ph = asPhase(payload.phase);
      if (!ph) return;

      const pSeq = payload.phaseSeq;
      const pDur = payload.phaseDurationMs;
      const pEnd = payload.phaseEndsAtMs;
      const cIdx = payload.cycleIndex;
      const sTime = payload.serverTimeMs;

      if (typeof pSeq !== "number" || !Number.isFinite(pSeq)) return;
      if (typeof pDur !== "number" || !Number.isFinite(pDur)) return;
      if (typeof pEnd !== "number" || !Number.isFinite(pEnd)) return;
      if (typeof cIdx !== "number" || !Number.isFinite(cIdx)) return;

      const incomingRid =
        typeof payload.roomId === "string" && payload.roomId
          ? payload.roomId
          : null;
      const rId = incomingRid ?? lastServerRoomIdRef.current;
      if (!rId) return;

      lastServerRoomIdRef.current = rId;

      applyServerTime(sTime);

      setRoomId(rId);

      setPhase(ph);
      setPhaseSeq(pSeq);
      setCycleIndex(cIdx);
      setPhaseDurationMs(Math.max(0, pDur));
      setPhaseEndsAtMs(pEnd);

      const roomPhaseKey = `${rId}:${pSeq}`;
      if (lastHandledRoomPhaseKeyRef.current === roomPhaseKey) return;

      const roomChangedForAudio = lastStepRoomIdForAudioRef.current !== rId;
      lastStepRoomIdForAudioRef.current = rId;

      lastHandledRoomPhaseKeyRef.current = roomPhaseKey;

      const off =
        typeof sTime === "number" && Number.isFinite(sTime)
          ? sTime - Date.now()
          : 0;
      const remainingMs = Math.max(0, pEnd - (Date.now() + off));

      onPhaseStepRef.current({
        phase: ph,
        phaseDurationMs: Math.max(0, pDur),
        remainingMs,
        phaseSeq: pSeq,
        skipBreathCueAudio: roomChangedForAudio,
      });
    },
    [applyServerTime],
  );

  const handleSnapshot = useCallback(
    (payload: Record<string, unknown>) => {
      const pat = payload.pattern;
      if (isRecord(pat)) {
        const inh = pat.inhaleSec;
        const h1 = pat.hold1Sec;
        const exh = pat.exhaleSec;
        const h2 = pat.hold2Sec;
        if (
          typeof inh === "number" &&
          typeof h1 === "number" &&
          typeof exh === "number" &&
          typeof h2 === "number"
        ) {
          setPattern({
            inhaleSec: inh,
            hold1Sec: h1,
            exhaleSec: exh,
            hold2Sec: h2,
          });
        }
      }

      const pc = payload.participantCount;
      if (typeof pc === "number" && Number.isFinite(pc)) {
        setParticipantCount(Math.max(0, Math.floor(pc)));
      }

      handlePhasePayload(payload);
    },
    [handlePhasePayload],
  );

  const handlePresence = useCallback(
    (payload: Record<string, unknown>) => {
      applyServerTime(payload.serverTimeMs);
      const rId = payload.roomId;
      if (typeof rId === "string" && rId) {
        lastServerRoomIdRef.current = rId;
        setRoomId(rId);
      }
      const pc = payload.participantCount;
      if (typeof pc === "number" && Number.isFinite(pc)) {
        setParticipantCount(Math.max(0, Math.floor(pc)));
      }
    },
    [applyServerTime],
  );

  handleSnapshotRef.current = handleSnapshot;
  handlePhasePayloadRef.current = handlePhasePayload;
  handlePresenceRef.current = handlePresence;

  const wsUrl = getBreathRoomWsUrl();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let allowReconnect = true;
    let attempt = 0;

    const clearReconnectTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const haltReconnects = () => {
      allowReconnect = false;
      clearReconnectTimer();
    };

    haltReconnectRef.current = () => {
      haltReconnects();
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        try {
          socket.close();
        } catch {
          // ignore
        }
      }
    };

    const scheduleReconnect = () => {
      if (!allowReconnect) return;
      clearReconnectTimer();
      const delay =
        Math.min(
          MAX_RECONNECT_BACKOFF_MS,
          INITIAL_CONNECT_BACKOFF_MS * 2 ** attempt,
        ) +
        Math.random() * BACKOFF_JITTER_MS;
      attempt += 1;
      setConnectionState("reconnecting");
      setWsError("Connection lost — retrying…");
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (!allowReconnect) return;
        connectNow();
      }, delay);
    };

    const sendJoin = (ws: WebSocket, room: string) => {
      try {
        ws.send(JSON.stringify({ type: "join", room }));
      } catch {
        // ignore
      }
    };

    function connectNow() {
      if (!allowReconnect) return;
      clearReconnectTimer();
      if (socket) {
        try {
          socket.close();
        } catch {
          // ignore
        }
        socket = null;
        wsRef.current = null;
      }

      setConnectionState("connecting");

      let s: WebSocket;
      try {
        s = new WebSocket(wsUrl);
      } catch {
        setWsError("Invalid WebSocket URL");
        scheduleReconnect();
        return;
      }

      socket = s;
      wsRef.current = s;

      s.onopen = () => {
        if (!allowReconnect || wsRef.current !== s) return;
        attempt = 0;
        setConnectionState("connected");
        setWsError(null);
        lastHandledRoomPhaseKeyRef.current = null;
        lastStepRoomIdForAudioRef.current = null;
        lastServerRoomIdRef.current = null;
        sendJoin(s, selectedRoomRef.current);
      };

      s.onmessage = (ev) => {
        if (wsRef.current !== s) return;
        const raw = typeof ev.data === "string" ? ev.data : null;
        if (raw == null) return;

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return;
        }
        if (!isRecord(parsed)) return;

        const t = parsed.type;
        if (t === "snapshot") {
          handleSnapshotRef.current(parsed);
          return;
        }
        if (t === "phase") {
          handlePhasePayloadRef.current(parsed);
          return;
        }
        if (t === "presence") {
          handlePresenceRef.current(parsed);
        }
      };

      s.onerror = () => {
        if (wsRef.current !== s) return;
        setWsError("WebSocket error");
      };

      s.onclose = () => {
        if (wsRef.current === s) wsRef.current = null;
        if (socket === s) socket = null;
        if (!allowReconnect) {
          setConnectionState("disconnected");
          return;
        }
        scheduleReconnect();
      };
    }

    setWsError(null);
    lastHandledRoomPhaseKeyRef.current = null;
    lastStepRoomIdForAudioRef.current = null;
    lastServerRoomIdRef.current = null;
    allowReconnect = true;
    attempt = 0;
    connectNow();

    return () => {
      haltReconnects();
      haltReconnectRef.current = null;
      try {
        socket?.close();
      } catch {
        // ignore
      }
      socket = null;
      wsRef.current = null;
    };
  }, [wsUrl]);

  const switchRoom = useCallback(
    (room: CanonicalBreathRoomId) => {
      selectedRoomRef.current = room;
      setSelectedRoomId(room);
      onSelectedRoomIdChange?.(room);
      const w = wsRef.current;
      if (w && w.readyState === WebSocket.OPEN) {
        try {
          w.send(JSON.stringify({ type: "join", room }));
        } catch {
          // ignore
        }
      }
    },
    [onSelectedRoomIdChange],
  );

  useEffect(() => {
    if (connectionState !== "connected") return;
    const id = setInterval(() => setTick((x) => x + 1), 200);
    return () => clearInterval(id);
  }, [connectionState]);

  const remainingMs = useMemo(() => {
    void tick;
    return Math.max(0, phaseEndsAtMs - (Date.now() + offsetMs));
  }, [phaseEndsAtMs, offsetMs, tick]);

  const disconnect = useCallback(() => {
    haltReconnectRef.current?.();
    setConnectionState("disconnected");
  }, []);

  const isConnected = connectionState === "connected";

  return {
    connectionState,
    wsError,
    isConnected,
    participantCount,
    pattern,
    roomId,
    selectedRoomId,
    switchRoom,
    phase,
    phaseSeq,
    cycleIndex,
    phaseDurationMs,
    phaseEndsAtMs,
    remainingMs,
    disconnect,
  };
}
