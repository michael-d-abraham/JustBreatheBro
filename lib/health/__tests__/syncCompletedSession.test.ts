import { saveMindfulSession } from "@/lib/health/healthService";
import { syncCompletedMindfulSession } from "@/lib/health/syncCompletedSession";

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock("@/lib/health/healthService", () => ({
  saveMindfulSession: jest.fn(),
}));

const mockedSave = saveMindfulSession as jest.MockedFunction<
  typeof saveMindfulSession
>;

describe("syncCompletedMindfulSession", () => {
  beforeEach(() => {
    mockedSave.mockReset();
    mockedSave.mockResolvedValue({ ok: true });
  });

  it("does not write when the user preference is off", async () => {
    const result = await syncCompletedMindfulSession({
      startMs: 1_000,
      endMs: 121_000,
      sessionId: "session-off",
      syncEnabled: false,
    });
    expect(result).toEqual({ ok: false, reason: "disabled" });
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it("forwards actual start/end when enabled", async () => {
    await syncCompletedMindfulSession({
      startMs: 1_000,
      endMs: 121_000,
      sessionId: "session-on",
      syncEnabled: true,
    });
    expect(mockedSave).toHaveBeenCalledWith({
      startDate: new Date(1_000),
      endDate: new Date(121_000),
      sessionId: "session-on",
    });
  });

  it("swallows thrown errors so local completion is not blocked", async () => {
    mockedSave.mockRejectedValueOnce(new Error("boom"));
    const result = await syncCompletedMindfulSession({
      startMs: 1_000,
      endMs: 5_000,
      sessionId: "session-throw",
      syncEnabled: true,
    });
    expect(result).toEqual({ ok: false, reason: "error" });
  });
});
