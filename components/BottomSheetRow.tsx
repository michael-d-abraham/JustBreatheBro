import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from './Theme';

interface BottomSheetRowProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export default function BottomSheetRow({ title, subtitle, onPress, showArrow = true }: BottomSheetRowProps) {
  const { tokens } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: tokens.bottomSheetText, 
          fontSize: 16,
          marginBottom: subtitle ? 4 : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            color: tokens.bottomSheetSecondaryText, 
            fontSize: 12,
            opacity: 0.8,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Text style={{ color: tokens.bottomSheetText, fontSize: 18 }}>
          →
        </Text>
      )}
    </Pressable>
  );
}
