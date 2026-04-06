import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import BreathingThemePreview from './BreathingThemePreview';
import { THEMES, ThemeName } from './Theme';
import { useApp } from '../contexts/themeContext';

export default function BottomSheetThemePicker() {
  const { settings, setAnimationTheme } = useApp();

  const PREVIEW_SIZE = 110;
  const GAP = 16;
  const SNAP_INTERVAL = PREVIEW_SIZE + GAP;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP_INTERVAL}
      decelerationRate="fast"
      contentContainerStyle={{
        gap: GAP,
        paddingRight: 20,
      }}
    >
      {Object.entries(THEMES).map(([key, t]) => (
        <Pressable 
          key={key} 
          onPress={() => setAnimationTheme(key as ThemeName)}
        >
          <BreathingThemePreview
            themeName={key as ThemeName}
            selected={settings.animationTheme === key}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
