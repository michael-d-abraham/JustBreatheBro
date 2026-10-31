import {
  breathGuideDotCount,
  filledAfterExhalePulses,
  fullPhasePulseDelaysMs,
  phaseDurationSeconds,
} from "@/lib/breathingPhaseDots";
import {
  buildPhasePulseDelaysMs,
  filledCountAtElapsedMs,
} from "@/lib/breathingHapticsResolve";

const pattern = { inhale: 4, hold1: 2, exhale: 6, hold2: 0 };

describe("phaseDurationSeconds", () => {
  it("maps each phase to the exercise seconds", () => {
    expect(phaseDurationSeconds("inhale", pattern)).toBe(4);
    expect(phaseDurationSeconds("hold1", pattern)).toBe(2);
    expect(phaseDurationSeconds("exhale", pattern)).toBe(6);
    expect(phaseDurationSeconds("hold2", pattern)).toBe(0);
    expect(phaseDurationSeconds("idle", pattern)).toBe(0);
  });
});

describe("fullPhasePulseDelaysMs", () => {
  it("matches production 4s inhale (800ms target → five evenly spaced beats)", () => {
    const delays = fullPhasePulseDelaysMs(4);
    expect(delays).toEqual([0, 800, 1600, 2400, 3200]);
    expect(filledCountAtElapsedMs(delays, 0)).toBe(1);
    expect(filledCountAtElapsedMs(delays, 799)).toBe(1);
    expect(filledCountAtElapsedMs(delays, 800)).toBe(2);
    expect(filledCountAtElapsedMs(delays, 3200)).toBe(5);
  });
});

describe("breathGuideDotCount", () => {
  it("uses the larger inhale/exhale pulse count for the row width", () => {
    expect(breathGuideDotCount(pattern)).toBe(
      Math.max(
        fullPhasePulseDelaysMs(pattern.inhale).length,
        fullPhasePulseDelaysMs(pattern.exhale).length,
      ),
    );
  });
});

describe("filledAfterExhalePulses", () => {
  it("steps down from peak as exhale beats fire", () => {
    expect(filledAfterExhalePulses(5, 0)).toBe(5);
    expect(filledAfterExhalePulses(5, 1)).toBe(4);
    expect(filledAfterExhalePulses(5, 5)).toBe(0);
    expect(filledAfterExhalePulses(5, 8)).toBe(0);
  });
});

describe("buildPhasePulseDelaysMs resumeMidPhase", () => {
  it("schedules remaining beats from zero when resuming", () => {
    expect(
      buildPhasePulseDelaysMs({
        durationMs: 2000,
        targetIntervalMs: 1000,
        toleranceMs: 50,
        resumeMidPhase: true,
      }),
    ).toEqual([0, 1000]);
  });
});
