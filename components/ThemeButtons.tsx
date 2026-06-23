import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from './Theme';

interface ThemeButtonsProps {
  children: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}

export default function ThemeButtons({ children, isSelected, onPress }: ThemeButtonsProps) {
  const { tokens } = useTheme();
  
  return (
    <Pressable
      style={{
        backgroundColor: isSelected ? tokens.accentPrimary : tokens.surface,
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: isSelected ? tokens.accentPrimary : tokens.borderSubtle,
        marginVertical: 5,
      }}
      onPress={onPress}
    >
      <Text style={{
        color: tokens.textOnAccent,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
      }}>
        {children}
      </Text>
    </Pressable>
  );
}
