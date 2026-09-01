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
  type ColorValue,
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

/** Shared iOS Settings layout tokens — single source for all settings screens. */
export const SETTINGS_LAYOUT = {
  horizontalInset: 16,
  groupSpacing: 16,
  cardRadius: 11,
  rowMinHeight: 42,
  rowPaddingVertical: 4,
  rowPaddingHorizontal: 16,
  iconSize: 28,
  iconRadius: 6.5,
  iconGlyphSize: 15,
  iconMarginRight: 10,
  chevronSize: 13,
  sectionHeaderSize: 13,
  sectionHeaderMarginBottom: 8,
  sectionHeaderInset: 20,
  rowFontSize: 17,
  collapseDistance: 44,
  stickyBarHeight: 44,
  largeTitleSizePage: 32,
  largeTitleSizeSheet: 28,
  largeTitleBlockPage: 36,
  largeTitleBlockSheet: 28,
  /** Space between large title and first section content */
  largeTitleContentGapPage: 16,
  largeTitleContentGapSheet: 20,
  headerSubtitleSize: 15,
  headerSubtitleBlock: 38,
  stickyBarHeightSheet: 36,
  closeIconSize: 22,
  bottomSheetTopPadding: 0,
} as const;

const {
  horizontalInset: HORIZONTAL_INSET,
  groupSpacing: GROUP_SPACING,
  cardRadius: CARD_RADIUS,
  rowMinHeight: ROW_MIN_HEIGHT,
  rowPaddingVertical: ROW_PADDING_VERTICAL,
  rowPaddingHorizontal: ROW_PADDING_HORIZONTAL,
  iconSize: ICON_SIZE,
  iconRadius: ICON_RADIUS,
  iconGlyphSize: ICON_GLYPH_SIZE,
  iconMarginRight: ICON_MARGIN_RIGHT,
  chevronSize: CHEVRON_SIZE,
  sectionHeaderSize: SECTION_HEADER_SIZE,
  sectionHeaderMarginBottom: SECTION_HEADER_MARGIN_BOTTOM,
  sectionHeaderInset: SECTION_HEADER_INSET,
  rowFontSize: ROW_FONT_SIZE,
  collapseDistance: COLLAPSE_DISTANCE,
  stickyBarHeight: STICKY_BAR_HEIGHT,
  largeTitleSizePage: LARGE_TITLE_SIZE_PAGE,
  largeTitleSizeSheet: LARGE_TITLE_SIZE_SHEET,
  largeTitleBlockPage: LARGE_TITLE_BLOCK_PAGE,
  largeTitleBlockSheet: LARGE_TITLE_BLOCK_SHEET,
  bottomSheetTopPadding: BOTTOM_SHEET_TOP_PADDING,
} = SETTINGS_LAYOUT;

const LARGE_TITLE_CONTENT_GAP_PAGE = SETTINGS_LAYOUT.largeTitleContentGapPage;
const LARGE_TITLE_CONTENT_GAP_SHEET = SETTINGS_LAYOUT.largeTitleContentGapSheet;
const STICKY_BAR_HEIGHT_SHEET = SETTINGS_LAYOUT.stickyBarHeightSheet;
const CLOSE_ICON_SIZE = SETTINGS_LAYOUT.closeIconSize;

const ICON_ROW_DIVIDER_INSET =
  ROW_PADDING_HORIZONTAL + ICON_SIZE + ICON_MARGIN_RIGHT;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type LayoutVariant = "page" | "bottomSheet";

