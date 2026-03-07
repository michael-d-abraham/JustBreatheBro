import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getBreathingTokensForTheme, THEMES, ThemeName } from './Theme';
import { useTheme } from './Theme';

interface BreathingThemePreviewProps {
  themeName: ThemeName;
  selected?: boolean;
}

export default function BreathingThemePreview({
  themeName,
  selected = false,
}: BreathingThemePreviewProps) {
  const { tokens } = useTheme();
  const breathingTokens = getBreathingTokensForTheme(themeName);
  
  const PREVIEW_SIZE = 110;
  const SVG_SIZE = 100;
  const MAIN_RADIUS = 155;
  
  return (
    <View style={{ alignItems: 'center', width: PREVIEW_SIZE }}>
      {/* Preview container */}
      <View
        style={{
          width: PREVIEW_SIZE,
          height: PREVIEW_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* SVG breathing preview - captured mid-breath moment */}
        <Svg 
          width={SVG_SIZE} 
          height={SVG_SIZE} 
          viewBox="0 0 400 400"
        >
          {/* Very subtle outer guide ring - barely visible */}
          <Circle
            cx={200}
            cy={200}
            r={180}
            stroke={breathingTokens.guideOuterStroke}
            strokeWidth={0.5}
            fill="none"
            opacity={0.25}
          />
          
          {/* Main breathing form - dominant visual element */}
          <Circle
            cx={200}
            cy={200}
            r={MAIN_RADIUS}
            stroke={breathingTokens.mainStroke}
            strokeWidth={16}
            fill={breathingTokens.mainFill}
            strokeLinecap="round"
            opacity={0.95}
          />
          
          {/* Soft inner glow/center */}
          <Circle
            cx={200}
            cy={200}
            r={75}
            fill={breathingTokens.mainFill}
            opacity={0.4}
          />
        </Svg>
        
        {/* Checkmark indicator for selected state */}
        {selected && (
          <View
            style={{
              position: 'absolute',
              top: 5,
              left: 5,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: tokens.bottomSheetText,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={tokens.bottomSheetBg}
            />
          </View>
        )}
      </View>
      
      {/* Label below preview */}
      <Text
        style={{
          color: tokens.bottomSheetText,
          fontSize: 15,
          fontWeight: '500',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        {THEMES[themeName].name}
      </Text>
    </View>
  );
}
