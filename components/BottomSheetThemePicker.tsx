import React from 'react';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import { THEMES, useTheme } from './Theme';

export default function BottomSheetThemePicker() {
  const { themeName, setThemeName } = useTheme();

  return (
    <>
      {Object.entries(THEMES).map(([key, t]) => (
        <BottomSheetCircularButton
          key={key}
          label={t.name}
          color={t.preview}
          isSelected={themeName === key}
          onPress={() => setThemeName(key as keyof typeof THEMES)}
        />
      ))}
    </>
  );
}
