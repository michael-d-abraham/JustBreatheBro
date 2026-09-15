import { appIconEnvironmentCard } from "@/components/settingsScreenTokens";
import { useTheme } from "@/components/Theme";
import { AppIconOption } from "@/constants/appIconOptions";
import { Image } from "expo-image";
import React, { useId, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

function AppIconGradientMedia({
  size,
  meta,
  gradientId,
}: {
  size: number;
  meta: NonNullable<AppIconOption["gradient"]>;
  gradientId: string;
}) {
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={gradientId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={meta.gradientTop} />
          <Stop offset="0.55" stopColor={meta.gradientMid} />
          <Stop offset="1" stopColor={meta.gradientBottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={size} height={size} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

type Props = {
  option: AppIconOption;
  selected: boolean;
  onPress: () => void;
  size: number;
  testID?: string;
};

/** Square app-icon preview tile with label below the icon bounds. */
export default function AppIconCard({
  option,
  selected,
  onPress,
  size,
  testID,
}: Props) {
  const gradientId = useId().replace(/:/g, "");
  const { tokens } = useTheme();
  const cardStyle = appIconEnvironmentCard;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          width: size,
          opacity: selected ? 1 : cardStyle.unselectedOpacity,
        },
        iconShell: {
          width: size,
          height: size,
          borderRadius: cardStyle.radius,
          overflow: "hidden",
          backgroundColor: tokens.mode.surfacePlaceholder,
        },
        image: {
          width: size,
          height: size,
        },
        label: {
          marginTop: cardStyle.labelGap,
          color: tokens.bottomSheetText,
          fontSize: cardStyle.labelSize,
          fontWeight: "500",
          letterSpacing: -0.2,
          textAlign: "center",
        },
        selectionRing: {
          ...StyleSheet.absoluteFillObject,
          borderRadius: cardStyle.radius,
          borderWidth: cardStyle.selectedRingWidth,
          borderColor: tokens.mode.selectionRing,
        },
      }),
    [
      cardStyle.labelGap,
      cardStyle.labelSize,
      cardStyle.radius,
      cardStyle.selectedRingWidth,
      cardStyle.unselectedOpacity,
      selected,
      size,
      tokens.bottomSheetText,
      tokens.mode.selectionRing,
      tokens.mode.surfacePlaceholder,
    ],
  );

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={option.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        pressed && { opacity: cardStyle.pressedOpacity },
      ]}
    >
      <View style={styles.iconShell}>
        {option.imageSource ? (
          <Image
            source={option.imageSource}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={null}
          />
        ) : null}
        {option.gradient ? (
          <AppIconGradientMedia
            size={size}
            meta={option.gradient}
            gradientId={gradientId}
          />
        ) : null}
        {selected ? <View pointerEvents="none" style={styles.selectionRing} /> : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {option.label}
      </Text>
    </Pressable>
  );
}
