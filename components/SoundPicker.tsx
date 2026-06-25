import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SoundType, useAppSettings } from '@/contexts/appSettingsContext';
import BottomSheetCircularButton from './BottomSheetCircularButton';
import CircularOptionButton from './CircularOptionButton';
import { useTheme } from './Theme';

type SoundPickerVariant = 'page' | 'bottomSheet';

type SoundOption = {
  label: string;
  value: SoundType;
  icon?: keyof typeof Ionicons.glyphMap;
  iconComponent?: React.ReactNode;
};

// Sine wave icon component
const SineWaveIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Path
      d="M 2 14 Q 7 4, 12 14 T 22 14 Q 24 10, 26 14"
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

// Piano keys icon component
const PianoKeysIcon = ({ color }: { color: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <View style={{ width: 6, height: 18, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 6, height: 18, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 6, height: 18, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 4, height: 12, backgroundColor: color, borderRadius: 1, marginLeft: -3, marginRight: -1 }} />
    <View style={{ width: 4, height: 12, backgroundColor: color, borderRadius: 1, marginRight: -3 }} />
  </View>
);

// Bowl icon component
const BowlIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Path
      d="M 4 12 Q 4 8, 14 8 Q 24 8, 24 12 L 24 16 Q 24 20, 14 20 Q 4 20, 4 16 Z"
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Off icon component (horizontal line)
const OffIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Path
      d="M 4 14 L 24 14"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);

const getSoundOptions = (iconColor: string): SoundOption[] => [
  { label: 'Synth', value: 'synth', iconComponent: <PianoKeysIcon color={iconColor} /> },
  { label: 'Guzheng', value: 'guzheng', iconComponent: <BowlIcon color={iconColor} /> },
  { label: 'Sine', value: 'sine', iconComponent: <SineWaveIcon color={iconColor} /> },
  { label: 'OFF', value: 'off', iconComponent: <OffIcon color={iconColor} /> },
];

interface SoundPickerProps {
  variant?: SoundPickerVariant;
}

export default function SoundPicker({ variant = 'page' }: SoundPickerProps) {
  const { settings, setSoundType } = useAppSettings();
  const { tokens } = useTheme();

  const isBottomSheet = variant === 'bottomSheet';
  const iconColor = isBottomSheet ? tokens.bottomSheetText : tokens.textOnAccent;
  const ButtonComponent = isBottomSheet ? BottomSheetCircularButton : CircularOptionButton;

  return (
    <>
      {getSoundOptions(iconColor).map(({ label, value, icon, iconComponent }) => (
        <ButtonComponent
          key={value}
          label={label}
          icon={icon}
          iconComponent={iconComponent}
          isSelected={settings.soundType === value}
          onPress={() => setSoundType(value)}
        />
      ))}
    </>
  );
}
