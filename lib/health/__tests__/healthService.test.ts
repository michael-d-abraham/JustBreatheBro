/**
 * Behavioral tests for lib/health/healthService.ts.
 *
 * Native HealthKit is mocked so Jest never loads Nitro. Platform.OS is
 * switched per test to cover iOS vs Android.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require(
      "@react-native-async-storage/async-storage/jest/async-storage-mock",
    ),
);

jest.mock("@kingstinct/react-native-healthkit", () => ({
  isHealthDataAvailable: jest.fn(() => true),
  requestAuthorization: jest.fn(async () => true),
  authorizationStatusFor: jest.fn(() => 2),
  saveCategorySample: jest.fn(async () => ({ uuid: "hk-sample" })),
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import * as HealthKit from "@kingstinct/react-native-healthkit";
import {
  createMindfulSessionId,
  getMindfulSessionWriteStatus,
  isHealthAvailable,
  isValidMindfulInterval,
  MINDFUL_SESSION_TYPE,
  requestHealthAuthorization,
  saveMindfulSession,
} from "@/lib/health/healthService";

const isHealthDataAvailable =
  HealthKit.isHealthDataAvailable as jest.MockedFunction<
    () => boolean
  >;
const requestAuthorization =
  HealthKit.requestAuthorization as unknown as jest.MockedFunction<
    (opts: { toShare?: readonly string[] }) => Promise<boolean>
  >;
const authorizationStatusFor =
  HealthKit.authorizationStatusFor as unknown as jest.MockedFunction<
    (type: string) => number
  >;
const saveCategorySample =
  HealthKit.saveCategorySample as unknown as jest.MockedFunction<
    (
      identifier: string,
      value: number,
      startDate: Date,
      endDate: Date,
      metadata?: Record<string, string | number>,
    ) => Promise<unknown>
  >;

describe("lib/health/healthService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    (Platform as { OS: string }).OS = "ios";
    isHealthDataAvailable.mockReset();
    isHealthDataAvailable.mockReturnValue(true);
    requestAuthorization.mockReset();
    requestAuthorization.mockResolvedValue(true);
    authorizationStatusFor.mockReset();
    authorizationStatusFor.mockReturnValue(2);
    saveCategorySample.mockReset();
    saveCategorySample.mockResolvedValue({ uuid: "hk-sample" });
  });

  describe("isValidMindfulInterval", () => {
    it("accepts an interval with end after start", () => {
      const start = new Date("2026-01-01T10:00:00.000Z");
      const end = new Date("2026-01-01T10:02:00.000Z");
      expect(isValidMindfulInterval(start, end)).toBe(true);
    });

    it("rejects equal start and end", () => {
      const t = new Date("2026-01-01T10:00:00.000Z");
      expect(isValidMindfulInterval(t, t)).toBe(false);
    });

    it("rejects end before start", () => {
      const start = new Date("2026-01-01T10:02:00.000Z");
      const end = new Date("2026-01-01T10:00:00.000Z");
      expect(isValidMindfulInterval(start, end)).toBe(false);
    });
  });

  describe("createMindfulSessionId", () => {
    it("returns a non-empty unique-looking id", () => {
      const a = createMindfulSessionId();
      const b = createMindfulSessionId();
      expect(a.length).toBeGreaterThan(8);
      expect(a).not.toBe(b);
    });
  });

  describe("Android", () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = "android";
    });

    it("reports HealthKit unavailable", () => {
      expect(isHealthAvailable()).toBe(false);
      expect(getMindfulSessionWriteStatus()).toBe("unavailable");
    });

    it("does not request native authorization", async () => {
      const status = await requestHealthAuthorization();
      expect(status).toBe("unavailable");
      expect(requestAuthorization).not.toHaveBeenCalled();
    });

    it("does not write a mindful session", async () => {
      const result = await saveMindfulSession({
        startDate: new Date("2026-01-01T10:00:00.000Z"),
        endDate: new Date("2026-01-01T10:02:00.000Z"),
        sessionId: "session-1",
      });
      expect(result).toEqual({ ok: false, reason: "unavailable" });
      expect(saveCategorySample).not.toHaveBeenCalled();
    });
  });

  describe("iOS", () => {
    it("is available when HealthKit reports true", () => {
      expect(isHealthAvailable()).toBe(true);
    });

    it("is unavailable when HealthKit reports false", () => {
      isHealthDataAvailable.mockReturnValue(false);
      expect(isHealthAvailable()).toBe(false);
    });

    it("requests write-only Mindful Session authorization", async () => {
      const status = await requestHealthAuthorization();
      expect(requestAuthorization).toHaveBeenCalledWith({
        toShare: [MINDFUL_SESSION_TYPE],
      });
      expect(status).toBe("authorized");
    });

    it("maps denied write status", () => {
      authorizationStatusFor.mockReturnValue(1);
      expect(getMindfulSessionWriteStatus()).toBe("denied");
    });

    it("maps notDetermined write status", () => {
      authorizationStatusFor.mockReturnValue(0);
      expect(getMindfulSessionWriteStatus()).toBe("notDetermined");
    });

    it("writes actual start/end as a mindful session", async () => {
      const startDate = new Date("2026-01-01T10:00:00.000Z");
      const endDate = new Date("2026-01-01T10:02:32.000Z");
      const result = await saveMindfulSession({
        startDate,
        endDate,
        sessionId: "session-actual",
      });
      expect(result).toEqual({ ok: true });
      expect(saveCategorySample).toHaveBeenCalledWith(
        MINDFUL_SESSION_TYPE,
        0,
        startDate,
        endDate,
        {
          HKSyncIdentifier: "session-actual",
          HKSyncVersion: 1,
        },
      );
    });

    it("skips invalid intervals without calling HealthKit", async () => {
      const t = new Date("2026-01-01T10:00:00.000Z");
      const result = await saveMindfulSession({
        startDate: t,
        endDate: t,
        sessionId: "session-zero",
      });
      expect(result).toEqual({ ok: false, reason: "invalid-interval" });
      expect(saveCategorySample).not.toHaveBeenCalled();
    });

    it("does not write the same sessionId twice", async () => {
      const startDate = new Date("2026-01-01T10:00:00.000Z");
      const endDate = new Date("2026-01-01T10:02:00.000Z");
      const first = await saveMindfulSession({
        startDate,
        endDate,
        sessionId: "session-dup",
      });
      const second = await saveMindfulSession({
        startDate,
        endDate: new Date("2026-01-01T10:03:00.000Z"),
        sessionId: "session-dup",
      });
      expect(first).toEqual({ ok: true });
      expect(second).toEqual({ ok: false, reason: "duplicate" });
      expect(saveCategorySample).toHaveBeenCalledTimes(1);
    });

    it("returns error without marking duplicate when native save throws", async () => {
      saveCategorySample.mockRejectedValueOnce(new Error("hk failed"));
      const startDate = new Date("2026-01-01T10:00:00.000Z");
      const endDate = new Date("2026-01-01T10:02:00.000Z");
      const first = await saveMindfulSession({
        startDate,
        endDate,
        sessionId: "session-retry",
      });
      expect(first).toEqual({ ok: false, reason: "error" });

      saveCategorySample.mockResolvedValueOnce({ uuid: "hk-sample" });
      const retry = await saveMindfulSession({
        startDate,
        endDate,
        sessionId: "session-retry",
      });
      expect(retry).toEqual({ ok: true });
      expect(saveCategorySample).toHaveBeenCalledTimes(2);
    });
  });
});
