import AppearanceModeToggle from "@/components/AppearanceModeToggle";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { scenesLayout } from "@/components/settingsScreenTokens";
import { useSoundscapeSheetAuditionHandlers } from "@/hooks/useSoundscapePickerAudition";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import AppIconPicker from "./AppIconPicker";
import { ScenesHeroSection } from "./ScenesPageSections";
import QuotesPicker from "./QuotesPicker";
import SettingsBottomSheet, {
  SettingsBottomSheetHandle,
} from "./SettingsBottomSheet";
import { SettingsSection } from "./SettingsInsetGrouped";
import SoundscapePicker from "./SoundscapePicker";
import ThemePicker from "./ThemePicker";
import WallpaperCarousel from "./WallpaperCarousel";

export type ScenesSheetHandle = SettingsBottomSheetHandle;

interface ScenesSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const ScenesSheet = forwardRef<ScenesSheetHandle, ScenesSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    const sheetRef = useRef<SettingsBottomSheetHandle>(null);
    const { backgroundImage, setBackgroundImage } = useAppSettings();
    const { handleChange, handleDismiss, enableAudition } =
      useSoundscapeSheetAuditionHandlers(onChange, onDismiss);

    useImperativeHandle(ref, () => ({
      open: () => {
        enableAudition();
        sheetRef.current?.open();
      },
      close: () => sheetRef.current?.close(),
    }));

    const handleScenePress = useCallback(
      async (filename: string) => {
        await setBackgroundImage(filename);
      },
      [setBackgroundImage],
    );

    return (
      <SettingsBottomSheet
        ref={sheetRef}
        title="Scenes"
        closeTestID="scenes.close-button"
        onChange={handleChange}
        onDismiss={handleDismiss}
      >
        <View style={{ paddingTop: scenesLayout.contentTopInset }}>
          <SettingsSection title="Theme" bare>
            <AppearanceModeToggle />
            <ThemePicker variant="bottomSheet" />
          </SettingsSection>

          <SettingsSection title="Soundscape" bare>
            <SoundscapePicker variant="bottomSheet" />
          </SettingsSection>

          <ScenesHeroSection title="Scenes">
            <WallpaperCarousel
              selectedFilename={backgroundImage}
              onSelect={handleScenePress}
            />
          </ScenesHeroSection>

          <SettingsSection title="Quotes" bare>
            <QuotesPicker />
          </SettingsSection>

          <SettingsSection title="App Icon" bare>
            <AppIconPicker />
          </SettingsSection>
        </View>
      </SettingsBottomSheet>
    );
  },
);

ScenesSheet.displayName = "ScenesSheet";

export default ScenesSheet;
