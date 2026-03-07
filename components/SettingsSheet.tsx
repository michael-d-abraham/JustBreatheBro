import React, { forwardRef } from 'react';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetSettingsSection from './BottomSheetSettingsSection';
import BottomSheetSoundPicker from './BottomSheetSoundPicker';
import BottomSheetSoundscapePicker from './BottomSheetSoundscapePicker';

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
      </BaseBottomSheet>
    );
  }
);

SettingsSheet.displayName = 'SettingsSheet';

export default SettingsSheet;
