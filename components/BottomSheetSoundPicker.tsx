import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SoundType, useApp } from '../contexts/themeContext';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import { useTheme } from './Theme';

type SoundOption = {
  label: string;
  value: SoundType;
  iconComponent?: React.ReactNode;
};

// Sine wave icon component
const SineWaveIcon = () => {
  const { tokens } = useTheme();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M 2 14 Q 7 4, 12 14 T 22 14 Q 24 10, 26 14"
        stroke={tokens.bottomSheetText}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

// Piano keys icon component
const PianoKeysIcon = () => {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <View style={{ width: 6, height: 18, backgroundColor: tokens.bottomSheetText, borderRadius: 1 }} />
      <View style={{ width: 6, height: 18, backgroundColor: tokens.bottomSheetText, borderRadius: 1 }} />
      <View style={{ width: 6, height: 18, backgroundColor: tokens.bottomSheetText, borderRadius: 1 }} />
      <View style={{ width: 4, height: 12, backgroundColor: tokens.bottomSheetText, borderRadius: 1, marginLeft: -3, marginRight: -1 }} />
      <View style={{ width: 4, height: 12, backgroundColor: tokens.bottomSheetText, borderRadius: 1, marginRight: -3 }} />
    </View>
  );
};

// Bowl icon component
const BowlIcon = () => {
  const { tokens } = useTheme();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M 4 12 Q 4 8, 14 8 Q 24 8, 24 12 L 24 16 Q 24 20, 14 20 Q 4 20, 4 16 Z"
        stroke={tokens.bottomSheetText}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Off icon component (horizontal line)
const OffIcon = () => {
  const { tokens } = useTheme();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M 4 14 L 24 14"
        stroke={tokens.bottomSheetText}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const SOUND_OPTIONS: SoundOption[] = [
  { label: 'Synth', value: 'synth', iconComponent: <PianoKeysIcon /> },
  { label: 'Guzheng', value: 'guzheng', iconComponent: <BowlIcon /> },
  { label: 'Sine', value: 'sine', iconComponent: <SineWaveIcon /> },
  { label: 'OFF', value: 'off', iconComponent: <OffIcon /> },
];

export default function BottomSheetSoundPicker() {
  const { settings, setSoundType } = useApp();

  return (
    <>
      {SOUND_OPTIONS.map(({ label, value, iconComponent }) => (
        <BottomSheetCircularButton
          key={value}
          label={label}
          iconComponent={iconComponent}
          isSelected={settings.soundType === value}
          onPress={() => setSoundType(value)}
        />
      ))}
    </>
  );
}
