import { Platform } from "react-native";
import {
  getAppleHealthLastSessionId,
  saveAppleHealthLastSessionId,
} from "@/lib/storage";

/** Matches HealthKit `HKAuthorizationStatus` write values. */
const SHARING_NOT_DETERMINED = 0;
const SHARING_DENIED = 1;
const SHARING_AUTHORIZED = 2;

export const MINDFUL_SESSION_TYPE = "HKCategoryTypeIdentifierMindfulSession";

export type HealthWriteStatus =
  | "unavailable"
  | "notDetermined"
  | "denied"
  | "authorized";

export type SaveMindfulSessionInput = {
  startDate: Date;
  endDate: Date;
  sessionId: string;
};

export type SaveMindfulSessionResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "invalid-interval" | "duplicate" | "error" };

type HealthKitNative = {
  isHealthDataAvailable?: () => boolean;
  requestAuthorization?: (opts: {
    toShare?: readonly string[];
    toRead?: readonly string[];
  }) => Promise<boolean>;
  authorizationStatusFor?: (type: string) => number;
  saveCategorySample?: (
    identifier: string,
    value: number,
    startDate: Date,
    endDate: Date,
    metadata?: Record<string, string | number>,
  ) => Promise<unknown>;
};

function loadNative(): HealthKitNative | null {
  if (Platform.OS !== "ios") return null;
  try {
    // Native module is iOS-only; keep require behind the Platform.OS guard.
    return require("@kingstinct/react-native-healthkit") as HealthKitNative;
  } catch {
    return null;
  }
}

export function createMindfulSessionId(): string {
  const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isValidMindfulInterval(startDate: Date, endDate: Date): boolean {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return Number.isFinite(start) && Number.isFinite(end) && end > start;
}

export function isHealthAvailable(): boolean {
  if (Platform.OS !== "ios") return false;
  const native = loadNative();
  try {
    return native?.isHealthDataAvailable?.() === true;
  } catch {
    return false;
  }
}

function mapWriteStatus(raw: number | undefined): HealthWriteStatus {
  if (raw === SHARING_AUTHORIZED) return "authorized";
  if (raw === SHARING_DENIED) return "denied";
  if (raw === SHARING_NOT_DETERMINED) return "notDetermined";
  return "notDetermined";
}

export function getMindfulSessionWriteStatus(): HealthWriteStatus {
  if (!isHealthAvailable()) return "unavailable";
  const native = loadNative();
  try {
    return mapWriteStatus(native?.authorizationStatusFor?.(MINDFUL_SESSION_TYPE));
  } catch {
    return "unavailable";
  }
}

export async function requestHealthAuthorization(): Promise<HealthWriteStatus> {
  if (!isHealthAvailable()) return "unavailable";
  const native = loadNative();
  try {
    await native?.requestAuthorization?.({
      toShare: [MINDFUL_SESSION_TYPE],
    });
    return getMindfulSessionWriteStatus();
  } catch {
    return getMindfulSessionWriteStatus();
  }
}

export async function saveMindfulSession(
  input: SaveMindfulSessionInput,
): Promise<SaveMindfulSessionResult> {
  if (!isHealthAvailable()) {
    return { ok: false, reason: "unavailable" };
  }
  if (!isValidMindfulInterval(input.startDate, input.endDate)) {
    return { ok: false, reason: "invalid-interval" };
  }
  if (!input.sessionId) {
    return { ok: false, reason: "invalid-interval" };
  }

  const lastId = await getAppleHealthLastSessionId();
  if (lastId && lastId === input.sessionId) {
    return { ok: false, reason: "duplicate" };
  }

  const native = loadNative();
  if (!native?.saveCategorySample) {
    return { ok: false, reason: "error" };
  }
  try {
    await native.saveCategorySample(
      MINDFUL_SESSION_TYPE,
      0,
      input.startDate,
      input.endDate,
      {
        HKSyncIdentifier: input.sessionId,
        HKSyncVersion: 1,
      },
    );
    await saveAppleHealthLastSessionId(input.sessionId);
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}
