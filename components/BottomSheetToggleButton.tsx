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
        borderWidth: isEnabled ? 2 : 1.5,
        borderColor: isEnabled ? tokens.bottomSheetText : tokens.bottomSheetSeparator,
        backgroundColor: isEnabled ? tokens.bottomSheetSeparator : 'transparent',
        opacity: isEnabled ? 1 : 0.7,
      }}
      onPress={onToggle}
    >
      <Text style={{
        color: tokens.bottomSheetText,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
      }}>
        {`${label}: ${isEnabled ? 'ON' : 'OFF'}`}
      </Text>
    </Pressable>
  );
}
