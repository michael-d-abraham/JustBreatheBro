import React from 'react';
import { useApp } from '../contexts/themeContext';
import BottomSheetToggleButton from './BottomSheetToggleButton';

export default function BottomSheetSoundHapticsPicker() {
  const { settings, toggleSound, toggleHaptics } = useApp();

  return (
    <>
      <BottomSheetToggleButton
        isEnabled={settings.soundEnabled}
        onToggle={toggleSound}
        label="Sound"
      />
      
      <BottomSheetToggleButton
        isEnabled={settings.hapticsEnabled}
        onToggle={toggleHaptics}
        label="Haptics"
      />
    </>
  );
}
