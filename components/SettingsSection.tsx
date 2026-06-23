import React from 'react';
import { Text, View } from 'react-native';
import BottomSheetSectionTitle from './BottomSheetSectionTitle';
import { useTheme } from './Theme';

type SettingsSectionVariant = 'page' | 'bottomSheet';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  marginTop?: number;
  variant?: SettingsSectionVariant;
}

export default function SettingsSection({
  title,
  children,
  marginTop = 30,
  variant = 'page',
}: SettingsSectionProps) {
  const { tokens } = useTheme();

  if (variant === 'bottomSheet') {
    return (
      <View style={{ marginBottom: 28 }}>
        <BottomSheetSectionTitle>{title}</BottomSheetSectionTitle>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 16,
          textAlign: "center",
          color: tokens.textOnAccent
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: tokens.surface + '80', // Semi-transparent
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
      {children}
      </View>
    </View>
  );
}
