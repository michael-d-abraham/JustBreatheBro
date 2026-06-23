import React from 'react';
import { View } from 'react-native';
import { useAppSettings } from '@/contexts/appSettingsContext';
import BottomSheetToggleButton from './BottomSheetToggleButton';
import ToggleButton from './ToggleButton';

type SoundHapticsPickerVariant = 'page' | 'bottomSheet';

interface SoundHapticsPickerProps {
  variant?: SoundHapticsPickerVariant;
}

export default function SoundHapticsPicker({ variant = 'page' }: SoundHapticsPickerProps) {
  const { settings, toggleSound, toggleHaptics } = useAppSettings();

  if (variant === 'bottomSheet') {
    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          alignSelf: 'stretch',
        }}
      >
        <View style={{ flex: 1, flexBasis: 0, minWidth: 0 }}>
          <BottomSheetToggleButton
            isEnabled={settings.soundEnabled}
            onToggle={toggleSound}
            label="Sound"
          />
        </View>
        <View style={{ flex: 1, flexBasis: 0, minWidth: 0 }}>
          <BottomSheetToggleButton
            isEnabled={settings.hapticsEnabled}
            onToggle={toggleHaptics}
            label="Haptics"
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <ToggleButton
        isEnabled={settings.soundEnabled}
        onToggle={toggleSound}
        label="Sound"
      />

      <ToggleButton
        isEnabled={settings.hapticsEnabled}
        onToggle={toggleHaptics}
        label="Haptics"
      />
    </>
  );
}
