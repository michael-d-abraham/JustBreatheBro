import TipsWalkthroughDrawing from "@/components/learn/TipsWalkthroughDrawing";
import {
  SETTINGS_LAYOUT,
  SettingsGroupedSection,
} from "@/components/SettingsInsetGrouped";
import { modeColorWithAlpha } from "@/components/modeTokens";
import { useTheme } from "@/components/Theme";
import { APP_TIPS } from "@/lib/appTipsContent";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  bottomInset?: number;
};

const {
  rowPaddingHorizontal: ROW_PADDING_H,
  rowPaddingVertical: ROW_PADDING_V,
  rowFontSize: ROW_FONT_SIZE,
  sectionHeaderSize: SECTION_HEADER_SIZE,
  cardRadius: CARD_RADIUS,
} = SETTINGS_LAYOUT;

/** Tips and Tricks — inset-grouped walkthrough (Support sheet only). */
export default function TipsAndTricksContent({ bottomInset = 8 }: Props) {
  const { tokens } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        step: {
          paddingHorizontal: ROW_PADDING_H,
          paddingVertical: ROW_PADDING_V + 4,
          gap: 10,
        },
        stepMeta: {
          color: tokens.bottomSheetSecondaryText,
          fontSize: SECTION_HEADER_SIZE,
          fontWeight: "500",
          textTransform: "uppercase",
        },
        artWell: {
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingVertical: 6,
          borderRadius: CARD_RADIUS,
          backgroundColor: modeColorWithAlpha(tokens.bottomSheetSeparator, 0.14),
        },
        tipText: {
          color: tokens.bottomSheetText,
          fontSize: ROW_FONT_SIZE,
          lineHeight: 22,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: tokens.bottomSheetSeparator,
          marginLeft: ROW_PADDING_H,
        },
      }),
    [
      tokens.bottomSheetSecondaryText,
      tokens.bottomSheetSeparator,
      tokens.bottomSheetText,
    ],
  );

  const stroke = tokens.bottomSheetSecondaryText;
  const fill = tokens.bottomSheetText;

  return (
    <View style={{ paddingBottom: bottomInset }}>
      <SettingsGroupedSection contentStyle={{ paddingVertical: 4 }}>
        {APP_TIPS.map((tip, index) => {
          const isLast = index === APP_TIPS.length - 1;
          return (
            <View key={tip.id}>
              <View style={styles.step} accessibilityRole="text">
                <Text style={styles.stepMeta}>
                  Step {index + 1} of {APP_TIPS.length}
                </Text>
                <View style={styles.artWell}>
                  <TipsWalkthroughDrawing
                    tipId={tip.id}
                    size={64}
                    stroke={stroke}
                    fill={fill}
                  />
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </SettingsGroupedSection>
    </View>
  );
}
