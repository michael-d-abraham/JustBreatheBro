import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from './Theme';

interface AppearanceButtonProps {
  children: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}

export default function AppearanceButton({ children, isSelected, onPress }: AppearanceButtonProps) {
  const { tokens } = useTheme();
  
  return (
    <Pressable
      style={{
        backgroundColor: isSelected ? tokens.accentPrimary : tokens.surface,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginVertical: 5,
        borderWidth: 2,
        borderColor: isSelected ? tokens.accentPrimary : tokens.borderSubtle,
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
