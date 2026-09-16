import {
  HOME_NAV_SHADOW_COLOR,
  HOME_NAV_SHADOW_OFFSET,
  HOME_NAV_SHADOW_OPACITY,
  HOME_NAV_SHADOW_RADIUS,
} from "@/components/homeNavTokens";
import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { LearnPost } from "@/lib/learnContent";
import { Image } from "expo-image";
import React, { useId, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type Props = {
  post: LearnPost;
  width: number;
  height: number;
  onPress: () => void;
  testID?: string;
};

function BottomScrim({
  width,
  height,
  gradientId,
}: {
  width: number;
  height: number;
  gradientId: string;
}) {
  const scrimHeight = height * 0.55;

  return (
    <Svg
      width={width}
      height={scrimHeight}
      style={[styles.bottomScrim, { height: scrimHeight }]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.45" stopColor="#000000" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.72" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={scrimHeight} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

export default function FeaturedLearnCard({
  post,
  width,
  height,
  onPress,
  testID,
}: Props) {
  const gradientId = useId().replace(/:/g, "");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardShell: {
          width,
          height,
          borderRadius: LEARN_TAB.cardRadius,
          shadowColor: HOME_NAV_SHADOW_COLOR,
          shadowOpacity: HOME_NAV_SHADOW_OPACITY,
          shadowRadius: HOME_NAV_SHADOW_RADIUS,
          shadowOffset: HOME_NAV_SHADOW_OFFSET,
        },
        card: {
          flex: 1,
          borderRadius: LEARN_TAB.cardRadius,
          overflow: "hidden",
          backgroundColor: "#E8E8ED",
        },
        image: {
          width,
          height,
        },
        content: {
          position: "absolute",
          left: LEARN_TAB.featuredContentInset,
          right: LEARN_TAB.featuredContentInset,
          bottom: LEARN_TAB.featuredContentInset,
          zIndex: 2,
        },
        eyebrow: {
          color: "rgba(255, 255, 255, 0.82)",
          fontSize: LEARN_TAB.eyebrowSize,
          fontWeight: LEARN_TAB.eyebrowWeight,
          letterSpacing: LEARN_TAB.eyebrowLetterSpacing,
          textTransform: "uppercase",
          marginBottom: 4,
        },
        title: {
          color: "#FFFFFF",
          fontSize: LEARN_TAB.featuredTitleSize,
          fontWeight: "700",
          letterSpacing: -0.3,
          lineHeight: LEARN_TAB.featuredTitleLineHeight,
        },
      }),
    [height, width],
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={post.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardShell,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.card}>
        <Image
          source={post.imageSource}
          style={styles.image}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={null}
        />
        <BottomScrim width={width} height={height} gradientId={gradientId} />
        <View style={styles.content}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            {post.eyebrow}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
