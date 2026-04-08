import React from "react";
import Svg, { Circle } from "react-native-svg";
import { getBreathingTokensForTheme, ThemeName } from "./Theme";

interface BreathingThemeGraphicProps {
  themeName: ThemeName;
}

/** Breathing ring preview only — no label, checkmark, or press target (tile wraps it). */
export default function BreathingThemeGraphic({
  themeName,
}: BreathingThemeGraphicProps) {
  const breathingTokens = getBreathingTokensForTheme(themeName);
  const SVG_SIZE = 100;
  const MAIN_RADIUS = 155;

  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 400 400">
      <Circle
        cx={200}
        cy={200}
        r={180}
        stroke={breathingTokens.guideOuterStroke}
        strokeWidth={0.5}
        fill="none"
        opacity={0.25}
      />

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

      <Circle
        cx={200}
        cy={200}
        r={75}
        fill={breathingTokens.mainFill}
        opacity={0.4}
      />
    </Svg>
  );
}
