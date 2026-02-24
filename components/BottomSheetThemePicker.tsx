import React from 'react';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import { THEMES } from './Theme';
import { useApp } from '../contexts/themeContext';

export default function BottomSheetThemePicker() {
  const { settings, setAnimationTheme } = useApp();

  return (
    <>
      {Object.entries(THEMES).map(([key, t]) => (
        <BottomSheetCircularButton
          key={key}
          label={t.name}
          color={t.preview}
          isSelected={settings.animationTheme === key}
          onPress={() => setAnimationTheme(key as keyof typeof THEMES)}
        />
      ))}
    </>
  );
}
