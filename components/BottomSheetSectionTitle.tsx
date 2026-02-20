import React from 'react';
import { Text } from 'react-native';
import { useTheme } from './Theme';

interface BottomSheetSectionTitleProps {
  children: string;
}

export default function BottomSheetSectionTitle({ children }: BottomSheetSectionTitleProps) {
  const { tokens } = useTheme();
  
  return (
    <Text style={{
      color: tokens.bottomSheetText,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: 1,
    }}>
      {children}
    </Text>
  );
}
