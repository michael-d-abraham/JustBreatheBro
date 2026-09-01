import {
  SettingsSelectionIndicator,
  useSceneCardDimensions,
} from "@/components/SettingsOptionCard";
import {
  settingsPickerBorderStyle,
  settingsPickerCard,
  settingsSelectionIndicator,
} from "@/components/settingsScreenTokens";
import { useTheme } from "@/components/Theme";
import React, { useId, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export const SCENE_CARD_LAYOUT = {
  gap: settingsPickerCard.gap,
  screenInset: settingsPickerCard.screenInset,
  labelInset: settingsPickerCard.sceneLabelInset,
  labelSize: settingsPickerCard.sceneLabelSize,
  gradientHeightRatio: 0.4,
} as const;

type Props = {
  name: string;
  imageSource: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
  width?: number;
  height?: number;
  testID?: string;
  accessibilityLabel?: string;
};

export default function SceneCard({
  name,
  imageSource,
  selected,
  onPress,
  width: widthProp,
  height: heightProp,
  testID,
  accessibilityLabel,
}: Props) {
  const { tokens } = useTheme();
  const defaultDimensions = useSceneCardDimensions();
  const width = widthProp ?? defaultDimensions.width;
  const cardHeight = heightProp ?? defaultDimensions.height;
  const gradientId = useId().replace(/:/g, "");
  const gradientHeight = cardHeight * SCENE_CARD_LAYOUT.gradientHeightRatio;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          width,
        },
        card: {
          width,
          height: cardHeight,
          overflow: "hidden",
          ...settingsPickerBorderStyle(selected, tokens.settingsSeparator),
        },
        image: {
          ...StyleSheet.absoluteFillObject,
          width: "100%",
          height: "100%",
        },
        gradient: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: gradientHeight,
        },
        label: {
          position: "absolute",
          left: SCENE_CARD_LAYOUT.labelInset,
          right: SCENE_CARD_LAYOUT.labelInset,
          bottom: SCENE_CARD_LAYOUT.labelInset,
          color: "#FFFFFF",
          fontSize: SCENE_CARD_LAYOUT.labelSize,
          fontWeight: "600",
          letterSpacing: -0.24,
          textShadowColor: "rgba(0, 0, 0, 0.35)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
      }),
    [
      cardHeight,
      gradientHeight,
      selected,
      tokens.settingsSeparator,
      width,
    ],
  );

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? name}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        pressed && { opacity: settingsSelectionIndicator.pressedOpacity },
      ]}
    >
      <View style={styles.card}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <Svg
          width={width}
          height={gradientHeight}
          style={styles.gradient}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="0.45" stopColor="#000000" stopOpacity="0.15" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.62" />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={width}
            height={gradientHeight}
            fill={`url(#${gradientId})`}
          />
        </Svg>
        <Text style={styles.label} numberOfLines={2}>
          {name}
        </Text>
        {selected ? <SettingsSelectionIndicator /> : null}
      </View>
    </Pressable>
  );
}
