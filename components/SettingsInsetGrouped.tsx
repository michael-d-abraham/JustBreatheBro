import { useTheme } from "@/components/Theme";
import { modeColorWithAlpha } from "@/components/modeTokens";
import { getAppVersionMetadata } from "@/lib/appVersion";
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
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Shared iOS Settings layout tokens — single source for all settings screens. */
export const SETTINGS_LAYOUT = {
  horizontalInset: 16,
  /** Vertical space between grouped sections (header + card blocks). */
  groupSpacing: 22,
  cardRadius: 12,
  /** Matches iOS minimum grouped row height; rows grow with content + padding. */
  rowMinHeight: 44,
  rowPaddingVertical: 8,
  rowPaddingHorizontal: 16,
  /** Monochrome leading symbol — no colored tile */
  rowIconSize: 22,
  rowIconSlotWidth: 26,
  rowIconMarginRight: 12,
  chevronSize: 14,
  sectionHeaderSize: 13,
  sectionHeaderMarginBottom: 10,
  sectionHeaderInset: 20,
  rowFontSize: 17,
  /** Supporting links (legal, etc.) — slightly softer than primary rows */
  subduedLinkFontSize: 16,
  collapseDistance: 44,
  stickyBarHeight: 44,
  largeTitleSizePage: 32,
  largeTitleSizeSheet: 28,
  largeTitleBlockPage: 36,
  /** Line box for sheet large title — must exceed largeTitleSizeSheet */
  largeTitleBlockSheet: 34,
  /** Space between large title and first section content */
  largeTitleContentGapPage: 20,
  largeTitleContentGapSheet: 18,
  /** Extra space above first grouped section inside scroll body */
  contentBodyTopPadding: 4,
  headerSubtitleSize: 15,
  headerSubtitleBlock: 38,
  stickyBarHeightSheet: 36,
  closeIconSize: 22,
  /** Compact inset below the native sheet handle before title / back row */
  sheetHeaderTopInset: 12,
  /** Floating sticky title pill (sheet scroll collapse) */
  sheetStickyPillFontSize: 17,
  sheetStickyPillPaddingHorizontal: 16,
  sheetStickyPillPaddingVertical: 8,
  sheetStickyPillMinHeight: 36,
  sheetStickyPillBlurIntensity: 50,
  /** Translucent tint over blur — keeps frosted look without a solid fill */
  sheetStickyPillSurfaceAlpha: 0.38,
  bottomSheetTopPadding: 0,
  footerMarginTop: 6,
  footerMarginBottom: 14,
  footerLineHeight: 20,
  /** Settings screen end matter — tagline + version metadata */
  footerTaglineSize: 13,
  footerTaglineLineHeight: 18,
  footerTaglineMarginTop: 20,
  footerVersionSize: 12,
  footerVersionLineHeight: 16,
  footerVersionMarginTop: 10,
  footerScreenMarginBottom: 20,
} as const;

const {
  horizontalInset: HORIZONTAL_INSET,
  groupSpacing: GROUP_SPACING,
  cardRadius: CARD_RADIUS,
  rowMinHeight: ROW_MIN_HEIGHT,
  rowPaddingVertical: ROW_PADDING_VERTICAL,
  rowPaddingHorizontal: ROW_PADDING_HORIZONTAL,
  rowIconSize: ROW_ICON_SIZE,
  rowIconSlotWidth: ROW_ICON_SLOT_WIDTH,
  rowIconMarginRight: ROW_ICON_MARGIN_RIGHT,
  chevronSize: CHEVRON_SIZE,
  sectionHeaderSize: SECTION_HEADER_SIZE,
  sectionHeaderMarginBottom: SECTION_HEADER_MARGIN_BOTTOM,
  sectionHeaderInset: SECTION_HEADER_INSET,
  rowFontSize: ROW_FONT_SIZE,
  subduedLinkFontSize: SUBDUED_LINK_FONT_SIZE,
  collapseDistance: COLLAPSE_DISTANCE,
  stickyBarHeight: STICKY_BAR_HEIGHT,
  largeTitleSizePage: LARGE_TITLE_SIZE_PAGE,
  largeTitleSizeSheet: LARGE_TITLE_SIZE_SHEET,
  largeTitleBlockPage: LARGE_TITLE_BLOCK_PAGE,
  largeTitleBlockSheet: LARGE_TITLE_BLOCK_SHEET,
} = SETTINGS_LAYOUT;

