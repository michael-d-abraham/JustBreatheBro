import TipsWalkthroughDrawing from "@/components/learn/TipsWalkthroughDrawing";
import {
  SETTINGS_LAYOUT,
  SettingsGroupedSection,
} from "@/components/SettingsInsetGrouped";
import { modeColorWithAlpha } from "@/components/modeTokens";
import { useTheme } from "@/components/Theme";
import { APP_TIPS } from "@/lib/appTipsContent";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  bottomInset?: number;
  onSelectTip: (tipId: string) => void;
};

const {
  rowPaddingHorizontal: ROW_PADDING_H,
  rowPaddingVertical: ROW_PADDING_V,
  rowFontSize: ROW_FONT_SIZE,
  chevronSize: CHEVRON_SIZE,
  cardRadius: CARD_RADIUS,
} = SETTINGS_LAYOUT;

const ICON_TILE = 48;
const DIVIDER_INSET = ROW_PADDING_H + ICON_TILE + 12;

/** Soft tile washes — no theme accent (bottom-sheet safe). */
const TILE_ALPHA = [0.1, 0.08, 0.11, 0.07, 0.09, 0.08, 0.1] as const;

/** Tips list — Respire-style rows with icon tile, title, body, chevron. */
export default function TipsAndTricksContent({
  bottomInset = 8,
  onSelectTip,
}: Props) {
  const { tokens } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: ROW_PADDING_H,
          paddingVertical: ROW_PADDING_V + 6,
          gap: 12,
        },
        item: {
          marginBottom: 4,
        },
        itemLast: {
          marginBottom: 0,
        },
        dividerWrap: {
          marginVertical: 6,
        },
        iconTile: {
          width: ICON_TILE,
          height: ICON_TILE,
          borderRadius: CARD_RADIUS,
          alignItems: "center",
          justifyContent: "center",
        },
        textCol: {
          flex: 1,
          gap: 4,
          paddingVertical: 2,
        },
        title: {
          color: tokens.bottomSheetText,
          fontSize: ROW_FONT_SIZE,
          fontWeight: "600",
          letterSpacing: -0.41,
        },
        description: {
          color: tokens.bottomSheetSecondaryText,
          fontSize: 15,
          lineHeight: 20,
          letterSpacing: -0.24,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: tokens.bottomSheetSeparator,
          marginLeft: DIVIDER_INSET,
        },
        rowPressed: {
          opacity: 0.55,
        },
      }),
    [
      tokens.bottomSheetSecondaryText,
      tokens.bottomSheetSeparator,
      tokens.bottomSheetText,
    ],
  );

  return (
    <View style={{ paddingBottom: bottomInset }}>
      <SettingsGroupedSection contentStyle={{ paddingVertical: 8 }}>
        {APP_TIPS.map((tip, index) => {
          const isLast = index === APP_TIPS.length - 1;
          const tileBg = modeColorWithAlpha(
            tokens.bottomSheetText,
            TILE_ALPHA[index % TILE_ALPHA.length] ?? 0.08,
          );
          const iconStroke = tokens.bottomSheetText;
          const iconFill = tokens.bottomSheetText;

          return (
            <View
              key={tip.id}
              style={isLast ? styles.itemLast : styles.item}
            >
              <Pressable
                onPress={() => onSelectTip(tip.id)}
                accessibilityRole="button"
                accessibilityLabel={tip.title}
                accessibilityHint="Opens tip details"
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
                  <TipsWalkthroughDrawing
                    tipId={tip.id}
                    size={34}
                    stroke={iconStroke}
                    fill={iconFill}
                  />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.title}>{tip.title}</Text>
                  <Text style={styles.description}>{tip.description}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={CHEVRON_SIZE}
                  color={tokens.settingsTertiaryLabel}
                  style={{ opacity: 0.85 }}
                />
              </Pressable>
              {!isLast ? (
                <View style={styles.dividerWrap}>
                  <View style={styles.divider} />
                </View>
              ) : null}
            </View>
          );
        })}
      </SettingsGroupedSection>
    </View>
  );
}
