/**
 * Pure layout math for the Global Room map: how big the map is on a given screen, how large its
 * marks are, and where a coordinate lands in pixels. No React, no I/O.
 */

import {
  GLOBAL_ROOM_MAP_MAX_SCALE,
  GLOBAL_ROOM_MAP_MAX_WIDTH,
  GLOBAL_ROOM_MAP_MIN_SCALE,
  GLOBAL_ROOM_MAP_REFERENCE_WIDTH,
} from "@/components/globalRoomTokens";
import { projectToWorldMap, WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH } from "@/lib/worldMapProjection";

/**
 * Widest map that fits the area, keeping the map's aspect ratio. Limited by width (phones,
 * portrait), by height (landscape / room for the pulse control), and by a calm maximum on large
 * screens. The full world stays visible — no crop zoom.
 */
export function fitMapWidth(
  availableWidth: number,
  availableHeight: number,
  maxWidth: number = GLOBAL_ROOM_MAP_MAX_WIDTH,
): number {
  const w = Math.max(0, availableWidth);
  const h = Math.max(0, availableHeight);
  const widthFromHeight = (h * WORLD_MAP_WIDTH) / WORLD_MAP_HEIGHT;
  return Math.floor(Math.min(w, widthFromHeight, maxWidth));
}

/** Multiplier for authored mark sizes so dots stay proportionate to the map they sit on. */
export function mapScale(mapWidth: number): number {
  const raw = mapWidth / GLOBAL_ROOM_MAP_REFERENCE_WIDTH;
  return Math.min(GLOBAL_ROOM_MAP_MAX_SCALE, Math.max(GLOBAL_ROOM_MAP_MIN_SCALE, raw));
}

export type MarkBox = { left: number; top: number; size: number };

/**
 * Absolute-position box for a mark of `size` px centred on a coordinate, on a map of the given
 * pixel width (height follows the aspect ratio). `size` is scaled with the map via `mapScale`.
 */
export function markBox(
  lat: number,
  lon: number,
  mapWidth: number,
  baseSize: number,
): MarkBox {
  const mapHeight = (mapWidth * WORLD_MAP_HEIGHT) / WORLD_MAP_WIDTH;
  const { x, y } = projectToWorldMap(lat, lon);
  const size = baseSize * mapScale(mapWidth);
  return { left: x * mapWidth - size / 2, top: y * mapHeight - size / 2, size };
}
