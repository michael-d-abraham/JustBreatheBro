import WallpaperPreview from "@/components/WallpaperPreview";
import { WALLPAPER_IMAGES } from "@/constants/wallpapers";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

type Props = {
  selectedFilename: string | null;
  onSelect: (filename: string) => void;
};

const styles = StyleSheet.create({
  scenesGallery: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
});

export default function WallpaperCarousel({
  selectedFilename,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scenesGallery}
    >
      {WALLPAPER_IMAGES.map((wallpaper) => (
        <WallpaperPreview
          key={wallpaper.filename}
          wallpaper={wallpaper}
          isSelected={selectedFilename === wallpaper.filename}
          onPress={() => onSelect(wallpaper.filename)}
        />
      ))}
    </ScrollView>
  );
}
