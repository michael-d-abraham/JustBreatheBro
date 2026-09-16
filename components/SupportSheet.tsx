import LearnTabContent from "@/components/learn/LearnTabContent";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useTheme } from "@/components/Theme";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Linking } from "react-native";
import BaseBottomSheet, { BaseBottomSheetHandle } from "./BaseBottomSheet";
import { SettingsSheetScreen } from "./SettingsBottomSheet";
import { settingsRowIcons } from "./settingsRowIcons";
import {
  SettingsGroupedFooter,
  SettingsScreenFooter,
  SettingsGroupedLinkRow,
  SettingsGroupedToggleRow,
  SettingsRow,
  SettingsSection,
} from "./SettingsInsetGrouped";

export type SupportSheetEntry = "settings" | "explore";

export type SupportSheetHandle = {
  open: (entry?: SupportSheetEntry) => void;
  close: () => void;
};

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

type SupportScreen =
  | "explore"
  | "main"
  | "sounds-haptics"
  | "reminders"
  | "apple-health"
  | "ideas"
  | "about-me"
  | "privacy-policy"
  | "terms";

const SUPPORT_VIDEO_URL = "https://www.youtube.com/watch?v=8WPaO819-_g";
const PRIVACY_URL =
  "https://michael-d-abraham.github.io/brethbro-privacy/privacy.html";
const TERMS_URL = "https://www.youtube.com/watch?v=8WPaO819-_g";

function soundsHapticsSummary(
  soundEnabled: boolean,
  hapticsEnabled: boolean,
): string {
  if (soundEnabled && hapticsEnabled) return "On";
  if (!soundEnabled && !hapticsEnabled) return "Off";
  const parts: string[] = [];
  if (soundEnabled) parts.push("Sound");
  if (hapticsEnabled) parts.push("Haptics");
  return parts.join(", ");
}

type ScreenProps = {
  onNavigate: (screen: SupportScreen) => void;
  onDone: () => void;
};

function ExploreScreen({ onDone }: Pick<ScreenProps, "onDone">) {
  return (
    <SettingsSheetScreen
      title="Explore"
      onClose={onDone}
      closeTestID="explore.close-button"
    >
      <LearnTabContent variant="sheet" bottomInset={8} />
    </SettingsSheetScreen>
  );
}

function SettingsMainScreen({ onNavigate, onDone }: ScreenProps) {
  const { settings } = useAppSettings();

  return (
    <SettingsSheetScreen
      title="Settings"
      onClose={onDone}
      closeTestID="settings.close-button"
    >
      <SettingsSection title="Session">
        <SettingsRow
          title="Sounds & Haptics"
          value={soundsHapticsSummary(
            settings.soundEnabled,
            settings.hapticsEnabled,
          )}
          icon={settingsRowIcons.soundsHaptics}
          onPress={() => onNavigate("sounds-haptics")}
        />
      </SettingsSection>

      <SettingsSection title="Integrations">
        <SettingsRow
          title="Reminders"
          icon={settingsRowIcons.reminders}
          onPress={() => onNavigate("reminders")}
        />
        <SettingsRow
          title="Apple Health"
          icon={settingsRowIcons.appleHealth}
          onPress={() => onNavigate("apple-health")}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsGroupedLinkRow
          title="About Me"
          icon={settingsRowIcons.aboutMe}
          onPress={() => onNavigate("about-me")}
        />
        <SettingsGroupedLinkRow
          title="Ideas & Suggestions"
          icon={settingsRowIcons.ideas}
          onPress={() => onNavigate("ideas")}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsGroupedLinkRow
          title="Privacy Policy"
          icon={settingsRowIcons.privacy}
          subdued
          onPress={() => onNavigate("privacy-policy")}
        />
        <SettingsGroupedLinkRow
          title="Terms of Service"
          icon={settingsRowIcons.terms}
          subdued
          onPress={() => onNavigate("terms")}
        />
      </SettingsSection>

      <SettingsScreenFooter tagline="Breathing is cool. All the cool kids do it." />
    </SettingsSheetScreen>
  );
}

function SoundsHapticsScreen({ onNavigate, onDone }: ScreenProps) {
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

function AboutMeScreen({ onNavigate, onDone }: ScreenProps) {
  return (
    <SettingsSheetScreen
      title="About Me"
      onClose={onDone}
      onBack={() => onNavigate("main")}
      backLabel="Settings"
    />
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
    const { tokens } = useTheme();
    const sheetRef = useRef<BaseBottomSheetHandle>(null);
    const [screen, setScreen] = useState<SupportScreen>("main");

    useImperativeHandle(ref, () => ({
      open: (entry: SupportSheetEntry = "settings") => {
        setScreen(entry === "explore" ? "explore" : "main");
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
        case "explore":
          return <ExploreScreen onDone={handleDone} />;
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
        case "about-me":
          return <AboutMeScreen {...screenProps} />;
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
        backgroundColor={tokens.settingsSheetBackground}
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
