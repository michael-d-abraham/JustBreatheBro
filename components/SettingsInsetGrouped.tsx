import { useTheme } from "@/components/Theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HORIZONTAL_INSET = 16;
const GROUP_SPACING = 20;
const CARD_RADIUS = 10;
const ROW_MIN_HEIGHT = 44;
const ICON_SIZE = 29;
const ICON_RADIUS = 7;
const COLLAPSE_DISTANCE = 50;
const STICKY_BAR_HEIGHT = 44;
const LARGE_TITLE_BLOCK = 42;
const IOS_LINK_BLUE = "#007AFF";
const BOTTOM_SHEET_TOP_PADDING = 0;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type LayoutVariant = "page" | "bottomSheet";

type LayoutProps = {
  title: string;
  onDone: () => void;
  children: React.ReactNode;
  variant?: LayoutVariant;
  doneTestID?: string;
  doneAccessibilityLabel?: string;
  /** Sub-screen back — shows chevron + label top-left */
  onBack?: () => void;
  backLabel?: string;
};

type SectionProps = {
  title?: string;
  children: React.ReactNode;
  /** Use for carousels that extend past card bounds */
  overflowVisible?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export type SettingsGroupedIcon = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  backgroundColor: string;
};

type RowProps = {
  title: string;
  onPress: () => void;
  icon: SettingsGroupedIcon;
  value?: string;
};

type LinkRowProps = {
  title: string;
  onPress: () => void;
  value?: string;
  showChevron?: boolean;
};

type ToggleRowProps = {
  title: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
};

type CheckRowProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
};

type FooterProps = {
  children: React.ReactNode;
};

function DoneButton({
  onPress,
  testID,
  accessibilityLabel = "Done",
  color,
}: {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  color: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={styles.doneButton}
    >
      <Text style={[styles.doneText, { color }]}>Done</Text>
    </Pressable>
  );
}

function BackButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.backButton}>
      <Ionicons name="chevron-back" size={22} color={IOS_LINK_BLUE} />
      <Text style={[styles.backText, { color: IOS_LINK_BLUE }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function InsetRowDivider({
  color,
  inset,
}: {
  color: string;
  inset: number;
}) {
  return (
    <View style={[styles.insetDivider, { backgroundColor: color, marginLeft: inset }]} />
  );
}

/** Full-screen or bottom-sheet chrome with iOS large-title collapse. */
export function SettingsInsetGroupedLayout({
  title,
  onDone,
  children,
  variant = "page",
  doneTestID,
  doneAccessibilityLabel = "Done",
  onBack,
  backLabel = "Back",
}: LayoutProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, COLLAPSE_DISTANCE],
          [0, -12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_DISTANCE * 0.4, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const stickyTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_DISTANCE * 0.5, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const isBottomSheet = variant === "bottomSheet";
  const headerInsetTop = isBottomSheet ? BOTTOM_SHEET_TOP_PADDING : insets.top;
  const topBarHeight = headerInsetTop + STICKY_BAR_HEIGHT;
  const fixedHeaderHeight = topBarHeight + LARGE_TITLE_BLOCK;
  const scrollHeaderPaddingTop = isBottomSheet ? fixedHeaderHeight : topBarHeight;

  const scrollContent = (
    <>
      {!isBottomSheet ? (
        <View
          style={[
            styles.scrollHeader,
            { paddingTop: scrollHeaderPaddingTop },
          ]}
        >
          <Animated.Text
            style={[
              styles.largeTitle,
              { color: tokens.bottomSheetText },
              largeTitleStyle,
            ]}
          >
            {title}
          </Animated.Text>
        </View>
      ) : null}

      <View
        style={[
          styles.childrenContainer,
          isBottomSheet && styles.childrenContainerSheet,
        ]}
      >
        {children}
      </View>
      <View style={{ height: insets.bottom + 24 }} />
    </>
  );

  const scrollContentStyle = [
    styles.scrollContent,
    isBottomSheet && { paddingTop: fixedHeaderHeight },
  ];

  const pageScrollProps = {
    onScroll: scrollHandler,
    scrollEventThrottle: 16 as const,
    showsVerticalScrollIndicator: false,
    contentContainerStyle: scrollContentStyle,
    style: styles.scrollView,
  };

  const sheetScrollProps = {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: scrollContentStyle,
    style: styles.scrollView,
  };

  return (
    <View
      style={[styles.root, { backgroundColor: tokens.systemGroupedBg }]}
    >
      <View
        pointerEvents="box-none"
        style={[
          styles.fixedHeader,
          {
            paddingTop: headerInsetTop,
            height: isBottomSheet ? fixedHeaderHeight : topBarHeight,
            backgroundColor: tokens.systemGroupedBg,
          },
        ]}
      >
        <View style={styles.topBarRow}>
          {onBack ? (
            <BackButton onPress={onBack} label={backLabel} />
          ) : (
            <View style={styles.topBarSpacer} />
          )}
          <View style={styles.topBarSpacer} />
          <DoneButton
            onPress={onDone}
            testID={doneTestID}
            accessibilityLabel={doneAccessibilityLabel}
            color={IOS_LINK_BLUE}
          />
        </View>

        {isBottomSheet ? (
          <Text
            style={[
              styles.largeTitle,
              styles.largeTitleFixed,
              { color: tokens.bottomSheetText },
            ]}
          >
            {title}
          </Text>
        ) : null}
      </View>

      {!isBottomSheet ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stickyHeader,
            { height: topBarHeight, paddingTop: headerInsetTop },
            stickyHeaderStyle,
          ]}
        >
          <BlurView
            intensity={80}
            tint="default"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.stickyHeaderContent, { height: STICKY_BAR_HEIGHT }]}>
            <View style={styles.topBarSpacer} />
            <Animated.Text
              style={[
                styles.stickyTitle,
                { color: tokens.bottomSheetText },
                stickyTitleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
            <View style={styles.donePlaceholder} />
          </View>
        </Animated.View>
      ) : null}

      {variant === "bottomSheet" ? (
        <BottomSheetScrollView {...sheetScrollProps}>
          {scrollContent}
        </BottomSheetScrollView>
      ) : (
        <AnimatedScrollView {...pageScrollProps}>{scrollContent}</AnimatedScrollView>
      )}
    </View>
  );
}

