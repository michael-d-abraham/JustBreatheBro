import SettingsScreenLayout, {
  SettingsScreenSection,
} from "@/components/SettingsScreenLayout";
import SoundscapePicker from "@/components/SoundscapePicker";
import ThemePicker from "@/components/ThemePicker";
import WallpaperCarousel from "@/components/WallpaperCarousel";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useRouter } from "expo-router";
import React from "react";

export default function ScenesScreen() {
  const { backgroundImage, setBackgroundImage } = useAppSettings();
  const router = useRouter();

  const handleScenePress = async (filename: string) => {
    await setBackgroundImage(filename);
  };

  return (
    <SettingsScreenLayout
      title="Scenes"
      onClose={() => router.push("/")}
      closeTestID="scenes.close-button"
      closeAccessibilityLabel="Done"
    >
      <SettingsScreenSection title="Soundscape">
        <SoundscapePicker variant="bottomSheet" />
      </SettingsScreenSection>

      <SettingsScreenSection title="Scenes" overflowVisible>
        <WallpaperCarousel
          selectedFilename={backgroundImage}
          onSelect={handleScenePress}
        />
      </SettingsScreenSection>

      <SettingsScreenSection title="Theme">
        <ThemePicker variant="bottomSheet" />
      </SettingsScreenSection>
    </SettingsScreenLayout>
  );
}
