import { useAppSettings } from "@/contexts/appSettingsContext";
import {
  getMindfulSessionWriteStatus,
  isHealthAvailable,
  requestHealthAuthorization,
  type HealthWriteStatus,
} from "@/lib/health/healthService";
import * as ExpoLinking from "expo-linking";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Linking, Platform, Switch, Text, View } from "react-native";
import BaseBottomSheet, { BaseBottomSheetHandle } from "./BaseBottomSheet";
import BottomSheetCollapsibleSection from "./BottomSheetCollapsibleSection";
import BottomSheetDivider from "./BottomSheetDivider";
import BottomSheetRow from "./BottomSheetRow";
import { useTheme } from "./Theme";

export type SupportSheetHandle = BaseBottomSheetHandle;

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

type SupportScreen = "main" | "apple-health";

const SUPPORT_VIDEO_URL = "https://www.youtube.com/watch?v=8WPaO819-_g";

function AppleHealthScreen({ onBack }: { onBack: () => void }) {
  const { tokens } = useTheme();
  const {
    settings,
    setAppleHealthSyncEnabled,
    setAppleHealthConnected,
  } = useAppSettings();
  const [writeStatus, setWriteStatus] = useState<HealthWriteStatus>(
    () => getMindfulSessionWriteStatus(),
  );
  const [connecting, setConnecting] = useState(false);
  const [showDeniedHint, setShowDeniedHint] = useState(false);

  const available = isHealthAvailable();
  const writeAuthorized = writeStatus === "authorized";
  const connected = settings.appleHealthConnected && writeAuthorized;

  const refreshStatus = useCallback(async () => {
    const status = getMindfulSessionWriteStatus();
    setWriteStatus(status);
    if (settings.appleHealthConnected && status !== "authorized") {
      await setAppleHealthConnected(false);
    }
  }, [setAppleHealthConnected, settings.appleHealthConnected]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleConnect = async () => {
    if (!available || connecting) return;
    if (writeStatus === "denied") {
      setShowDeniedHint(true);
      return;
    }
    setConnecting(true);
    try {
      const status = await requestHealthAuthorization();
      setWriteStatus(status);
      if (status === "authorized") {
        await setAppleHealthConnected(true);
        await setAppleHealthSyncEnabled(true);
        setShowDeniedHint(false);
      } else {
        await setAppleHealthConnected(false);
        setShowDeniedHint(status === "denied");
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleManageAccess = () => {
    void Linking.openSettings();
  };

  const captionStyle = {
    color: tokens.bottomSheetSecondaryText,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  } as const;

  return (
    <View>
      <BottomSheetRow title="Back" onPress={onBack} showArrow={false} />
      <BottomSheetDivider />

      {!available ? (
        <>
          <Text style={captionStyle}>
            Apple Health is available on iPhone. Completed breathing sessions
            can be saved as Mindful Minutes there.
          </Text>
        </>
      ) : connected ? (
        <>
          <Text
            style={{
              color: tokens.bottomSheetText,
              fontSize: 16,
              fontWeight: "600",
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            Apple Health Connected
          </Text>
          <BottomSheetDivider />
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: tokens.bottomSheetText,
                fontSize: 16,
                flex: 1,
                marginRight: 12,
              }}
            >
              Save Mindful Minutes
            </Text>
            <Switch
              value={settings.appleHealthSyncEnabled}
              onValueChange={(value) => {
                void setAppleHealthSyncEnabled(value);
              }}
            />
          </View>
          <BottomSheetDivider />
          <BottomSheetRow
            title="Manage Health Access"
            onPress={handleManageAccess}
          />
          <Text style={captionStyle}>
            Save completed breathing and meditation sessions to Apple Health as
            Mindful Minutes. You can also change access in the Health app:
            Sharing → Apps → JustBreatheBro.
          </Text>
        </>
      ) : (
        <>
          <Text style={captionStyle}>
            Save completed breathing and meditation sessions to Apple Health as
            Mindful Minutes.
          </Text>
          <BottomSheetRow
            title={connecting ? "Connecting…" : "Connect Apple Health"}
            onPress={() => {
              void handleConnect();
            }}
            showArrow={false}
          />
          {showDeniedHint || writeStatus === "denied" ? (
            <>
              <BottomSheetDivider />
              <BottomSheetRow
                title="Manage Health Access"
                onPress={handleManageAccess}
              />
              <Text style={captionStyle}>
                Permission was not granted. Enable Mindful Sessions for this
                app in Settings, or in the Health app: Sharing → Apps →
                JustBreatheBro.
              </Text>
            </>
          ) : null}
        </>
      )}
    </View>
  );
}

const SupportSheet = forwardRef<SupportSheetHandle, SupportSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const sheetRef = useRef<BaseBottomSheetHandle>(null);
    const [screen, setScreen] = useState<SupportScreen>("main");
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [getInTouchExpanded, setGetInTouchExpanded] = useState(false);
    const [feedbackExpanded, setFeedbackExpanded] = useState(false);
    const [legalExpanded, setLegalExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setScreen("main");
        sheetRef.current?.open();
      },
      close: () => sheetRef.current?.close(),
    }));

    const handleSupportVideoPress = () => {
      Linking.openURL(SUPPORT_VIDEO_URL);
    };

    const handlePrivacyPolicyPress = () => {
      Linking.openURL(
        "https://michael-d-abraham.github.io/brethbro-privacy/privacy.html",
      );
    };

    const handleTermsPress = () => {
      Linking.openURL("https://www.youtube.com/watch?v=8WPaO819-_g");
    };

    const handleDismiss = () => {
      setScreen("main");
      onDismiss?.();
    };

    const isAppleHealth = screen === "apple-health";

    return (
      <BaseBottomSheet
        ref={sheetRef}
        title={isAppleHealth ? "Apple Health" : "Support"}
        subtitle={
          isAppleHealth
            ? "Track your mindfulness"
            : "Breath through your nose homie"
        }
        onChange={onChange}
        onDismiss={handleDismiss}
      >
        {isAppleHealth ? (
          <AppleHealthScreen onBack={() => setScreen("main")} />
        ) : (
          <>
            <BottomSheetRow
              title="Apple Health"
              subtitle={
                Platform.OS === "ios"
                  ? "Save Mindful Minutes"
                  : "Available on iPhone"
              }
              onPress={() => setScreen("apple-health")}
            />

            <BottomSheetDivider />

            <BottomSheetCollapsibleSection
              title="ABOUT BREATH"
              expanded={aboutExpanded}
              onToggle={() => setAboutExpanded(!aboutExpanded)}
              content={
                <View>
                  <Text
                    style={{
                      color: tokens.bottomSheetText,
                      fontSize: 14,
                      lineHeight: 22,
                      marginBottom: 8,
                    }}
                  >
                    Breathing is cool. All the cool kids do it.
                  </Text>
                  <Text
                    style={{
                      color: tokens.bottomSheetSecondaryText,
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    Version 2.0.8{" "}
                  </Text>
                </View>
              }
            />

            <BottomSheetDivider />

            <BottomSheetCollapsibleSection
              title="SUPPORT"
              expanded={getInTouchExpanded}
              onToggle={() => setGetInTouchExpanded(!getInTouchExpanded)}
              content={
                <BottomSheetRow
                  title="Get in contact and Support the developer"
                  subtitle="breathbro.app"
                  onPress={() =>
                    void ExpoLinking.openURL("https://breathbro.app")
                  }
                />
              }
            />

            <BottomSheetDivider />

            <BottomSheetCollapsibleSection
              title="WE'D LOVE YOUR FEEDBACK"
              expanded={feedbackExpanded}
              onToggle={() => setFeedbackExpanded(!feedbackExpanded)}
              content={
                <BottomSheetRow
                  title="Send Feedback"
                  subtitle="Help us improve by sharing your thoughts"
                  onPress={handleSupportVideoPress}
                />
              }
            />

            <BottomSheetDivider />

            <BottomSheetCollapsibleSection
              title="LEGAL"
              expanded={legalExpanded}
              onToggle={() => setLegalExpanded(!legalExpanded)}
              content={
                <View>
                  <BottomSheetRow
                    title="Privacy Policy"
                    onPress={handlePrivacyPolicyPress}
                  />
                  <BottomSheetRow
                    title="Terms of Service"
                    onPress={handleTermsPress}
                  />
                </View>
              }
            />
          </>
        )}
      </BaseBottomSheet>
    );
  },
);

SupportSheet.displayName = "SupportSheet";

export default SupportSheet;
