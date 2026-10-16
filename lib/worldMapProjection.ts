import {
  WORLD_MAP_HEIGHT,
  WORLD_MAP_LAT_MAX,
  WORLD_MAP_LAT_MIN,
  WORLD_MAP_LNG_MAX,
  WORLD_MAP_LNG_MIN,
  WORLD_MAP_MERCATOR_X_MIN,
  WORLD_MAP_MERCATOR_X_RANGE,
  WORLD_MAP_MERCATOR_Y_MAX,
  WORLD_MAP_MERCATOR_Y_RANGE,
  WORLD_MAP_WIDTH,
} from "@/constants/worldMap";

export type MapPoint = { x: number; y: number };

export { WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH };

const WGS84_A = 6378137;
const MERCATOR_LAT_LIMIT = 85.05112877980659;

/** WGS84 → Web Mercator (meters), matching dotted-map’s default projection. */
function forwardMercatorMeters(lon: number, lat: number): [number, number] {
  const clampedLat = Math.min(Math.max(lat, -MERCATOR_LAT_LIMIT), MERCATOR_LAT_LIMIT);
  const φ = (clampedLat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;
  return [WGS84_A * λ, WGS84_A * Math.log(Math.tan(Math.PI / 4 + φ / 2))];
}

/**
 * dotted-map Mercator onto the committed land grid (constants/worldMap.ts).
 *
 * Returns fractions of the map's width/height, each in 0…1. Pure — no I/O, no state.
 */
export function projectToWorldMap(lat: number, lon: number): MapPoint {
  const safeLat = Number.isFinite(lat) ? lat : 0;
  const safeLon = Number.isFinite(lon) ? lon : 0;

  const clampedLat = Math.min(Math.max(safeLat, WORLD_MAP_LAT_MIN), WORLD_MAP_LAT_MAX);
  const clampedLon = Math.min(Math.max(safeLon, WORLD_MAP_LNG_MIN), WORLD_MAP_LNG_MAX);

  const [projX, projY] = forwardMercatorMeters(clampedLon, clampedLat);

  const px = (WORLD_MAP_WIDTH * (projX - WORLD_MAP_MERCATOR_X_MIN)) / WORLD_MAP_MERCATOR_X_RANGE;
  const py = (WORLD_MAP_HEIGHT * (WORLD_MAP_MERCATOR_Y_MAX - projY)) / WORLD_MAP_MERCATOR_Y_RANGE;

  const x = px / WORLD_MAP_WIDTH;
  const y = py / WORLD_MAP_HEIGHT;

  return {
    x: Math.min(Math.max(x, 0), 1),
    y: Math.min(Math.max(y, 0), 1),
  };
}

/** Rendered map height for a given width, preserving the map's aspect ratio. */
export function worldMapHeightForWidth(width: number): number {
  return (width * WORLD_MAP_HEIGHT) / WORLD_MAP_WIDTH;
}
