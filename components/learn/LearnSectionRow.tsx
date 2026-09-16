import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { useLearnChromeColors } from "@/components/learn/useLearnChromeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  selected: boolean;
  onPress: () => void;
  showDivider?: boolean;
  testID?: string;
};

export default function LearnSectionRow({
  title,
  selected,
  onPress,
  showDivider = true,
  testID,
}: Props) {
  const colors = useLearnChromeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          minHeight: LEARN_TAB.rowMinHeight,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
        },
        title: {
          flex: 1,
          color: colors.onGlassPrimary,
          fontSize: 17,
          fontWeight: selected ? "600" : "400",
          letterSpacing: -0.2,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.separator,
        },
      }),
    [colors.onGlassPrimary, colors.separator, selected],
  );

  return (
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.onGlassTertiary}
        />
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}