const GROUPED_ROW_NAMES = new Set([
  "SettingsGroupedRow",
  "SettingsGroupedLinkRow",
  "SettingsGroupedToggleRow",
  "SettingsGroupedCheckRow",
]);

function getRowDisplayName(type: unknown): string | undefined {
  if (typeof type === "function") {
    return (type as { displayName?: string }).displayName;
  }
  return undefined;
}

function isGroupedListRow(child: React.ReactNode): child is React.ReactElement {
  return (
    React.isValidElement(child) &&
    GROUPED_ROW_NAMES.has(getRowDisplayName(child.type) ?? "")
  );
}

function dividerInsetForRow(child: React.ReactElement): number {
  return getRowDisplayName(child.type) === "SettingsGroupedRow" ? 56 : 16;
}

/** Uppercase section label + inset grouped card. */
export function SettingsGroupedSection({
  title,
  children,
  overflowVisible = false,
  contentStyle,
}: SectionProps) {
  const { tokens } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: GROUP_SPACING,
        },
        sectionTitle: {
          color: tokens.bottomSheetSecondaryText,
          fontSize: 13,
          fontWeight: "400",
          letterSpacing: -0.08,
          textTransform: "uppercase",
          marginBottom: 6,
          marginLeft: HORIZONTAL_INSET + 4,
        },
        card: {
          marginHorizontal: HORIZONTAL_INSET,
          backgroundColor: tokens.systemSecondaryGroupedBg,
          borderRadius: CARD_RADIUS,
          overflow: overflowVisible ? "visible" : "hidden",
        },
      }),
    [tokens.bottomSheetSecondaryText, tokens.systemSecondaryGroupedBg, overflowVisible],
  );

  const childArray = React.Children.toArray(children);
  const hasRowsOnly = childArray.every(isGroupedListRow);

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={[styles.card, contentStyle]}>
        {hasRowsOnly
          ? childArray.map((child, index) => (
              <React.Fragment key={index}>
                {child}
                {index < childArray.length - 1 ? (
                  <InsetRowDivider
                    color={tokens.bottomSheetSeparator}
                    inset={dividerInsetForRow(child)}
                  />
                ) : null}
              </React.Fragment>
            ))
          : children}
      </View>
    </View>
  );
}

