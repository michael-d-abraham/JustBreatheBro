import SceneCard from "@/components/SceneCard";
import { SettingsOptionCardRow } from "@/components/SettingsOptionCard";
import { WALLPAPER_IMAGES } from "@/constants/wallpapers";
import React from "react";

type Props = {
  selectedFilename: string | null;
  onSelect: (filename: string) => void;
};

/**
 * Horizontal scene picker — individual SceneCards, no grouped white container.
 */
export default function WallpaperCarousel({
  selectedFilename,
  onSelect,
}: Props) {
  return (
    <SettingsOptionCardRow>
      {WALLPAPER_IMAGES.map((wallpaper) => (
        <SceneCard
          key={wallpaper.filename}
          name={wallpaper.name}
          imageSource={wallpaper.source}
          selected={selectedFilename === wallpaper.filename}
          onPress={() => onSelect(wallpaper.filename)}
          testID={`scenes.scene-${wallpaper.filename}`}
        />
      ))}
    </SettingsOptionCardRow>
  );
}
