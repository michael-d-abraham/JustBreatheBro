import {
  WORLD_MAP_HEIGHT,
  WORLD_MAP_LAT_MAX,
  WORLD_MAP_LAT_MIN,
  WORLD_MAP_WIDTH,
} from "@/constants/worldMap";

export type MapPoint = { x: number; y: number };

/**
 * Equirectangular projection onto the committed land outline (constants/worldMap.ts).
 *
 * Returns fractions of the map's width/height, each in 0…1, so callers can position anything over a
 * map of any rendered size (`left = x * mapWidth`). Out-of-range or non-finite input is clamped, so
 * a bad coordinate can never place a dot off the map. Pure — no I/O, no state.
 */
export function projectToWorldMap(lat: number, lon: number): MapPoint {
  const safeLat = Number.isFinite(lat) ? lat : 0;
  const safeLon = Number.isFinite(lon) ? lon : 0;

  const clampedLat = Math.min(Math.max(safeLat, WORLD_MAP_LAT_MIN), WORLD_MAP_LAT_MAX);
  const clampedLon = Math.min(Math.max(safeLon, -180), 180);

  return {
    x: (clampedLon + 180) / WORLD_MAP_WIDTH,
    y: (WORLD_MAP_LAT_MAX - clampedLat) / WORLD_MAP_HEIGHT,
  };
}

/** Rendered map height for a given width, preserving the land outline's aspect ratio. */
export function worldMapHeightForWidth(width: number): number {
  return (width * WORLD_MAP_HEIGHT) / WORLD_MAP_WIDTH;
}
