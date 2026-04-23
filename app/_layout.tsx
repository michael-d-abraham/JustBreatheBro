import BackgroundSoundscapePlayer from "@/components/BackgroundSoundscapePlayer";
import { ThemeProvider, useTheme } from "@/components/Theme";
import { BreathingProvider } from "@/contexts/breathingContext";
import { AppProvider, useApp } from "@/contexts/themeContext";
import { setAudioModeAsync } from "expo-audio";
import * as Sentry from "@sentry/react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect } from "react";

const SENTRY_DSN =
  "https://022da1988c600dd3fb4c6d45c522a14c@o4510551669604352.ingest.us.sentry.io/4510551671570432";

let sentryInitialized = false;

function initSentryOnce() {
  if (sentryInitialized) return;
  sentryInitialized = true;

  Sentry.init({
    dsn: SENTRY_DSN,

    // Privacy-first: don't collect PII unless needed
    sendDefaultPii: false,

    // Enable logs only in development to avoid shipping sensitive info
    enableLogs: __DEV__,

    // Session Replay: disabled for normal sessions, conservative error sampling
    replaysSessionSampleRate: 0, // No normal session replay
    replaysOnErrorSampleRate: 0.3, // Capture replay for 30% of errors (can adjust based on needs)
    integrations: [
      Sentry.mobileReplayIntegration(), // Keep for error debugging only
      // Removed feedbackIntegration() - not actively using feedback UI
    ],

    // Privacy guardrail: strip potential PII from events
    beforeSend(event, hint) {
      // If any user object sneaks in, drop it
      if (event.user) {
        delete event.user;
      }

      // Strip query strings from URLs (defensive - prevents deep-link param leakage)
      if (event.request?.url) {
        event.request.url = event.request.url.split("?")[0];
      }

      // Remove request bodies/headers if present (defensive)
      if (event.request) {
        if (event.request.data) delete event.request.data;
        if (event.request.headers) delete event.request.headers;
      }

      return event;
    },

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });

  // Set minimal tags with safe fallbacks (removed expoSessionId - not needed)
  Sentry.setTag("expoChannel", Updates.channel ?? "unknown");
  Sentry.setTag(
    "appVersion",
    Application.nativeApplicationVersion ?? "unknown",
  );
  Sentry.setTag(
    "executionEnvironment",
    Constants.executionEnvironment ?? "unknown",
  );

  // Extras: minimal technical metadata only (removed linkingUri - can contain deep-link params)
  // deviceYearClass kept for performance debugging, but can be removed if not needed
  Sentry.setExtras({
    deviceYearClass: Device.deviceYearClass ?? null,
    expoRuntimeVersion: Constants.expoRuntimeVersion ?? null,
  });
}

initSentryOnce();

/** Physical iOS devices honor the mute switch unless `playsInSilentMode` is set; the Simulator often does not. */
function useConfigureAudioMode() {
  useEffect(() => {
    void (async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          shouldRouteThroughEarpiece: false,
          interruptionMode: "duckOthers",
        });
      } catch (e) {
        if (__DEV__) {
          console.warn("setAudioModeAsync failed:", e);
        }
      }
    })();
  }, []);
}

function RootContent() {
  const { mode } = useTheme();
  const { backgroundImage } = useApp();

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: backgroundImage ? "transparent" : "transparent",
          },
          animation: "none",
        }}
      >
        <Stack.Screen
          name="breathing"
          options={{
            animation: "none",
          }}
        />
      </Stack>
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  useConfigureAudioMode();
  return (
    <ThemeProvider>
      <AppProvider>
        <BreathingProvider>
          <BackgroundSoundscapePlayer />
          <RootContent />
        </BreathingProvider>
      </AppProvider>
    </ThemeProvider>
  );
});
