import {
  GLOBAL_ROOM_DOT_SIZE,
  GLOBAL_ROOM_MAP_MAX_SCALE,
  GLOBAL_ROOM_MAP_MIN_SCALE,
  GLOBAL_ROOM_MAP_REFERENCE_WIDTH,
} from "@/components/globalRoomTokens";
import { WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH } from "@/constants/worldMap";
import { fitMapWidth, mapScale, markBox } from "@/lib/globalRoomLayout";
import { worldMapHeightForWidth } from "@/lib/worldMapProjection";

const centre = (b: { left: number; top: number; size: number }) => ({
  x: b.left + b.size / 2,
  y: b.top + b.size / 2,
});

describe("fitMapWidth", () => {
  it("uses the full available width on a portrait phone", () => {
    expect(fitMapWidth(366, 600)).toBe(366);
  });

  it("is limited by height so a short landscape area keeps the map's aspect ratio", () => {
    const w = fitMapWidth(800, 100);
    expect(w).toBeLessThan(800);
    expect(worldMapHeightForWidth(w)).toBeLessThanOrEqual(100);
    // …and not by more than a pixel of flooring.
    expect(worldMapHeightForWidth(w + 1)).toBeGreaterThan(100 - 1e-9);
  });

  it("uses full width on large screens when height allows", () => {
    expect(fitMapWidth(2000, 2000)).toBe(2000);
  });

  it("never returns a negative or non-finite size for degenerate areas", () => {
    expect(fitMapWidth(0, 0)).toBe(0);
    expect(fitMapWidth(-50, 300)).toBe(0);
    expect(fitMapWidth(300, -50)).toBe(0);
  });
});

describe("mapScale", () => {
  it("is 1 at the reference width", () => {
    expect(mapScale(GLOBAL_ROOM_MAP_REFERENCE_WIDTH)).toBe(1);
  });

  it("clamps for very small and very large maps", () => {
    expect(mapScale(10)).toBe(GLOBAL_ROOM_MAP_MIN_SCALE);
    expect(mapScale(10_000)).toBe(GLOBAL_ROOM_MAP_MAX_SCALE);
  });

  it("grows monotonically between the clamps", () => {
    expect(mapScale(400)).toBeGreaterThan(mapScale(340));
  });
});

describe("markBox", () => {
  it("centres the mark on the projected coordinate", () => {
    const width = 360; // 1 canvas unit per px, scale 1
    const c = centre(markBox(0, 0, width, GLOBAL_ROOM_DOT_SIZE));
    // Lon 0 is the middle of the canvas; lat 0 sits (LAT_MAX / HEIGHT) down from the top.
    expect(c.x).toBeCloseTo(width / 2, 6);
    expect(c.y).toBeGreaterThan(0);
    expect(c.y).toBeLessThan(worldMapHeightForWidth(width));
  });

  it("places east to the right of west and north above south", () => {
    const tokyo = centre(markBox(35.7, 139.7, 360, 7));
    const london = centre(markBox(51.5, -0.1, 360, 7));
    const sydney = centre(markBox(-33.9, 151.2, 360, 7));
    expect(tokyo.x).toBeGreaterThan(london.x);
    expect(london.y).toBeLessThan(tokyo.y);
    expect(sydney.y).toBeGreaterThan(tokyo.y);
  });

  it("keeps a coordinate at the same fraction of the map at every width", () => {
    const frac = (width: number) => {
      const c = centre(markBox(48.8, 2.3, width, 7));
      return { x: c.x / width, y: c.y / worldMapHeightForWidth(width) };
    };
    const a = frac(320);
    const b = frac(720);
    expect(a.x).toBeCloseTo(b.x, 9);
    expect(a.y).toBeCloseTo(b.y, 9);
  });

  it("scales the mark with the map but keeps it centred", () => {
    const small = markBox(10, 20, 300, 7);
    const big = markBox(10, 20, 700, 7);
    expect(big.size).toBeGreaterThan(small.size);
    expect(centre(big).x / 700).toBeCloseTo(centre(small).x / 300, 9);
  });

  it("keeps marks for the extreme corners inside the canvas (± half the mark)", () => {
    const width = 360;
    const height = worldMapHeightForWidth(width);
    for (const [lat, lon] of [
      [90, -180],
      [-90, 180],
      [84, 180],
      [-58, -180],
    ] as const) {
      const b = markBox(lat, lon, width, 7);
      const c = centre(b);
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThanOrEqual(width);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThanOrEqual(height);
    }
  });

  it("survives non-finite coordinates", () => {
    const b = markBox(NaN, Infinity, 360, 7);
    expect(Number.isFinite(b.left)).toBe(true);
    expect(Number.isFinite(b.top)).toBe(true);
  });

  it("uses the same aspect ratio as the generated map", () => {
    expect(worldMapHeightForWidth(WORLD_MAP_WIDTH)).toBe(WORLD_MAP_HEIGHT);
  });
});
