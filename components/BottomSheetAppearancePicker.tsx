import React from 'react';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import { useTheme } from './Theme';

export default function BottomSheetAppearancePicker() {
  const { appearance, setAppearance } = useTheme();

  return (
    <>
      <BottomSheetCircularButton
        label="Light"
        icon="sunny"
        isSelected={appearance === 'light'}
        onPress={() => setAppearance('light')}
      />
      <BottomSheetCircularButton
        label="Dark"
        icon="moon"
        isSelected={appearance === 'dark'}
        onPress={() => setAppearance('dark')}
      />
      <BottomSheetCircularButton
        label="System"
        icon="phone-portrait"
        isSelected={appearance === 'system'}
        onPress={() => setAppearance('system')}
      />
    </>
  );
}
