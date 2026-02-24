import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { AnimMode } from './Theme';
import { useApp } from '../contexts/themeContext';
import BottomSheetCircularButton from './BottomSheetCircularButton';

type AnimationModeOption = {
  label: string;
  value: AnimMode;
  icon: keyof typeof Ionicons.glyphMap;
};

const ANIMATION_MODE_OPTIONS: AnimationModeOption[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark',  value: 'dark',  icon: 'moon' },
];

export default function BottomSheetAnimationModePicker() {
  const { settings, setAnimationMode } = useApp();

  return (
    <>
      {ANIMATION_MODE_OPTIONS.map(({ label, value, icon }) => (
        <BottomSheetCircularButton
          key={value}
          label={label}
          icon={icon}
          isSelected={settings.animationMode === value}
          onPress={() => setAnimationMode(value)}
        />
      ))}
    </>
  );
}