const LARGE_TITLE_CONTENT_GAP_PAGE = SETTINGS_LAYOUT.largeTitleContentGapPage;
const LARGE_TITLE_CONTENT_GAP_SHEET = SETTINGS_LAYOUT.largeTitleContentGapSheet;
const STICKY_BAR_HEIGHT_SHEET = SETTINGS_LAYOUT.stickyBarHeightSheet;
const SHEET_HEADER_TOP_INSET = SETTINGS_LAYOUT.sheetHeaderTopInset;
const SHEET_STICKY_PILL_FONT_SIZE = SETTINGS_LAYOUT.sheetStickyPillFontSize;
const SHEET_STICKY_PILL_PADDING_H = SETTINGS_LAYOUT.sheetStickyPillPaddingHorizontal;
const SHEET_STICKY_PILL_PADDING_V = SETTINGS_LAYOUT.sheetStickyPillPaddingVertical;
const SHEET_STICKY_PILL_MIN_HEIGHT = SETTINGS_LAYOUT.sheetStickyPillMinHeight;
const SHEET_STICKY_PILL_BLUR_INTENSITY =
  SETTINGS_LAYOUT.sheetStickyPillBlurIntensity;
const SHEET_STICKY_PILL_SURFACE_ALPHA =
  SETTINGS_LAYOUT.sheetStickyPillSurfaceAlpha;
const CLOSE_ICON_SIZE = SETTINGS_LAYOUT.closeIconSize;
const CONTENT_BODY_TOP_PADDING = SETTINGS_LAYOUT.contentBodyTopPadding;
const FOOTER_MARGIN_TOP = SETTINGS_LAYOUT.footerMarginTop;
const FOOTER_MARGIN_BOTTOM = SETTINGS_LAYOUT.footerMarginBottom;
const FOOTER_LINE_HEIGHT = SETTINGS_LAYOUT.footerLineHeight;
const FOOTER_TAGLINE_SIZE = SETTINGS_LAYOUT.footerTaglineSize;
const FOOTER_TAGLINE_LINE_HEIGHT = SETTINGS_LAYOUT.footerTaglineLineHeight;
const FOOTER_TAGLINE_MARGIN_TOP = SETTINGS_LAYOUT.footerTaglineMarginTop;
const FOOTER_VERSION_SIZE = SETTINGS_LAYOUT.footerVersionSize;
const FOOTER_VERSION_LINE_HEIGHT = SETTINGS_LAYOUT.footerVersionLineHeight;
const FOOTER_VERSION_MARGIN_TOP = SETTINGS_LAYOUT.footerVersionMarginTop;
const FOOTER_SCREEN_MARGIN_BOTTOM = SETTINGS_LAYOUT.footerScreenMarginBottom;

const ICON_ROW_DIVIDER_INSET =
  ROW_PADDING_HORIZONTAL + ROW_ICON_SLOT_WIDTH + ROW_ICON_MARGIN_RIGHT;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedBottomSheetScrollView =
  Animated.createAnimatedComponent(BottomSheetScrollView);
const AnimatedStickyHeader = Animated.createAnimatedComponent(View);

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

export type SettingsRowIconName = React.ComponentProps<typeof Ionicons>["name"];

