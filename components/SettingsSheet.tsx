import React, { forwardRef } from 'react';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetSettingsSection from './BottomSheetSettingsSection';
import SoundPicker from './SoundPicker';
import SoundscapePicker from './SoundscapePicker';
import ThemePicker from './ThemePicker';

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
          <SoundPicker variant="bottomSheet" />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Soundscape">
          <SoundscapePicker variant="bottomSheet" />
        </BottomSheetSettingsSection>

        <BottomSheetSettingsSection title="Animation Theme">
          <ThemePicker target="animation" variant="bottomSheet" />
        </BottomSheetSettingsSection>
      </BaseBottomSheet>
    );
  }
);

SettingsSheet.displayName = 'SettingsSheet';

export default SettingsSheet;