type LayoutProps = {
  title: string;
  onDone: () => void;
  children: React.ReactNode;
  variant?: LayoutVariant;
  doneTestID?: string;
  doneAccessibilityLabel?: string;
  /** Secondary copy below the large title (bottom sheet). */
  subtitle?: string;
  /** When set (e.g. "Done"), shows a text action instead of the × close icon. */
  headerActionLabel?: string;
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
  /** Section header only — no grouped white card (e.g. horizontal scene cards). */
  bare?: boolean;
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

function DoneTextButton({
  onPress,
  testID,
  accessibilityLabel = "Done",
  color,
  style,
}: {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={[styles.doneTextButton, style]}
    >
      <Text style={[styles.doneText, { color }]}>Done</Text>
    </Pressable>
  );
}

function CloseButton({
  onPress,
  testID,
  accessibilityLabel = "Close",
  color,
  style,
}: {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={[styles.closeButton, style]}
    >
      <Ionicons name="close" size={CLOSE_ICON_SIZE} color={color} />
    </Pressable>
  );
}

function BackButton({
  onPress,
  label,
  color,
}: {
  onPress: () => void;
  label: string;
  color: ColorValue;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.backButton}>
      <Ionicons name="chevron-back" size={20} color={color} />
      <Text style={[styles.backText, { color }]} numberOfLines={1}>
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
  doneAccessibilityLabel = "Close",
  subtitle,
  headerActionLabel,
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
  const largeTitleSize = isBottomSheet
    ? LARGE_TITLE_SIZE_SHEET
    : LARGE_TITLE_SIZE_PAGE;
  const largeTitleBlock = isBottomSheet
    ? LARGE_TITLE_BLOCK_SHEET
    : LARGE_TITLE_BLOCK_PAGE;
  const barHeight = isBottomSheet ? STICKY_BAR_HEIGHT_SHEET : STICKY_BAR_HEIGHT;
  const contentGapBelowTitle = isBottomSheet
    ? LARGE_TITLE_CONTENT_GAP_SHEET
    : LARGE_TITLE_CONTENT_GAP_PAGE;
  const headerInsetTop = isBottomSheet ? BOTTOM_SHEET_TOP_PADDING : insets.top;
  const topBarHeight = headerInsetTop + barHeight;
  const subtitleBlock =
    isBottomSheet && subtitle ? SETTINGS_LAYOUT.headerSubtitleBlock : 0;
  const fixedHeaderHeight = topBarHeight + largeTitleBlock + subtitleBlock;
  const scrollHeaderPaddingTop = isBottomSheet ? fixedHeaderHeight : topBarHeight;

  const scrollContent = (
    <>
      {!isBottomSheet ? (
        <View
          style={[
            styles.scrollHeader,
            {
              paddingTop: scrollHeaderPaddingTop,
              paddingBottom: contentGapBelowTitle,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.largeTitle,
              { color: tokens.settingsLabel, fontSize: largeTitleSize },
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
    isBottomSheet && { paddingTop: fixedHeaderHeight + contentGapBelowTitle },
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
        {isBottomSheet ? (
          headerActionLabel ? (
            <DoneTextButton
              onPress={onDone}
              testID={doneTestID}
              accessibilityLabel={doneAccessibilityLabel}
              color={tokens.settingsLink}
              style={styles.sheetCloseAbsolute}
            />
          ) : (
            <CloseButton
              onPress={onDone}
              testID={doneTestID}
              accessibilityLabel={doneAccessibilityLabel}
              color={tokens.settingsSecondaryLabel}
              style={styles.sheetCloseAbsolute}
            />
          )
        ) : null}

        {!isBottomSheet ? (
          <View style={[styles.topBarRow, { height: barHeight }]}>
            {onBack ? (
              <BackButton
                onPress={onBack}
                label={backLabel}
                color={tokens.settingsLink}
              />
            ) : (
              <View style={styles.topBarSpacer} />
            )}
            <View style={styles.topBarSpacer} />
            <CloseButton
              onPress={onDone}
              testID={doneTestID}
              accessibilityLabel={doneAccessibilityLabel}
              color={tokens.settingsSecondaryLabel}
            />
          </View>
        ) : (
          <View style={[styles.topBarRow, { height: barHeight }]}>
            {onBack ? (
              <BackButton
                onPress={onBack}
                label={backLabel}
                color={tokens.settingsLink}
              />
            ) : (
              <View style={styles.topBarSpacer} />
            )}
            <View style={styles.topBarSpacer} />
            <View style={styles.closePlaceholder} />
          </View>
        )}

        {isBottomSheet ? (
          <View style={styles.sheetTitleBlock}>
            <Text
              style={[
                styles.largeTitle,
                styles.largeTitleFixedSheet,
                subtitle || onBack
                  ? styles.largeTitleSheetSub
                  : styles.largeTitleCentered,
                { color: tokens.settingsLabel, fontSize: largeTitleSize },
              ]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: tokens.settingsSecondaryLabel },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {!isBottomSheet ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stickyHeader,
            {
              height: topBarHeight,
              paddingTop: headerInsetTop,
              borderBottomColor: tokens.settingsSeparator,
            },
            stickyHeaderStyle,
          ]}
        >
          <BlurView
            intensity={60}
            tint="default"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.stickyHeaderContent, { height: STICKY_BAR_HEIGHT }]}>
            <View style={styles.topBarSpacer} />
            <Animated.Text
              style={[
                styles.stickyTitle,
                { color: tokens.settingsLabel },
                stickyTitleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
            <View style={styles.closePlaceholder} />
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
  return getRowDisplayName(child.type) === "SettingsGroupedRow"
    ? ICON_ROW_DIVIDER_INSET
    : ROW_PADDING_HORIZONTAL;
}

/** Uppercase section label — SESSION, THEME, etc. */
export function SettingsSectionHeader({ title }: { title: string }) {
  const { tokens } = useTheme();

  return (
    <Text
      style={{
        color: tokens.settingsSecondaryLabel,
        fontSize: SECTION_HEADER_SIZE,
        fontWeight: "500",
        letterSpacing: 0,
        textTransform: "uppercase",
        marginBottom: SECTION_HEADER_MARGIN_BOTTOM,
        marginLeft: SECTION_HEADER_INSET,
      }}
    >
      {title}
    </Text>
  );
}

/** Uppercase section label + inset grouped card. */
export function SettingsGroupedSection({
  title,
  children,
  overflowVisible = false,
  contentStyle,
  bare = false,
}: SectionProps) {
  const { tokens } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: GROUP_SPACING,
        },
        card: {
          marginHorizontal: HORIZONTAL_INSET,
          backgroundColor: tokens.systemSecondaryGroupedBg,
          borderRadius: CARD_RADIUS,
          overflow: overflowVisible ? "visible" : "hidden",
        },
      }),
    [tokens.systemSecondaryGroupedBg, overflowVisible],
  );

  const childArray = React.Children.toArray(children);
  const hasRowsOnly = childArray.every(isGroupedListRow);

  return (
    <View style={styles.section}>
      {title ? <SettingsSectionHeader title={title} /> : null}
      {bare ? (
        children
      ) : (
        <View style={[styles.card, contentStyle]}>
          {hasRowsOnly
            ? childArray.map((child, index) => (
                <React.Fragment key={index}>
                  {child}
                  {index < childArray.length - 1 ? (
                    <InsetRowDivider
                      color={tokens.settingsSeparator}
                      inset={dividerInsetForRow(child)}
                    />
                  ) : null}
                </React.Fragment>
              ))
            : children}
        </View>
      )}
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
        <Ionicons name={icon.name} size={ICON_GLYPH_SIZE} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.rowTitle, { color: tokens.settingsLabel }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {value ? (
        <Text
          style={[styles.rowValue, { color: tokens.settingsSecondaryLabel }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={CHEVRON_SIZE}
        color={tokens.settingsTertiaryLabel}
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
        style={[styles.plainRowTitle, { color: tokens.settingsLabel }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {value ? (
        <Text
          style={[styles.rowValue, { color: tokens.settingsSecondaryLabel }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={CHEVRON_SIZE}
          color={tokens.settingsTertiaryLabel}
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
        style={[styles.plainRowTitle, { color: tokens.settingsLabel }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
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
        style={[styles.plainRowTitle, { color: tokens.settingsLabel }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {selected ? (
        <Ionicons name="checkmark" size={18} color={tokens.settingsLink} />
      ) : null}
    </Pressable>
  );
}
SettingsGroupedCheckRow.displayName = "SettingsGroupedCheckRow";

/** Centered caption below grouped sections (version, tagline). */
export function SettingsGroupedFooter({ children }: FooterProps) {
  const { tokens } = useTheme();

  return (
    <Text style={[styles.footer, { color: tokens.settingsSecondaryLabel }]}>
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
    fontWeight: "700",
    letterSpacing: 0.35,
  },
  largeTitleFixed: {
    marginTop: 0,
    marginBottom: 2,
  },
  largeTitleFixedSheet: {
    marginTop: -4,
    marginBottom: 0,
  },
  sheetTitleBlock: {
    paddingHorizontal: 0,
  },
  headerSubtitle: {
    fontSize: SETTINGS_LAYOUT.headerSubtitleSize,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: -0.24,
    marginTop: 4,
    paddingHorizontal: HORIZONTAL_INSET,
  },
  largeTitleCentered: {
    textAlign: "center",
    alignSelf: "stretch",
  },
  largeTitleSheetSub: {
    textAlign: "left",
    paddingHorizontal: HORIZONTAL_INSET,
  },
  sheetCloseAbsolute: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 12,
  },
  doneTextButton: {
    paddingHorizontal: HORIZONTAL_INSET,
    paddingVertical: 4,
    minHeight: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  doneText: {
    fontSize: 17,
    fontWeight: "600",
  },
  childrenContainer: {
    paddingTop: 2,
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
  closeButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closePlaceholder: {
    width: 44,
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
    paddingHorizontal: ROW_PADDING_HORIZONTAL,
    paddingVertical: ROW_PADDING_VERTICAL,
  },
  rowPressed: {
    opacity: 0.55,
  },
  iconBadge: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    marginRight: ICON_MARGIN_RIGHT,
  },
  rowTitle: {
    flex: 1,
    fontSize: ROW_FONT_SIZE,
    fontWeight: "400",
    letterSpacing: -0.41,
  },
  plainRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: ROW_MIN_HEIGHT,
    paddingHorizontal: ROW_PADDING_HORIZONTAL,
    paddingVertical: ROW_PADDING_VERTICAL,
  },
  plainRowTitle: {
    flex: 1,
    fontSize: ROW_FONT_SIZE,
    fontWeight: "400",
    letterSpacing: -0.41,
  },
  rowValue: {
    fontSize: ROW_FONT_SIZE,
    fontWeight: "400",
    marginRight: 4,
    letterSpacing: -0.41,
  },
  chevron: {
    marginLeft: 0,
    opacity: 0.85,
  },
  insetDivider: {
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    textAlign: "center",
    fontSize: SECTION_HEADER_SIZE,
    lineHeight: 18,
    marginHorizontal: HORIZONTAL_INSET + 8,
    marginTop: 2,
    marginBottom: 8,
  },
});

/** Canonical settings primitives — prefer these names in screen code. */
export const SettingsSection = SettingsGroupedSection;
export const SettingsRow = SettingsGroupedRow;
