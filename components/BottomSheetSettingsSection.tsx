import React from 'react';
import { View } from 'react-native';
import BottomSheetSectionTitle from './BottomSheetSectionTitle';

interface BottomSheetSettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function BottomSheetSettingsSection({ title, children }: BottomSheetSettingsSectionProps) {
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
