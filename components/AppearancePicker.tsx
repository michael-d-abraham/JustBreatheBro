import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import CircularOptionButton from './CircularOptionButton';
import { useTheme } from './Theme';

type AppearancePickerVariant = 'page' | 'bottomSheet';

type AppearanceOption = {
  label: string;
  value: 'light' | 'dark' | 'system';
  icon: keyof typeof Ionicons.glyphMap;
};

const APPEARANCE_OPTIONS: AppearanceOption[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System', value: 'system', icon: 'phone-portrait' },
];

interface AppearancePickerProps {
  variant?: AppearancePickerVariant;
}

export default function AppearancePicker({ variant = 'page' }: AppearancePickerProps) {
  const { appearance, setAppearance } = useTheme();
  const ButtonComponent = variant === 'bottomSheet' ? BottomSheetCircularButton : CircularOptionButton;

  return (
    <>
      {APPEARANCE_OPTIONS.map(({ label, value, icon }) => (
        <ButtonComponent
          key={value}
          label={label}
          icon={icon}
          isSelected={appearance === value}
          onPress={() => setAppearance(value)}
        />
      ))}
    </>
  );
}
