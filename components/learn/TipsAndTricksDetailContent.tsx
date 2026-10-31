import TipsWalkthroughDrawing from "@/components/learn/TipsWalkthroughDrawing";
import { SETTINGS_LAYOUT } from "@/components/SettingsInsetGrouped";
import { modeColorWithAlpha } from "@/components/modeTokens";
import { useTheme } from "@/components/Theme";
import type { AppTip } from "@/lib/appTipsContent";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  tip: AppTip;
  bottomInset?: number;
};

const { horizontalInset: HORIZONTAL_INSET, largeTitleSizeSheet: DETAIL_TITLE_SIZE } =
  SETTINGS_LAYOUT;

const HERO_RADIUS = 20;

/** Single tip detail — hero illustration card + title and body (shared layout for every tip). */
export default function TipsAndTricksDetailContent({
  tip,
  bottomInset = 8,
}: Props) {
  const { tokens } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroCard: {
          marginHorizontal: HORIZONTAL_INSET,
          marginTop: 4,
          marginBottom: 28,
          minHeight: 248,
          borderRadius: HERO_RADIUS,
          backgroundColor: modeColorWithAlpha(tokens.bottomSheetSeparator, 0.22),
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 32,
          paddingHorizontal: 24,
          shadowColor: tokens.bottomSheetText,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 2,
        },
        copy: {
          paddingHorizontal: HORIZONTAL_INSET,
          gap: 10,
        },
        title: {
          color: tokens.bottomSheetText,
          fontSize: DETAIL_TITLE_SIZE,
          fontWeight: "700",
          letterSpacing: -0.5,
        },
        description: {
          color: tokens.bottomSheetSecondaryText,
          fontSize: 17,
          lineHeight: 24,
          letterSpacing: -0.32,
        },
      }),
    [tokens.bottomSheetSecondaryText, tokens.bottomSheetSeparator, tokens.bottomSheetText],
  );

  const stroke = tokens.bottomSheetSecondaryText;
  const fill = tokens.bottomSheetText;

  return (
    <View style={{ paddingBottom: bottomInset }}>
      <View style={styles.heroCard}>
        <TipsWalkthroughDrawing
          tipId={tip.id}
          size={112}
          stroke={stroke}
          fill={fill}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.description}>{tip.detail ?? tip.description}</Text>
      </View>
    </View>
  );
}
