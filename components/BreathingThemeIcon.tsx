import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getBreathingTokensForTheme, THEMES, ThemeName, useTheme } from './Theme';

interface BreathingThemeIconProps {
  themeName: ThemeName;
  size?: number;
  selected?: boolean;
  showLabel?: boolean;
}

export default function BreathingThemeIcon({
  themeName,
  size = 56,
  selected = false,
  showLabel = true,
}: BreathingThemeIconProps) {
  const { tokens } = useTheme();
  const breathingTokens = getBreathingTokensForTheme(themeName);
  
  // Static mid-cycle radius for the main breathing ring
  const STATIC_MAIN_RADIUS = 120;
  
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      {/* Outer border wrapper for selected state */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: selected ? 3 : 0,
          borderColor: selected ? tokens.bottomSheetText : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          padding: selected ? 2 : 0,
        }}
      >
        {/* SVG with breathing rings */}
        <Svg 
          width={selected ? size - 10 : size} 
          height={selected ? size - 10 : size} 
          viewBox="0 0 400 400"
        >
          {/* Outer guide ring - r=180, stroke only, opacity 0.6 */}
          <Circle
            cx={200}
            cy={200}
            r={180}
            stroke={breathingTokens.guideOuterStroke}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
          
          {/* Inner guide ring - r=65, stroke only, opacity 0.6 */}
          <Circle
            cx={200}
            cy={200}
            r={65}
            stroke={breathingTokens.guideInnerStroke}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
          
          {/* Main breathing ring - fixed mid-cycle radius, stroke + fill, opacity 0.8 */}
          <Circle
            cx={200}
            cy={200}
            r={STATIC_MAIN_RADIUS}
            stroke={breathingTokens.mainStroke}
            strokeWidth={8}
            fill={breathingTokens.mainFill}
            strokeLinecap="round"
            opacity={0.8}
          />
        </Svg>
      </View>
      
      {/* Label below icon */}
      {showLabel && (
        <Text
          style={{
            color: tokens.bottomSheetText,
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          {THEMES[themeName].name}
        </Text>
      )}
    </View>
  );
}
