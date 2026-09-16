import LearnGlassPanel from "@/components/learn/LearnGlassPanel";
import LearnSectionRow from "@/components/learn/LearnSectionRow";
import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { useLearnChromeColors } from "@/components/learn/useLearnChromeColors";
import { LEARN_SECTIONS, LearnSectionId } from "@/lib/learnContent";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  activeSectionId: LearnSectionId | null;
  onSectionPress: (sectionId: LearnSectionId) => void;
  chromeVariant?: "tab" | "sheet";
};

export default function LearnSectionList({
  activeSectionId,
  onSectionPress,
  chromeVariant = "tab",
}: Props) {
  const colors = useLearnChromeColors(chromeVariant);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heading: {
          color: colors.onWallpaper,
          fontSize: LEARN_TAB.sectionHeadingSize,
          fontWeight: LEARN_TAB.sectionHeadingWeight,
          letterSpacing: -0.3,
          marginBottom: 8,
        },
      }),
    [colors.onWallpaper],
  );

  return (
    <View>
      <Text style={styles.heading}>Explore</Text>
      <LearnGlassPanel>
        {LEARN_SECTIONS.map((section, index) => (
          <LearnSectionRow
            key={section.id}
            title={section.title}
            selected={activeSectionId === section.id}
            onPress={() => onSectionPress(section.id)}
            showDivider={index < LEARN_SECTIONS.length - 1}
            testID={`learn.section-${section.id}`}
          />
        ))}
      </LearnGlassPanel>
    </View>
  );
}
