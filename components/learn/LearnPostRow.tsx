import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { useLearnChromeColors } from "@/components/learn/useLearnChromeColors";
import { LearnPost } from "@/lib/learnContent";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  post: LearnPost;
  onPress: () => void;
  showDivider?: boolean;
  testID?: string;
};

export default function LearnPostRow({
  post,
  onPress,
  showDivider = true,
  testID,
}: Props) {
  const colors = useLearnChromeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 14,
          paddingVertical: 14,
          minHeight: LEARN_TAB.rowMinHeight,
        },
        thumbnail: {
          width: LEARN_TAB.thumbnailSize,
          height: LEARN_TAB.thumbnailSize,
          borderRadius: LEARN_TAB.thumbnailRadius,
          backgroundColor: colors.separator,
        },
        body: {
          flex: 1,
          minWidth: 0,
          paddingTop: 2,
        },
        eyebrow: {
          color: colors.onGlassTertiary,
          fontSize: LEARN_TAB.eyebrowSize,
          fontWeight: LEARN_TAB.eyebrowWeight,
          letterSpacing: LEARN_TAB.eyebrowLetterSpacing,
          textTransform: "uppercase",
          marginBottom: 4,
        },
        title: {
          color: colors.onGlassPrimary,
          fontSize: LEARN_TAB.postTitleSize,
          fontWeight: LEARN_TAB.postTitleWeight,
          letterSpacing: -0.3,
          lineHeight: 22,
        },
        subtitle: {
          color: colors.onGlassSecondary,
          fontSize: LEARN_TAB.postSubtitleSize,
          lineHeight: 19,
          marginTop: 4,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.separator,
          marginLeft: LEARN_TAB.thumbnailSize + 14,
        },
      }),
    [
      colors.onGlassPrimary,
      colors.onGlassSecondary,
      colors.onGlassTertiary,
      colors.separator,
    ],
  );

  return (
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={post.title}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
      >
        <Image
          source={post.imageSource}
          style={styles.thumbnail}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={null}
        />
        <View style={styles.body}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            {post.eyebrow}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {post.subtitle}
          </Text>
        </View>
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}