/** Tappable settings row with colored icon badge and chevron. */
export function SettingsGroupedRow({ title, onPress, icon, value }: RowProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: icon.backgroundColor },
        ]}
      >
        <Ionicons name={icon.name} size={17} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.rowTitle, { color: tokens.bottomSheetText }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {value ? (
        <Text
          style={[styles.rowValue, { color: tokens.bottomSheetSecondaryText }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={tokens.bottomSheetSecondaryText}
        style={styles.chevron}
      />
    </Pressable>
  );
}
SettingsGroupedRow.displayName = "SettingsGroupedRow";

/** Plain tappable row (no icon) — sub-screens and drill-down lists. */
export function SettingsGroupedLinkRow({
  title,
  onPress,
  value,
  showChevron = true,
}: LinkRowProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.plainRow,
        pressed && styles.rowPressed,
      ]}
    >
      <Text
        style={[styles.plainRowTitle, { color: tokens.bottomSheetText }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {value ? (
        <Text
          style={[styles.rowValue, { color: tokens.bottomSheetSecondaryText }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={tokens.bottomSheetSecondaryText}
          style={styles.chevron}
        />
      ) : null}
    </Pressable>
  );
}
SettingsGroupedLinkRow.displayName = "SettingsGroupedLinkRow";

/** Row with native switch — no chevron. */
export function SettingsGroupedToggleRow({
  title,
  value,
  onValueChange,
}: ToggleRowProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.plainRow}>
      <Text
        style={[styles.plainRowTitle, { color: tokens.bottomSheetText }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: tokens.bottomSheetSeparator,
          true: "#34C759",
        }}
      />
    </View>
  );
}
SettingsGroupedToggleRow.displayName = "SettingsGroupedToggleRow";

/** Selectable row with checkmark when selected. */
export function SettingsGroupedCheckRow({
  title,
  selected,
  onPress,
}: CheckRowProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.plainRow,
        pressed && styles.rowPressed,
      ]}
    >
      <Text
        style={[styles.plainRowTitle, { color: tokens.bottomSheetText }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {selected ? (
        <Ionicons name="checkmark" size={20} color={IOS_LINK_BLUE} />
      ) : null}
    </Pressable>
  );
}
SettingsGroupedCheckRow.displayName = "SettingsGroupedCheckRow";

/** Centered caption below grouped sections (version, tagline). */
export function SettingsGroupedFooter({ children }: FooterProps) {
  const { tokens } = useTheme();

  return (
    <Text style={[styles.footer, { color: tokens.bottomSheetSecondaryText }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollHeader: {
    paddingHorizontal: HORIZONTAL_INSET,
    paddingBottom: 4,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    paddingHorizontal: HORIZONTAL_INSET,
    backgroundColor: "transparent",
  },
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: STICKY_BAR_HEIGHT,
  },
  topBarSpacer: {
    flex: 1,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.37,
  },
  largeTitleFixed: {
    marginTop: 2,
    marginBottom: 4,
  },
  childrenContainer: {
    paddingTop: 4,
  },
  childrenContainerSheet: {
    paddingTop: 0,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_INSET,
  },
  stickyTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.41,
  },
  doneButton: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: "flex-end",
  },
  doneText: {
    fontSize: 17,
    fontWeight: "600",
  },
  donePlaceholder: {
    minWidth: 56,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "45%",
    paddingVertical: 8,
    marginLeft: -6,
  },
  backText: {
    fontSize: 17,
    marginLeft: -2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: ROW_MIN_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowPressed: {
    opacity: 0.65,
  },
  iconBadge: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.41,
  },
  plainRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: ROW_MIN_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  plainRowTitle: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.41,
  },
  rowValue: {
    fontSize: 17,
    marginRight: 6,
    letterSpacing: -0.41,
  },
  chevron: {
    marginLeft: 2,
  },
  insetDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  footer: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: HORIZONTAL_INSET + 8,
    marginTop: 4,
    marginBottom: 12,
  },
});
