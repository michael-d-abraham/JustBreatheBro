import * as Sentry from "@sentry/react-native";
import {
  saveMindfulSession,
  type SaveMindfulSessionResult,
} from "@/lib/health/healthService";

type SyncArgs = {
  startMs: number;
  endMs: number;
  sessionId: string;
  syncEnabled: boolean;
};

function isDev(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

function reportHealthKitIssue(
  message: string,
  extra?: Record<string, string | number | boolean>,
) {
  if (isDev()) {
    console.warn("[Apple Health]", message, extra ?? "");
  }
  Sentry.addBreadcrumb({
    category: "healthkit",
    message,
    level: "warning",
    data: extra,
  });
}

/**
 * Side effect after a local session already completed. Never throws to the
 * caller — HealthKit must not block navigation or local teardown.
 */
export async function syncCompletedMindfulSession(
  args: SyncArgs,
): Promise<SaveMindfulSessionResult | { ok: false; reason: "disabled" }> {
  if (!args.syncEnabled) {
    return { ok: false, reason: "disabled" };
  }

  try {
    const result = await saveMindfulSession({
      startDate: new Date(args.startMs),
      endDate: new Date(args.endMs),
      sessionId: args.sessionId,
    });
    if (!result.ok && result.reason === "error") {
      reportHealthKitIssue("Mindful session write failed", {
        elapsed_seconds: Math.floor((args.endMs - args.startMs) / 1000),
      });
    }
    return result;
  } catch (error) {
    reportHealthKitIssue("Mindful session write threw", {
      elapsed_seconds: Math.floor((args.endMs - args.startMs) / 1000),
    });
    if (isDev()) {
      console.warn("[Apple Health]", error);
    }
    return { ok: false, reason: "error" };
  }
}