export type SettingsGroupedIcon = {
  name: SettingsRowIconName;
  /** Core rows default to primary; About/legal use quiet */
  emphasis?: "primary" | "quiet";
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
  icon?: SettingsGroupedIcon;
  /** Softer treatment for supporting links (legal, etc.) */
  subdued?: boolean;
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
      <Text style={[styles.backText, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Swipe handle is primary; this keeps VoiceOver + Maestro dismiss without a visible ×. */
function SheetDismissControl({
  onPress,
  testID,
  accessibilityLabel = "Close",
}: {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Swipe down to dismiss"
      style={styles.sheetDismissA11y}
    />
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
  onBack,
  backLabel = "Back",
}: LayoutProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const sheetBackground = tokens.settingsSheetBackground;

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

  const sheetStickyPillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_DISTANCE * 0.35, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, COLLAPSE_DISTANCE],
          [-8, 0],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [0, COLLAPSE_DISTANCE],
          [0.88, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const sheetStickyPointerProps = useAnimatedProps(() => ({
    pointerEvents:
      scrollY.value > COLLAPSE_DISTANCE * 0.25 ? ("box-none" as const) : ("none" as const),
  }));

  const isBottomSheet = variant === "bottomSheet";
  const largeTitleSize = isBottomSheet
    ? LARGE_TITLE_SIZE_SHEET
    : LARGE_TITLE_SIZE_PAGE;
  const largeTitleBlock = isBottomSheet
    ? LARGE_TITLE_BLOCK_SHEET
    : LARGE_TITLE_BLOCK_PAGE;
  const pageBarHeight = STICKY_BAR_HEIGHT;
  const contentGapBelowTitle = isBottomSheet
    ? LARGE_TITLE_CONTENT_GAP_SHEET
    : LARGE_TITLE_CONTENT_GAP_PAGE;
  const headerInsetTop = isBottomSheet ? SHEET_HEADER_TOP_INSET : insets.top;
  const topBarHeight = headerInsetTop + pageBarHeight;
  const sheetStickyBarHeight = STICKY_BAR_HEIGHT_SHEET;
  const sheetStickyOverlayHeight =
    SHEET_HEADER_TOP_INSET + SHEET_STICKY_PILL_MIN_HEIGHT + 8;

  const sheetStickyPillOverlay = modeColorWithAlpha(
    tokens.mode.overlaySurface,
    SHEET_STICKY_PILL_SURFACE_ALPHA,
  );

  const scrollHeaderPaddingTop = isBottomSheet
    ? onBack
      ? SHEET_HEADER_TOP_INSET + sheetStickyBarHeight + 4
      : SHEET_HEADER_TOP_INSET
    : topBarHeight;

  const scrollContent = (
    <>
      <View
        style={[
          styles.scrollHeader,
          isBottomSheet && styles.sheetScrollHeader,
          {
            paddingTop: scrollHeaderPaddingTop,
            paddingBottom: contentGapBelowTitle,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.largeTitle,
            isBottomSheet && styles.largeTitleFixedSheet,
            isBottomSheet && (subtitle || onBack)
              ? styles.largeTitleSheetSub
              : isBottomSheet
                ? styles.largeTitleCentered
                : null,
            {
              color: tokens.settingsLabel,
              fontSize: largeTitleSize,
              lineHeight: isBottomSheet ? largeTitleBlock : undefined,
            },
            largeTitleStyle,
          ]}
        >
          {title}
        </Animated.Text>
        {isBottomSheet && subtitle ? (
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

  const scrollContentStyle = styles.scrollContent;

  const pageScrollProps = {
    onScroll: scrollHandler,
    scrollEventThrottle: 16 as const,
    showsVerticalScrollIndicator: false,
    contentContainerStyle: scrollContentStyle,
    style: styles.scrollView,
  };

  const sheetScrollProps = {
    onScroll: scrollHandler,
    scrollEventThrottle: 16 as const,
    showsVerticalScrollIndicator: false,
    contentContainerStyle: scrollContentStyle,
    style: styles.scrollView,
  };

  return (
    <View
      style={[styles.root, { backgroundColor: sheetBackground }]}
    >
      {isBottomSheet ? (
        <SheetDismissControl
          onPress={onDone}
          testID={doneTestID}
          accessibilityLabel={doneAccessibilityLabel}
        />
      ) : null}

      {!isBottomSheet ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.fixedHeader,
            {
              paddingTop: headerInsetTop,
              height: topBarHeight,
              backgroundColor: sheetBackground,
            },
          ]}
        >
          <View style={[styles.topBarRow, { height: pageBarHeight }]}>
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
        </View>
      ) : null}

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
      ) : (
        <>
          {onBack ? (
            <View
              pointerEvents="box-none"
              style={[
                styles.sheetStickyOverlay,
                styles.sheetStickyBackLayer,
                { height: sheetStickyOverlayHeight },
              ]}
            >
              <View
                style={[
                  styles.sheetStickyBack,
                  { top: SHEET_HEADER_TOP_INSET, height: sheetStickyBarHeight },
                ]}
              >
                <BackButton
                  onPress={onBack}
                  label={backLabel}
                  color={tokens.settingsLink}
                />
              </View>
            </View>
          ) : null}
          <AnimatedStickyHeader
            animatedProps={sheetStickyPointerProps}
            style={[
              styles.sheetStickyOverlay,
              { height: sheetStickyOverlayHeight },
            ]}
          >
          <Animated.View
            style={[
              styles.sheetStickyPill,
              { borderColor: tokens.settingsSeparator },
              sheetStickyPillStyle,
            ]}
          >
            <BlurView
              intensity={SHEET_STICKY_PILL_BLUR_INTENSITY}
              tint="default"
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: sheetStickyPillOverlay },
              ]}
            />
            <Text
              style={[
                styles.sheetStickyPillTitle,
                { color: tokens.settingsLabel },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </Animated.View>
          </AnimatedStickyHeader>
        </>
      )}

      {variant === "bottomSheet" ? (
        <AnimatedBottomSheetScrollView {...sheetScrollProps}>
          {scrollContent}
        </AnimatedBottomSheetScrollView>
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
  const name = getRowDisplayName(child.type);
  if (name === "SettingsGroupedRow") {
    return ICON_ROW_DIVIDER_INSET;
  }
  if (
    name === "SettingsGroupedLinkRow" &&
    (child.props as LinkRowProps).icon
  ) {
    return ICON_ROW_DIVIDER_INSET;
  }
  return ROW_PADDING_HORIZONTAL;
}

function SettingsRowIcon({ icon }: { icon: SettingsGroupedIcon }) {
  const { tokens } = useTheme();
  const emphasis = icon.emphasis ?? "primary";
  const color =
    emphasis === "quiet"
      ? tokens.settingsTertiaryLabel
      : tokens.settingsSecondaryLabel;

  return (
    <View style={styles.rowIconSlot}>
      <Ionicons name={icon.name} size={ROW_ICON_SIZE} color={color} />
    </View>
  );
}

/** Uppercase section label — SESSION, THEME, etc. */
export function SettingsSectionHeader({ title }: { title: string }) {
  const { tokens } = useTheme();

  return (
    <Text
      style={{
        color: tokens.bottomSheetSecondaryText,
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
          backgroundColor: tokens.surface,
          borderRadius: CARD_RADIUS,
          overflow: overflowVisible ? "visible" : "hidden",
        },
      }),
    [tokens.surface, overflowVisible],
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

/** Tappable settings row with monochrome leading symbol and chevron. */
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
      <SettingsRowIcon icon={icon} />
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
  icon,
  subdued = false,
}: LinkRowProps) {
  const { tokens } = useTheme();
  const rowStyle = icon ? styles.row : styles.plainRow;
  const titleStyle = icon ? styles.rowTitle : styles.plainRowTitle;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyle,
        pressed && styles.rowPressed,
      ]}
    >
      {icon ? <SettingsRowIcon icon={icon} /> : null}
      <Text
        style={[
          titleStyle,
          subdued && styles.plainRowTitleSubdued,
          {
            color: subdued
              ? tokens.settingsSecondaryLabel
              : tokens.settingsLabel,
          },
        ]}
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
          style={[styles.chevron, subdued && styles.chevronSubdued]}
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

/** Centered caption below grouped sections (single-line hints). */
export function SettingsGroupedFooter({ children }: FooterProps) {
  const { tokens } = useTheme();

  return (
    <Text style={[styles.footer, { color: tokens.settingsSecondaryLabel }]}>
      {children}
    </Text>
  );
}

/** Settings main footer — playful tagline + subtle version metadata. */
export function SettingsScreenFooter({ tagline }: { tagline: string }) {
  const { tokens } = useTheme();
  const { versionLine } = getAppVersionMetadata();

  return (
    <View style={styles.settingsScreenFooter}>
      <Text
        style={[
          styles.footerTagline,
          { color: tokens.settingsSecondaryLabel },
        ]}
      >
        {tagline}
      </Text>
      <Text
        style={[
          styles.footerVersion,
          { color: tokens.settingsTertiaryLabel },
        ]}
      >
        {versionLine}
      </Text>
    </View>
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
  sheetScrollHeader: {
    paddingBottom: 0,
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
    marginTop: 0,
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
  sheetDismissA11y: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    minHeight: 44,
    opacity: 0,
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
    paddingTop: CONTENT_BODY_TOP_PADDING,
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
  sheetStickyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: SHEET_HEADER_TOP_INSET,
  },
  sheetStickyBackLayer: {
    zIndex: 13,
  },
  sheetStickyBack: {
    position: "absolute",
    left: HORIZONTAL_INSET - 6,
    right: "28%",
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 2,
  },
  sheetStickyPill: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: SHEET_STICKY_PILL_MIN_HEIGHT,
    paddingHorizontal: SHEET_STICKY_PILL_PADDING_H,
    paddingVertical: SHEET_STICKY_PILL_PADDING_V,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "72%",
  },
  sheetStickyPillTitle: {
    fontSize: SHEET_STICKY_PILL_FONT_SIZE,
    fontWeight: "600",
    letterSpacing: -0.24,
    textAlign: "center",
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
    flexShrink: 0,
    paddingVertical: 8,
    marginLeft: -6,
    paddingRight: 8,
  },
  backText: {
    fontSize: 17,
    marginLeft: -2,
    flexShrink: 0,
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
  rowIconSlot: {
    width: ROW_ICON_SLOT_WIDTH,
    marginRight: ROW_ICON_MARGIN_RIGHT,
    alignItems: "center",
    justifyContent: "center",
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
  plainRowTitleSubdued: {
    fontSize: SUBDUED_LINK_FONT_SIZE,
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
  chevronSubdued: {
    opacity: 0.45,
  },
  insetDivider: {
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    textAlign: "center",
    fontSize: SECTION_HEADER_SIZE,
    lineHeight: FOOTER_LINE_HEIGHT,
    marginHorizontal: HORIZONTAL_INSET + 8,
    marginTop: FOOTER_MARGIN_TOP,
    marginBottom: FOOTER_MARGIN_BOTTOM,
  },
  settingsScreenFooter: {
    alignItems: "center",
    marginTop: FOOTER_TAGLINE_MARGIN_TOP,
    marginBottom: FOOTER_SCREEN_MARGIN_BOTTOM,
    marginHorizontal: HORIZONTAL_INSET + 8,
  },
  footerTagline: {
    textAlign: "center",
    fontSize: FOOTER_TAGLINE_SIZE,
    lineHeight: FOOTER_TAGLINE_LINE_HEIGHT,
    fontWeight: "400",
    letterSpacing: -0.08,
  },
  footerVersion: {
    textAlign: "center",
    fontSize: FOOTER_VERSION_SIZE,
    lineHeight: FOOTER_VERSION_LINE_HEIGHT,
    fontWeight: "400",
    letterSpacing: 0,
    marginTop: FOOTER_VERSION_MARGIN_TOP,
  },
});

/** Canonical settings primitives — prefer these names in screen code. */
export const SettingsSection = SettingsGroupedSection;
export const SettingsRow = SettingsGroupedRow;
