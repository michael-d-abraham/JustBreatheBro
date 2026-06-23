import React from 'react';
import { useAppSettings } from '../contexts/appSettingsContext';
import ToggleButton from './ToggleButton';

export default function SoundHapticsPicker() {
  const { settings, toggleSound, toggleHaptics } = useAppSettings();

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
