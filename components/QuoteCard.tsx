import { EnvironmentImageCard } from "@/components/SceneCard";
import { soundscapeEnvironmentCard } from "@/components/settingsScreenTokens";
import {
  QUOTE_ENVIRONMENTS,
  type QuoteCoverGradient,
  type QuotePackId,
} from "@/constants/quoteEnvironments";
import React, { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

function QuoteGradientMedia({
  width,
  height,
  meta,
  gradientId,
}: {
  width: number;
  height: number;
  meta: QuoteCoverGradient;
  gradientId: string;
}) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={gradientId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={meta.gradientTop} />
          <Stop offset="0.55" stopColor={meta.gradientMid} />
          <Stop offset="1" stopColor={meta.gradientBottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

type Props = {
  quotePack: QuotePackId;
  selected: boolean;
  onPress: () => void;
  width: number;
  height: number;
  testID?: string;
};

/** Sheet quote tile — same footprint as soundscape environment cards. */
export default function QuoteCard({
  quotePack,
  selected,
  onPress,
  width,
  height,
  testID,
}: Props) {
  const gradientId = useId().replace(/:/g, "");
  const meta = QUOTE_ENVIRONMENTS[quotePack];

  return (
    <EnvironmentImageCard
      label={meta.label}
      selected={selected}
      onPress={onPress}
      width={width}
      height={height}
      variant="immersive"
      cardStyle={soundscapeEnvironmentCard}
      testID={testID}
      accessibilityLabel={meta.label}
      media={
        <QuoteGradientMedia
          width={width}
          height={height}
          meta={meta}
          gradientId={gradientId}
        />
      }
    />
  );
}
