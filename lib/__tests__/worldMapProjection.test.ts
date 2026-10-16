import {
  WORLD_MAP_HEIGHT,
  WORLD_MAP_LAND_DOTS,
  WORLD_MAP_LAT_MAX,
  WORLD_MAP_LAT_MIN,
  WORLD_MAP_WIDTH,
} from "@/constants/worldMap";
import { projectToWorldMap, worldMapHeightForWidth } from "@/lib/worldMapProjection";

describe("projectToWorldMap", () => {
  it("returns normalized coordinates inside the unit square", () => {
    for (const [lat, lon] of [
      [WORLD_MAP_LAT_MAX, -180],
      [WORLD_MAP_LAT_MIN, 180],
      [0, 0],
      [35.7, 139.7],
      [40.7, -74],
      [-33.9, 151.2],
    ] as const) {
      const p = projectToWorldMap(lat, lon);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
  });

  it("is monotonic: east moves right, north moves up", () => {
    expect(projectToWorldMap(0, 40).x).toBeGreaterThan(projectToWorldMap(0, -40).x);
    expect(projectToWorldMap(50, 0).y).toBeLessThan(projectToWorldMap(-30, 0).y);
  });

  it("places well-known cities in plausible spots", () => {
    const tokyo = projectToWorldMap(35.7, 139.7);
    const nyc = projectToWorldMap(40.7, -74);
    const sydney = projectToWorldMap(-33.9, 151.2);
    expect(tokyo.x).toBeGreaterThan(nyc.x);
    expect(sydney.y).toBeGreaterThan(tokyo.y);
    expect(sydney.x).toBeGreaterThan(tokyo.x);
  });

  it("clamps out-of-range coordinates so a dot can never leave the map", () => {
    for (const [lat, lon] of [
      [999, 999],
      [-999, -999],
      [90, 180],
      [-90, -180],
    ]) {
      const p = projectToWorldMap(lat, lon);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
  });

  it("treats non-finite input as 0 rather than producing NaN", () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const p = projectToWorldMap(bad, bad);
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });
});

describe("worldMapHeightForWidth", () => {
  it("preserves the map aspect ratio", () => {
    expect(worldMapHeightForWidth(WORLD_MAP_WIDTH)).toBe(WORLD_MAP_HEIGHT);
    expect(worldMapHeightForWidth(WORLD_MAP_WIDTH / 2)).toBe(WORLD_MAP_HEIGHT / 2);
  });
});

describe("WORLD_MAP_LAND_DOTS (generated data sanity)", () => {
  it("has an even-length flat coordinate array with thousands of land points", () => {
    expect(WORLD_MAP_LAND_DOTS.length % 2).toBe(0);
    expect(WORLD_MAP_LAND_DOTS.length).toBeGreaterThan(2500);
  });

  it("keeps every land dot inside the declared canvas", () => {
    for (let i = 0; i < WORLD_MAP_LAND_DOTS.length; i += 2) {
      const x = WORLD_MAP_LAND_DOTS[i];
      const y = WORLD_MAP_LAND_DOTS[i + 1];
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(WORLD_MAP_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(WORLD_MAP_HEIGHT);
    }
  });
});
