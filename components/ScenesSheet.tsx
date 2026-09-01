import { useAppSettings } from "@/contexts/appSettingsContext";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { SettingsSection } from "./SettingsInsetGrouped";
import SettingsBottomSheet, {
  SettingsBottomSheetHandle,
} from "./SettingsBottomSheet";
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

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
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
        onChange={onChange}
        onDismiss={onDismiss}
      >
        <SettingsSection title="Theme" bare>
          <ThemePicker variant="bottomSheet" />
        </SettingsSection>

        <SettingsSection title="Soundscape" bare>
          <SoundscapePicker variant="bottomSheet" />
        </SettingsSection>

        <SettingsSection title="Scenes" bare>
          <WallpaperCarousel
            selectedFilename={backgroundImage}
            onSelect={handleScenePress}
          />
        </SettingsSection>
      </SettingsBottomSheet>
    );
  },
);

ScenesSheet.displayName = "ScenesSheet";

export default ScenesSheet;
