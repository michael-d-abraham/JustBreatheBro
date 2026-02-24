import React from 'react';
import { View } from 'react-native';
import { useApp } from '../contexts/themeContext';
import BottomSheetToggleButton from './BottomSheetToggleButton';

export default function BottomSheetSoundHapticsPicker() {
  const { settings, toggleSound, toggleHaptics } = useApp();

  return (
    <>
      <View style={{ flex: 1 }}>
        <BottomSheetToggleButton
          isEnabled={settings.soundEnabled}
          onToggle={toggleSound}
          label="Sound"
        />
      </View>
      <View style={{ flex: 1 }}>
        <BottomSheetToggleButton
          isEnabled={settings.hapticsEnabled}
          onToggle={toggleHaptics}
          label="Haptics"
        />
      </View>
    </>
  );
}
