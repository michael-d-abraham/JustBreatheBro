import { useTheme } from "@/components/Theme";
import {
  getSettingsPickerCardWidth,
  settingsPickerBorderStyle,
  settingsPickerCard,
  settingsPickerSurfaceColor,
  settingsPreviewCircleStyle,
  settingsScreenPadding,
  settingsSelectionIndicator,
} from "@/components/settingsScreenTokens";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/** @deprecated import from settingsScreenTokens */
export const SETTINGS_OPTION_CARD = {
  radius: settingsPickerCard.radius,
  gap: settingsPickerCard.gap,
  screenInset: settingsScreenPadding,
  selectedBorderWidth: settingsSelectionIndicator.borderWidth,
  checkBadgeSize: settingsSelectionIndicator.size,
  checkBadgeInset: settingsSelectionIndicator.inset,
  checkGlyphSize: settingsSelectionIndicator.glyphSize,
  titleSize: settingsPickerCard.titleSize,
  contentCardHeight: settingsPickerCard.contentCardHeight,
  previewHeight: settingsPickerCard.previewHeight,
  previewCircleSize: settingsPickerCard.previewCircleSize,
  pickerScrollVisibleCount: settingsPickerCard.scrollVisibleCount,
  sceneWidthScale: settingsPickerCard.sceneWidthScale,
  sceneAspectRatio: settingsPickerCard.sceneAspectRatio,
  pressedOpacity: settingsSelectionIndicator.pressedOpacity,
} as const;

export function getScrollPickerCardWidth(
  screenWidth: number,
  visibleCount = settingsPickerCard.scrollVisibleCount,
): number {
  return getSettingsPickerCardWidth(screenWidth, visibleCount);
}

export function useScrollPickerCardWidth(
  visibleCount = settingsPickerCard.scrollVisibleCount,
): number {
  const { width: screenWidth } = useWindowDimensions();
  return getSettingsPickerCardWidth(screenWidth, visibleCount);
}

export function usePickerCardWidth(): number {
  return useScrollPickerCardWidth();
}

export function getSceneCardWidth(pickerCardWidth: number): number {
  return Math.round(pickerCardWidth * settingsPickerCard.sceneWidthScale);
}

export function getSceneCardHeight(sceneWidth: number): number {
  return Math.round(sceneWidth / settingsPickerCard.sceneAspectRatio);
}

export function useSceneCardDimensions(): { width: number; height: number } {
  const pickerWidth = usePickerCardWidth();
  const width = getSceneCardWidth(pickerWidth);
  return { width, height: getSceneCardHeight(width) };
}

/** @deprecated use settingsPickerSurfaceColor */
export function optionCardSurfaceColor(
  mode: "light" | "dark",
  groupedSecondary: ColorValue,
): ColorValue {
  return settingsPickerSurfaceColor(mode, groupedSecondary);
}

/** @deprecated selection no longer tints card background */
export function optionCardSelectedBackground(_accentColor: unknown): string {
  return "transparent";
}

/** @deprecated use settingsPickerBorderStyle */
export function optionCardBorderStyle(
  selected: boolean,
  _accentColor: unknown,
  separator: ColorValue,
): ViewStyle {
  return settingsPickerBorderStyle(selected, separator);
}

/** Unified checkmark — same on Theme, Soundscape, and Scenes. */
export function SettingsSelectionIndicator() {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        styles.checkBadge,
        { backgroundColor: tokens.settingsLink },
      ]}
    >
      <Ionicons
        name="checkmark"
        size={settingsSelectionIndicator.glyphSize}
        color="#FFFFFF"
      />
    </View>
  );
}

/** @deprecated use SettingsSelectionIndicator */
export function SettingsOptionCheckBadge({
  accentColor,
}: {
  accentColor?: ColorValue;
}) {
  void accentColor;
  return <SettingsSelectionIndicator />;
}

export function SettingsOptionPreviewCircle({
  accentColor,
  size = settingsPickerCard.previewCircleSize,
  children,
}: {
  accentColor: unknown;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={settingsPreviewCircleStyle(accentColor, size)}>
      {children}
    </View>
  );
}

type CardProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
  /** Accent for preview circle only — not selection chrome. */
  accentColor: unknown;
  backgroundColor: ColorValue;
  width?: number;
  height?: number;
  testID?: string;
  accessibilityLabel?: string;
  children: React.ReactNode;
};

/** Compact picker tile — Theme and Soundscape. */
export function SettingsOptionCard({
  title,
  selected,
  onPress,
  accentColor,
  backgroundColor,
  width,
  height = settingsPickerCard.contentCardHeight,
  testID,
  accessibilityLabel,
  children,
}: CardProps) {
  const { tokens } = useTheme();

  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          width,
          minWidth: 0,
        },
        card: {
          ...settingsPickerBorderStyle(
            selected,
            tokens.settingsSeparator,
          ),
          backgroundColor,
          height,
          paddingHorizontal: settingsPickerCard.cardPaddingHorizontal,
          paddingVertical: settingsPickerCard.cardPaddingVertical,
          overflow: "hidden",
        },
        preview: {
          height: settingsPickerCard.previewHeight,
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          color: tokens.settingsLabel,
          fontSize: settingsPickerCard.titleSize,
          fontWeight: "600",
          letterSpacing: -0.2,
          textAlign: "center",
          marginTop: 4,
          height: settingsPickerCard.titleBlockHeight,
          lineHeight: settingsPickerCard.titleSize + 2,
        },
      }),
    [
      backgroundColor,
      height,
      selected,
      tokens.settingsLabel,
      tokens.settingsSeparator,
      width,
    ],
  );

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.root,
        pressed && { opacity: settingsSelectionIndicator.pressedOpacity },
      ]}
    >
      <View style={cardStyles.card}>
        {selected ? <SettingsSelectionIndicator /> : null}
        <View style={cardStyles.preview}>{children}</View>
        <Text style={cardStyles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

type RowProps = {
  children: React.ReactNode;
  peek?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SettingsOptionCardRow({
  children,
  peek = true,
  contentStyle,
}: RowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rowScroll}
      contentContainerStyle={[
        styles.rowContent,
        peek && styles.rowContentPeek,
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function SettingsOptionCardGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  checkBadge: {
    position: "absolute",
    top: settingsSelectionIndicator.inset,
    right: settingsSelectionIndicator.inset,
    width: settingsSelectionIndicator.size,
    height: settingsSelectionIndicator.size,
    borderRadius: settingsSelectionIndicator.size / 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  rowScroll: {
    flexGrow: 0,
  },
  rowContent: {
    flexDirection: "row",
    gap: settingsPickerCard.gap,
    paddingHorizontal: settingsPickerCard.screenInset,
  },
  rowContentPeek: {
    paddingRight: settingsPickerCard.screenInset + 24,
  },
  grid: {
    flexDirection: "row",
    gap: settingsPickerCard.gap,
    paddingHorizontal: settingsPickerCard.screenInset,
  },
});
