import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { SOUNDSCAPE_PALETTES } from "../constants/featureColors";
import { SoundscapeType } from "../contexts/themeContext";
import { useTheme } from "./Theme";

interface SoundscapePreviewGraphicProps {
  soundscape: SoundscapeType;
  /** Rendered SVG pixel size; default matches 100px graphic inside 110px tile. */
  svgSize?: number;
}

const DEFAULT_SVG_SIZE = 100;
const VIEW_BOX = "0 0 400 400";
const CENTER = 200;
const OUTER_R = 180;
const MAIN_R = 155;
const INNER_R = 75;

/** Ring-style preview for soundscape options (OFF uses horizontal line in same frame). */
export default function SoundscapePreviewGraphic({
  soundscape,
  svgSize = DEFAULT_SVG_SIZE,
}: SoundscapePreviewGraphicProps) {
  const { tokens } = useTheme();

  if (soundscape === "off") {
    return (
      <Svg width={svgSize} height={svgSize} viewBox={VIEW_BOX}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_R}
          stroke={tokens.bottomSheetSeparator}
          strokeWidth={0.5}
          fill="none"
          opacity={0.45}
        />
        <Path
          d="M 115 200 L 285 200"
          stroke={tokens.bottomSheetText}
          strokeWidth={14}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  const t = SOUNDSCAPE_PALETTES[soundscape];

  return (
    <Svg width={svgSize} height={svgSize} viewBox={VIEW_BOX}>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_R}
        stroke={t.guideOuterStroke}
        strokeWidth={0.5}
        fill="none"
        opacity={0.25}
      />

      <Circle
        cx={CENTER}
        cy={CENTER}
        r={MAIN_R}
        stroke={t.mainStroke}
        strokeWidth={16}
        fill={t.mainFill}
        strokeLinecap="round"
        opacity={0.95}
      />

      <Circle
        cx={CENTER}
        cy={CENTER}
        r={INNER_R}
        fill={t.mainFill}
        opacity={0.4}
      />
    </Svg>
  );
}
