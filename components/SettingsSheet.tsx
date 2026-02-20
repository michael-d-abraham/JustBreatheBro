import React, { forwardRef } from 'react';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetAppearancePicker from './BottomSheetAppearancePicker';
import BottomSheetSettingsSection from './BottomSheetSettingsSection';
import BottomSheetSoundHapticsPicker from './BottomSheetSoundHapticsPicker';
import BottomSheetSoundPicker from './BottomSheetSoundPicker';
import BottomSheetSoundscapePicker from './BottomSheetSoundscapePicker';
import BottomSheetThemePicker from './BottomSheetThemePicker';

export type SettingsSheetHandle = BaseBottomSheetHandle;

interface SettingsSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const SettingsSheet = forwardRef<SettingsSheetHandle, SettingsSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    return (
      <BaseBottomSheet
        ref={ref}
        title="Settings"
        onChange={onChange}
        onDismiss={onDismiss}
      >
        <BottomSheetSettingsSection title="Inhale / Exhale Tone">
          <BottomSheetSoundPicker />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Soundscape">
          <BottomSheetSoundscapePicker />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Pick A Theme">
          <BottomSheetThemePicker />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Appearance Mode">
          <BottomSheetAppearancePicker />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Sound & Haptics">
          <BottomSheetSoundHapticsPicker />
        </BottomSheetSettingsSection>
      </BaseBottomSheet>
    );
  }
);

SettingsSheet.displayName = 'SettingsSheet';

export default SettingsSheet;
