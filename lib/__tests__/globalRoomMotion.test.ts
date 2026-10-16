import { GHOST_TTL_MS } from "@/lib/globalPresenceState";
import {
  GLOW_DOT_SWELL,
  GLOW_HALO_PEAK_OPACITY,
  RIPPLE_MAX_SCALE,
  RIPPLE_MIN_SCALE,
  RIPPLE_PEAK_OPACITY_OTHER,
  RIPPLE_PEAK_OPACITY_SELF,
  RIPPLE_REDUCED_MS,
  RIPPLE_REDUCED_SCALE,
  RIPPLE_MS,
  ghostFade,
  glowFrame,
  glowOutMs,
  rippleDurationMs,
  rippleFrame,
} from "@/lib/globalRoomMotion";

describe("rippleFrame", () => {
  it("starts small and visible, ends large and invisible", () => {
    const start = rippleFrame(0, false, false);
    const end = rippleFrame(1, false, false);
    expect(start.scale).toBeCloseTo(RIPPLE_MIN_SCALE);
    expect(start.opacity).toBeCloseTo(RIPPLE_PEAK_OPACITY_OTHER);
    expect(end.scale).toBeCloseTo(RIPPLE_MIN_SCALE + RIPPLE_MAX_SCALE);
    expect(end.opacity).toBe(0);
  });

  it("expands and fades monotonically", () => {
    let prev = rippleFrame(0, false, false);
    for (let p = 0.1; p <= 1.0001; p += 0.1) {
      const f = rippleFrame(p, false, false);
      expect(f.scale).toBeGreaterThan(prev.scale);
      expect(f.opacity).toBeLessThan(prev.opacity);
      prev = f;
    }
  });

  it("makes your own ripple stronger than others'", () => {
    expect(rippleFrame(0, true, false).opacity).toBeCloseTo(RIPPLE_PEAK_OPACITY_SELF);
    expect(rippleFrame(0.3, true, false).opacity).toBeGreaterThan(
      rippleFrame(0.3, false, false).opacity,
    );
  });

  it("clamps progress outside [0, 1]", () => {
    expect(rippleFrame(-1, false, false)).toEqual(rippleFrame(0, false, false));
    expect(rippleFrame(5, false, false)).toEqual(rippleFrame(1, false, false));
  });

  it("under Reduce Motion does not travel: constant scale, still fades", () => {
    const a = rippleFrame(0, false, true);
    const b = rippleFrame(0.9, false, true);
    expect(a.scale).toBe(RIPPLE_REDUCED_SCALE);
    expect(b.scale).toBe(RIPPLE_REDUCED_SCALE);
    expect(b.opacity).toBeLessThan(a.opacity);
  });

  it("is shorter under Reduce Motion", () => {
    expect(rippleDurationMs(false)).toBe(RIPPLE_MS);
    expect(rippleDurationMs(true)).toBe(RIPPLE_REDUCED_MS);
    expect(RIPPLE_REDUCED_MS).toBeLessThan(RIPPLE_MS);
  });
});

describe("glowFrame", () => {
  it("is at rest when glow is 0", () => {
    const f = glowFrame(0, 0.8, false);
    expect(f.dotOpacity).toBeCloseTo(0.8);
    expect(f.dotScale).toBe(1);
    expect(f.haloOpacity).toBe(0);
  });

  it("peaks at full opacity with a swelling dot and a visible halo", () => {
    const f = glowFrame(1, 0.8, false);
    expect(f.dotOpacity).toBe(1);
    expect(f.dotScale).toBeCloseTo(1 + GLOW_DOT_SWELL);
    expect(f.haloOpacity).toBeCloseTo(GLOW_HALO_PEAK_OPACITY);
  });

  it("never dims the dot below its resting opacity", () => {
    for (let g = 0; g <= 1; g += 0.1) {
      expect(glowFrame(g, 0.8, false).dotOpacity).toBeGreaterThanOrEqual(0.8 - 1e-9);
    }
  });

  it("keeps an always-opaque dot (yours) opaque", () => {
    expect(glowFrame(0.5, 1, false).dotOpacity).toBe(1);
  });

  it("under Reduce Motion brightens but never moves or resizes", () => {
    const f = glowFrame(1, 0.8, true);
    expect(f.dotScale).toBe(1);
    expect(f.haloScale).toBe(1);
    expect(f.dotOpacity).toBe(1);
    expect(f.haloOpacity).toBeGreaterThan(0);
    expect(glowOutMs(true)).toBeLessThan(glowOutMs(false));
  });

  it("clamps glow outside [0, 1]", () => {
    expect(glowFrame(-2, 0.8, false)).toEqual(glowFrame(0, 0.8, false));
    expect(glowFrame(9, 0.8, false)).toEqual(glowFrame(1, 0.8, false));
  });
});

describe("ghostFade", () => {
  it("starts from the full ghost opacity and lasts the whole TTL when it has just left", () => {
    const f = ghostFade(1_000, 1_000, 0.35);
    expect(f.startOpacity).toBeCloseTo(0.35);
    expect(f.remainingMs).toBe(GHOST_TTL_MS);
  });

  it("resumes mid-fade for a ghost that mounts late, in proportion to time left", () => {
    const f = ghostFade(0, GHOST_TTL_MS / 2, 0.4);
    expect(f.remainingMs).toBe(GHOST_TTL_MS / 2);
    expect(f.startOpacity).toBeCloseTo(0.2);
  });

  it("ends exactly when the state machine drops the ghost", () => {
    const left = 5_000;
    const now = 9_000;
    const f = ghostFade(left, now, 0.35);
    expect(now + f.remainingMs).toBe(left + GHOST_TTL_MS);
  });

  it("is fully gone once expired and never negative", () => {
    const f = ghostFade(0, GHOST_TTL_MS * 3, 0.35);
    expect(f.remainingMs).toBe(0);
    expect(f.startOpacity).toBe(0);
  });

  it("clamps a clock that is behind the departure time", () => {
    const f = ghostFade(10_000, 0, 0.35);
    expect(f.remainingMs).toBe(GHOST_TTL_MS);
    expect(f.startOpacity).toBeCloseTo(0.35);
  });
});
