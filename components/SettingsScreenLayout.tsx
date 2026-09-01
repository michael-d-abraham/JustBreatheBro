import {
  SettingsInsetGroupedLayout,
  SettingsSection,
} from "@/components/SettingsInsetGrouped";
import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type LayoutProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Maestro / a11y — defaults to settings.close-button */
  closeTestID?: string;
  closeAccessibilityLabel?: string;
  /** Extra styles on scroll body wrapper */
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Full-screen settings chrome shared by Scenes and future settings routes.
 *
 * Composes SettingsInsetGroupedLayout (iOS large-title + inset grouped cards).
 * Token contract: bottom-sheet tokens + systemGroupedBg / systemSecondaryGroupedBg.
 */
export default function SettingsScreenLayout({
  title,
  onClose,
  children,
  closeTestID = "settings.close-button",
  closeAccessibilityLabel = "Close",
  contentContainerStyle,
}: LayoutProps) {
  return (
    <SettingsInsetGroupedLayout
      title={title}
      onDone={onClose}
      variant="page"
      doneTestID={closeTestID}
      doneAccessibilityLabel={closeAccessibilityLabel}
    >
      <View style={contentContainerStyle}>{children}</View>
    </SettingsInsetGroupedLayout>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
  /** Extra wrapper style around card content */
  contentStyle?: StyleProp<ViewStyle>;
  /** Use for carousels that extend past card bounds */
  overflowVisible?: boolean;
  /** Section header only — no grouped white card */
  bare?: boolean;
};

/** Uppercase section label + grouped card — use inside SettingsScreenLayout. */
export function SettingsScreenSection({
  title,
  children,
  contentStyle,
  overflowVisible = false,
  bare = false,
}: SectionProps) {
  return (
    <SettingsSection
      title={title}
      contentStyle={contentStyle}
      overflowVisible={overflowVisible}
      bare={bare}
    >
      {children}
    </SettingsSection>
  );
}

export { SettingsSection, SettingsRow } from "@/components/SettingsInsetGrouped";

/** Spacer between grouped sections (legacy export — grouped spacing is built in). */
export function SettingsScreenDivider() {
  return <View style={{ height: 0 }} />;
}
