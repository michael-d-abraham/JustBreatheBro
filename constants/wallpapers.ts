/**
 * Wallpaper / Zenscape image definitions
 * 
 * Single source of truth for all wallpaper images used across the app.
 */

/** Default zenscape on first install and when stored value is missing or unknown. */
export const DEFAULT_ZENSCAPE_BACKGROUND_FILENAME =
  '53f9385211ee5c576f8fa058326f479b.jpg';

export type WallpaperImage = {
  source: number;
  filename: string;
  name: string;
};

/** All wallpaper images from zenscapes folder */
export const WALLPAPER_IMAGES: WallpaperImage[] = [
  {
    source: require('../assets/images/BackGrounds/zenscapes/53f9385211ee5c576f8fa058326f479b.jpg'),
    filename: DEFAULT_ZENSCAPE_BACKGROUND_FILENAME,
    name: 'Jasper Lake',
  },
  {
    source: require('../assets/images/BackGrounds/zenscapes/a173ab0f7d9a7427676a776831bc8154.jpg'),
    filename: 'a173ab0f7d9a7427676a776831bc8154.jpg',
    name: 'Denali',
  },
  {
    source: require('../assets/images/BackGrounds/zenscapes/bda498c860d011ed38fe8877fe894261.jpg'),
    filename: 'bda498c860d011ed38fe8877fe894261.jpg',
    name: 'Yosemite',
  },
];

/** Map of filename → image source (for runtime lookups) */
export const ZENSCAPE_IMAGE_MAP: Record<string, number> = Object.fromEntries(
  WALLPAPER_IMAGES.map((img) => [img.filename, img.source])
);

/** Type guard to check if a filename is a known zenscape */
export function isKnownZenscapeFilename(name: string | null | undefined): name is string {
  return typeof name === 'string' && name in ZENSCAPE_IMAGE_MAP;
}
