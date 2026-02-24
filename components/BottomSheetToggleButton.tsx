import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from './Theme';

interface BottomSheetToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

export default function BottomSheetToggleButton({ isEnabled, onToggle, label }: BottomSheetToggleButtonProps) {
  const { tokens } = useTheme();
  
  return (
    <Pressable
      style={{
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginVertical: 5,
        borderWidth: 1.5,
        borderColor: tokens.bottomSheetSeparator,
        backgroundColor: 'transparent',
      }}
      onPress={onToggle}
    >
      <Text style={{
        color: tokens.bottomSheetText,
        fontSize: 18,
        fontWeight: isEnabled ? '700' : '600',
        textAlign: 'center',
        opacity: isEnabled ? 1 : 0.5,
      }}>
        {`${label}: ${isEnabled ? 'ON' : 'OFF'}`}
      </Text>
    </Pressable>
  );
}
