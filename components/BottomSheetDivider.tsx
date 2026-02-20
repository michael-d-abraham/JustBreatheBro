import React from 'react';
import { View } from 'react-native';
import { useTheme } from './Theme';

export default function BottomSheetDivider() {
  const { tokens } = useTheme();
  
  return (
    <View style={{ 
      height: 1, 
      backgroundColor: tokens.bottomSheetSeparator, 
      marginVertical: 16 
    }} />
  );
}
