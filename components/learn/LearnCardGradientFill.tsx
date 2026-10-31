import type { LearnCardGradient } from "@/lib/learnVideoGradients";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type Props = {
  width: number;
  height: number;
  gradient: LearnCardGradient;
  gradientId: string;
  style?: ViewStyle;
};

/** Full-bleed diagonal color gradient for Learn video tiles. */
export default function LearnCardGradientFill({
  width,
  height,
  gradient,
  gradientId,
  style,
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0.12" y1="0" x2="0.88" y2="1">
          <Stop offset="0" stopColor={gradient.gradientTop} />
          <Stop offset="0.55" stopColor={gradient.gradientMid} />
          <Stop offset="1" stopColor={gradient.gradientBottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  );
}
