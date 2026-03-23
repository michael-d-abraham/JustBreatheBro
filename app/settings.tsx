import { router, Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppearancePicker from "../components/AppearancePicker";
import BackButton from "../components/BackButton";
import SettingsSection from "../components/SettingsSection";
import SoundHapticsPicker from "../components/SoundHapticsPicker";
import SoundPicker from "../components/SoundPicker";
import SoundscapePicker from "../components/SoundscapePicker";
import BottomSheetThemePicker from "../components/BottomSheetThemePicker";
import { useTheme } from "../components/Theme";
import ThemePicker from "../components/ThemePicker";
import { useApp } from "../contexts/themeContext";

export default function SettingsScreen() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? "transparent" : tokens.sceneBackground,
      padding: 12,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      gap: 15,
      justifyContent: "center",
      paddingVertical: 20,
    },
    animationThemeWrapper: {
      marginTop: 18,
      alignItems: "center",
    },
    animationThemeTitle: {
      color: tokens.textOnAccent,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <BackButton onPress={() => router.back()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Sound">
          <SoundPicker />
        </SettingsSection>

        <SettingsSection title="Soundscape">
          <SoundscapePicker />
          <View style={styles.animationThemeWrapper}>
            <Text style={styles.animationThemeTitle}>Animation Theme</Text>
            <BottomSheetThemePicker />
          </View>
        </SettingsSection>

        <SettingsSection title="Pick A Theme">
          <ThemePicker />
        </SettingsSection>

        <SettingsSection title="Appearance Mode">
          <AppearancePicker />
        </SettingsSection>

        <SettingsSection title="Sound & Haptics">
          <SoundHapticsPicker />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
