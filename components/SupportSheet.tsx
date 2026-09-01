import { useAppSettings } from "@/contexts/appSettingsContext";
import { AppearancePref, useTheme } from "@/components/Theme";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Linking } from "react-native";
import BaseBottomSheet, { BaseBottomSheetHandle } from "./BaseBottomSheet";
import { SettingsSheetScreen } from "./SettingsBottomSheet";
import {
  SettingsGroupedCheckRow,
  SettingsGroupedFooter,
  SettingsGroupedLinkRow,
  SettingsGroupedToggleRow,
  SettingsRow,
  SettingsSection,
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

function SettingsMainScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsSheetScreen
      title="Settings"
      onClose={onDone}
      closeTestID="settings.close-button"
    >
      <SettingsSection title="Session">
        <SettingsRow
          title="Sounds & Haptics"
          icon={{ name: "musical-notes-outline", backgroundColor: "#FF2D55" }}
          onPress={() => onNavigate("sounds-haptics")}
        />
        <SettingsRow
          title="Reminders"
          icon={{ name: "notifications-outline", backgroundColor: "#FF9500" }}
          onPress={() => onNavigate("reminders")}
        />
        <SettingsRow
          title="Apple Health"
          icon={{ name: "heart-outline", backgroundColor: "#FF3B30" }}
          onPress={() => onNavigate("apple-health")}
        />
      </SettingsSection>

      <SettingsSection title="Look">
        <SettingsRow
          title="Appearance"
          icon={{ name: "contrast-outline", backgroundColor: "#5856D6" }}
          onPress={() => onNavigate("appearance")}
        />
        <SettingsRow
          title="App Icon"
          icon={{ name: "apps-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("app-icon")}
        />
      </SettingsSection>

      <SettingsSection title="Contact Us">
        <SettingsRow
          title="Ideas & Suggestions"
          icon={{ name: "bulb-outline", backgroundColor: "#FF9500" }}
          onPress={() => onNavigate("ideas")}
        />
      </SettingsSection>

      <SettingsSection title="Legal Notice">
        <SettingsRow
          title="Privacy Policy"
          icon={{ name: "shield-checkmark-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("privacy-policy")}
        />
        <SettingsRow
          title="Terms of Service"
          icon={{ name: "document-text-outline", backgroundColor: "#8E8E93" }}
          onPress={() => onNavigate("terms")}
        />
      </SettingsSection>

      <SettingsGroupedFooter>
        Breathing is cool. All the cool kids do it.{"\n"}
        Version 2.0.8
      </SettingsGroupedFooter>
    </SettingsSheetScreen>
  );
}

function SoundsHapticsScreen({
  onNavigate,
  onDone,
}: ScreenProps) {
  const { settings, toggleSound, toggleHaptics } = useAppSettings();

  return (
    <SettingsSheetScreen
      title="Sounds & Haptics"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    >
      <SettingsSection title="Session">
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
      </SettingsSection>
    </SettingsSheetScreen>
  );
}

function AppearanceScreen({ onNavigate, onDone }: ScreenProps) {
  const { appearance, setAppearance } = useTheme();
  const usesSystem = appearance === "system";

  return (
    <SettingsSheetScreen
      title="Appearance"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    >
      <SettingsSection title="Appearance">
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
      </SettingsSection>

      <SettingsGroupedFooter>
        Matching your system settings will automatically switch between light and
        dark mode.
      </SettingsGroupedFooter>
    </SettingsSheetScreen>
  );
}

function AppearanceThemeScreen({ onNavigate, onDone }: ScreenProps) {
  const { appearance, setAppearance } = useTheme();

  const options: AppearancePref[] = ["light", "dark", "system"];

  return (
    <SettingsSheetScreen
      title="Theme"
      onClose={onDone}
      onBack={() => onNavigate("appearance")}
      backLabel="Appearance"
    >
      <SettingsSection title="Appearance">
        {options.map((option) => (
          <SettingsGroupedCheckRow
            key={option}
            title={APPEARANCE_LABELS[option]}
            selected={appearance === option}
            onPress={() => setAppearance(option)}
          />
        ))}
      </SettingsSection>
    </SettingsSheetScreen>
  );
}

function IdeasScreen({ onNavigate, onDone }: ScreenProps) {
  const openFeedback = () => {
    Linking.openURL(SUPPORT_VIDEO_URL);
  };

  return (
    <SettingsSheetScreen
      title="Ideas & Suggestions"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    >
      <SettingsSection>
        <SettingsGroupedLinkRow
          title="Send Feedback"
          onPress={openFeedback}
        />
      </SettingsSection>

      <SettingsGroupedFooter>
        Help us improve by sharing your thoughts.
      </SettingsGroupedFooter>
    </SettingsSheetScreen>
  );
}

function PrivacyPolicyScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsSheetScreen
      title="Privacy Policy"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    >
      <SettingsSection>
        <SettingsGroupedLinkRow
          title="View Privacy Policy"
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />
      </SettingsSection>
    </SettingsSheetScreen>
  );
}

function TermsScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsSheetScreen
      title="Terms of Service"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    >
      <SettingsSection>
        <SettingsGroupedLinkRow
          title="View Terms of Service"
          onPress={() => Linking.openURL(TERMS_URL)}
        />
      </SettingsSection>
    </SettingsSheetScreen>
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
    <SettingsSheetScreen
      title={title}
      onClose={onDone}
      onBack={() => onNavigate(backTarget)}
      backLabel={backLabel}
    >
      <SettingsGroupedFooter>Coming soon.</SettingsGroupedFooter>
    </SettingsSheetScreen>
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
              backLabel="Settings"
            />
          );
        case "apple-health":
          return (
            <ComingSoonScreen
              {...screenProps}
              title="Apple Health"
              backTarget="main"
              backLabel="Settings"
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
              backLabel="Settings"
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
          return <SettingsMainScreen {...screenProps} />;
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
