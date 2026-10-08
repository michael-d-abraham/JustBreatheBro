import {
  WORLD_MAP_HEIGHT,
  WORLD_MAP_LAND_PATH,
  WORLD_MAP_LAT_MAX,
  WORLD_MAP_LAT_MIN,
  WORLD_MAP_WIDTH,
} from "@/constants/worldMap";
import { projectToWorldMap, worldMapHeightForWidth } from "@/lib/worldMapProjection";

describe("projectToWorldMap", () => {
  it("maps the map's corners to the unit square", () => {
    expect(projectToWorldMap(WORLD_MAP_LAT_MAX, -180)).toEqual({ x: 0, y: 0 });
    expect(projectToWorldMap(WORLD_MAP_LAT_MIN, 180)).toEqual({ x: 1, y: 1 });
  });

  it("puts the prime meridian horizontally centred and the equator inside the map", () => {
    const origin = projectToWorldMap(0, 0);
    expect(origin.x).toBeCloseTo(0.5, 10);
    expect(origin.y).toBeCloseTo(WORLD_MAP_LAT_MAX / WORLD_MAP_HEIGHT, 10);
    expect(origin.y).toBeGreaterThan(0);
    expect(origin.y).toBeLessThan(1);
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
  it("preserves the outline's aspect ratio", () => {
    expect(worldMapHeightForWidth(WORLD_MAP_WIDTH)).toBe(WORLD_MAP_HEIGHT);
    expect(worldMapHeightForWidth(720)).toBe(WORLD_MAP_HEIGHT * 2);
  });
});

describe("WORLD_MAP_LAND_PATH (generated data sanity)", () => {
  it("is a closed-polygon SVG path using only simple commands", () => {
    expect(WORLD_MAP_LAND_PATH.length).toBeGreaterThan(10_000);
    expect(WORLD_MAP_LAND_PATH.startsWith("M")).toBe(true);
    expect(WORLD_MAP_LAND_PATH.endsWith("Z")).toBe(true);
    expect(WORLD_MAP_LAND_PATH).toMatch(/^[MLZ0-9.\- ]+$/);
  });

  it("keeps every coordinate inside the declared canvas", () => {
    const numbers = WORLD_MAP_LAND_PATH.match(/-?\d+(\.\d+)?/g)!.map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      expect(numbers[i]).toBeGreaterThanOrEqual(0);
      expect(numbers[i]).toBeLessThanOrEqual(WORLD_MAP_WIDTH);
      expect(numbers[i + 1]).toBeGreaterThanOrEqual(0);
      expect(numbers[i + 1]).toBeLessThanOrEqual(WORLD_MAP_HEIGHT);
    }
    expect(numbers.length % 2).toBe(0);
  });
});
