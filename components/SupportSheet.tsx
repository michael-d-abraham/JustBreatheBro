import { useAppSettings } from "@/contexts/appSettingsContext";
import { AppearancePref, useTheme } from "@/components/Theme";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Linking } from "react-native";
import BaseBottomSheet, { BaseBottomSheetHandle } from "./BaseBottomSheet";
import {
  SettingsGroupedCheckRow,
  SettingsGroupedFooter,
  SettingsGroupedLinkRow,
  SettingsGroupedRow,
  SettingsGroupedSection,
  SettingsGroupedToggleRow,
  SettingsInsetGroupedLayout,
} from "./SettingsInsetGrouped";

export type SupportSheetHandle = BaseBottomSheetHandle;

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

type SupportScreen =
  | "main"
  | "sounds-haptics"
  | "reminders"
  | "apple-health"
  | "appearance"
  | "appearance-theme"
  | "app-icon"
  | "ideas"
  | "privacy-policy"
  | "terms";

const SUPPORT_VIDEO_URL = "https://www.youtube.com/watch?v=8WPaO819-_g";
const PRIVACY_URL =
  "https://michael-d-abraham.github.io/brethbro-privacy/privacy.html";
const TERMS_URL = "https://www.youtube.com/watch?v=8WPaO819-_g";

const APPEARANCE_LABELS: Record<AppearancePref, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

type ScreenProps = {
  onNavigate: (screen: SupportScreen) => void;
  onDone: () => void;
};

function SupportMainScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsInsetGroupedLayout
      title="Support"
      onDone={onDone}
      variant="bottomSheet"
      doneTestID="support.done-button"
    >
      <SettingsGroupedSection title="Session">
        <SettingsGroupedRow
          title="Sounds & Haptics"
          icon={{ name: "musical-notes-outline", backgroundColor: "#FF2D55" }}
          onPress={() => onNavigate("sounds-haptics")}
        />
        <SettingsGroupedRow
          title="Reminders"
          icon={{ name: "notifications-outline", backgroundColor: "#FF9500" }}
          onPress={() => onNavigate("reminders")}
        />
        <SettingsGroupedRow
          title="Apple Health"
          icon={{ name: "heart-outline", backgroundColor: "#FF3B30" }}
          onPress={() => onNavigate("apple-health")}
        />
      </SettingsGroupedSection>

      <SettingsGroupedSection title="Look">
        <SettingsGroupedRow
          title="Appearance"
          icon={{ name: "contrast-outline", backgroundColor: "#5856D6" }}
          onPress={() => onNavigate("appearance")}
        />
        <SettingsGroupedRow
          title="App Icon"
          icon={{ name: "apps-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("app-icon")}
        />
      </SettingsGroupedSection>

      <SettingsGroupedSection title="Contact Us">
        <SettingsGroupedRow
          title="Ideas & Suggestions"
          icon={{ name: "bulb-outline", backgroundColor: "#FF9500" }}
          onPress={() => onNavigate("ideas")}
        />
      </SettingsGroupedSection>

      <SettingsGroupedSection title="Legal Notice">
        <SettingsGroupedRow
          title="Privacy Policy"
          icon={{ name: "shield-checkmark-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("privacy-policy")}
        />
        <SettingsGroupedRow
          title="Terms of Service"
          icon={{ name: "document-text-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("terms")}
        />
      </SettingsGroupedSection>

      <SettingsGroupedFooter>
        Breathing is cool. All the cool kids do it.{"\n"}
        Version 2.0.8
      </SettingsGroupedFooter>
    </SettingsInsetGroupedLayout>
  );
}

function SoundsHapticsScreen({
  onNavigate,
  onDone,
}: ScreenProps) {
  const { settings, toggleSound, toggleHaptics } = useAppSettings();

  return (
    <SettingsInsetGroupedLayout
      title="Sounds & Haptics"
      onDone={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Support"
      variant="bottomSheet"
    >
      <SettingsGroupedSection title="Session">
        <SettingsGroupedToggleRow
          title="Sound"
          value={settings.soundEnabled}
          onValueChange={() => toggleSound()}
        />
        <SettingsGroupedToggleRow
          title="Haptics"
          value={settings.hapticsEnabled}
          onValueChange={() => toggleHaptics()}
        />
      </SettingsGroupedSection>
    </SettingsInsetGroupedLayout>
  );
}

function AppearanceScreen({ onNavigate, onDone }: ScreenProps) {
  const { appearance, setAppearance } = useTheme();
  const usesSystem = appearance === "system";

  return (
    <SettingsInsetGroupedLayout
      title="Appearance"
      onDone={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Support"
      variant="bottomSheet"
    >
      <SettingsGroupedSection title="Appearance">
        <SettingsGroupedToggleRow
          title="System"
          value={usesSystem}
          onValueChange={(enabled) => {
            if (enabled) {
              setAppearance("system");
            } else {
              setAppearance("light");
            }
          }}
        />
        <SettingsGroupedLinkRow
          title="Theme"
          value={APPEARANCE_LABELS[appearance]}
          onPress={() => onNavigate("appearance-theme")}
        />
      </SettingsGroupedSection>

      <SettingsGroupedFooter>
        Matching your system settings will automatically switch between light and
        dark mode.
      </SettingsGroupedFooter>
    </SettingsInsetGroupedLayout>
  );
}

function AppearanceThemeScreen({ onNavigate, onDone }: ScreenProps) {
  const { appearance, setAppearance } = useTheme();

  const options: AppearancePref[] = ["light", "dark", "system"];

  return (
    <SettingsInsetGroupedLayout
      title="Theme"
      onDone={onDone}
      onBack={() => onNavigate("appearance")}
      backLabel="Appearance"
      variant="bottomSheet"
    >
      <SettingsGroupedSection title="Appearance">
        {options.map((option) => (
          <SettingsGroupedCheckRow
            key={option}
            title={APPEARANCE_LABELS[option]}
            selected={appearance === option}
            onPress={() => setAppearance(option)}
          />
        ))}
      </SettingsGroupedSection>
    </SettingsInsetGroupedLayout>
  );
}

function IdeasScreen({ onNavigate, onDone }: ScreenProps) {
  const openFeedback = () => {
    Linking.openURL(SUPPORT_VIDEO_URL);
  };

  return (
    <SettingsInsetGroupedLayout
      title="Ideas & Suggestions"
      onDone={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Support"
      variant="bottomSheet"
    >
      <SettingsGroupedSection>
        <SettingsGroupedLinkRow
          title="Send Feedback"
          onPress={openFeedback}
        />
      </SettingsGroupedSection>

      <SettingsGroupedFooter>
        Help us improve by sharing your thoughts.
      </SettingsGroupedFooter>
    </SettingsInsetGroupedLayout>
  );
}

function PrivacyPolicyScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsInsetGroupedLayout
      title="Privacy Policy"
      onDone={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Support"
      variant="bottomSheet"
    >
      <SettingsGroupedSection>
        <SettingsGroupedLinkRow
          title="View Privacy Policy"
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />
      </SettingsGroupedSection>
    </SettingsInsetGroupedLayout>
  );
}

function TermsScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsInsetGroupedLayout
      title="Terms of Service"
      onDone={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Support"
      variant="bottomSheet"
    >
      <SettingsGroupedSection>
        <SettingsGroupedLinkRow
          title="View Terms of Service"
          onPress={() => Linking.openURL(TERMS_URL)}
        />
      </SettingsGroupedSection>
    </SettingsInsetGroupedLayout>
  );
}

function ComingSoonScreen({
  title,
  onNavigate,
  onDone,
  backTarget,
  backLabel,
}: ScreenProps & {
  title: string;
  backTarget: SupportScreen;
  backLabel: string;
}) {
  return (
    <SettingsInsetGroupedLayout
      title={title}
      onDone={onDone}
      onBack={() => onNavigate(backTarget)}
      backLabel={backLabel}
      variant="bottomSheet"
    >
      <SettingsGroupedFooter>Coming soon.</SettingsGroupedFooter>
    </SettingsInsetGroupedLayout>
  );
}

const SupportSheet = forwardRef<SupportSheetHandle, SupportSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    const sheetRef = useRef<BaseBottomSheetHandle>(null);
    const [screen, setScreen] = useState<SupportScreen>("main");

    useImperativeHandle(ref, () => ({
      open: () => {
        setScreen("main");
        sheetRef.current?.open();
      },
      close: () => sheetRef.current?.close(),
    }));

    const handleDone = useCallback(() => {
      sheetRef.current?.close();
    }, []);

    const handleDismiss = useCallback(() => {
      setScreen("main");
      onDismiss?.();
    }, [onDismiss]);

    const navigate = useCallback((next: SupportScreen) => {
      setScreen(next);
    }, []);

    const screenProps: ScreenProps = {
      onNavigate: navigate,
      onDone: handleDone,
    };

    const content = (() => {
      switch (screen) {
        case "sounds-haptics":
          return <SoundsHapticsScreen {...screenProps} />;
        case "reminders":
          return (
            <ComingSoonScreen
              {...screenProps}
              title="Reminders"
              backTarget="main"
              backLabel="Support"
            />
          );
        case "apple-health":
          return (
            <ComingSoonScreen
              {...screenProps}
              title="Apple Health"
              backTarget="main"
              backLabel="Support"
            />
          );
        case "appearance":
          return <AppearanceScreen {...screenProps} />;
        case "appearance-theme":
          return <AppearanceThemeScreen {...screenProps} />;
        case "app-icon":
          return (
            <ComingSoonScreen
              {...screenProps}
              title="App Icon"
              backTarget="main"
              backLabel="Support"
            />
          );
        case "ideas":
          return <IdeasScreen {...screenProps} />;
        case "privacy-policy":
          return <PrivacyPolicyScreen {...screenProps} />;
        case "terms":
          return <TermsScreen {...screenProps} />;
        case "main":
        default:
          return <SupportMainScreen {...screenProps} />;
      }
    })();

    return (
      <BaseBottomSheet
        ref={sheetRef}
        headerless
        snapPoints={["90%"]}
        onChange={onChange}
        onDismiss={handleDismiss}
      >
        {content}
      </BaseBottomSheet>
    );
  },
);

SupportSheet.displayName = "SupportSheet";

export default SupportSheet;
