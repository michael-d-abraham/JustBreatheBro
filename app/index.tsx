import BreathingPageHeader from "@/components/BreathingPageHeader";
import ExerciseDetailSheet from "@/components/ExerciseDetailSheet";
import ExerciseSelectionSheet from "@/components/ExerciseSelectionSheet";
import SupportSheet from "@/components/SupportSheet";
import { useWallpaperForeground } from "@/components/Theme";
import { useBreathing } from "@/contexts/breathingContext";
import { useApp } from "@/contexts/themeContext";
import { useBreathingSheets } from "@/hooks/useBreathingSheets";
import { defaultExercises } from "@/lib/storage";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const wallpaperFg = useWallpaperForeground();
  const router = useRouter();
  const { currentExercise, updateExercise } = useBreathing();
  const sheets = useBreathingSheets();

  // Get current exercise or default to Deep Breathing
  const displayExercise =
    currentExercise ||
    defaultExercises.find((ex) => ex.id === "1") ||
    defaultExercises[0];

  const handleStartPress = async () => {
    await updateExercise(displayExercise);
    router.push({
      pathname: "/breathing",
      params: { autoStart: "true" },
    });
  };

  const handleCirclePress = () => {
    // Navigate to scenes screen
    router.push("/scenes");
  };

  const handleInfoLibraryPress = () => {
    router.push("/informationarchive");
  };

  const { backgroundImage } = useApp();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? "transparent" : "#FFFFFF",
    },
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    contentArea: {
      flex: 1,
      marginTop: 60, // Space for fixed header
      marginBottom: 180, // Space for fixed footer
    },
    pageContainer: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    subtitle: {
      color: wallpaperFg,
      fontSize: 48,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 16,
    },
    description: {
      color: wallpaperFg,
      fontSize: 18,
      textAlign: "center",
      opacity: 0.8,
    },
    footerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
    },
    startButtonContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      marginBottom: 40,
    },
    startButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    startButtonText: {
      color: wallpaperFg,
      fontSize: 28,
      fontWeight: "700",
    },
    techniqueContainer: {
      alignItems: "center",
    },
    techniqueLabel: {
      color: wallpaperFg,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 12,
    },
    techniqueValue: {
      color: wallpaperFg,
      fontSize: 18,
    },
    techniqueSelectable: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    chevronIcon: {
      color: wallpaperFg,
      fontSize: 16,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          {/* Fixed Header */}
          <View style={styles.headerContainer}>
            <BreathingPageHeader
              supportSheetRef={sheets.supportSheetRef}
              onSupportPress={sheets.handleSupportPress}
              onCirclePress={handleCirclePress}
              onInfoLibraryPress={handleInfoLibraryPress}
              globalBreathLabel="One Breath"
              onGlobalBreathPress={() => router.push("/global_room_picker")}
            />
          </View>

          {/* Fixed middle content: Relax only */}
          <View style={styles.contentArea}>
            <View style={styles.pageContainer}>
              <Text style={styles.subtitle}>Relax</Text>
              <Text style={styles.description}>
                Quiet your mind and relieve stress
              </Text>
            </View>
          </View>

          {/* Fixed Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.startButtonContainer}>
              <Pressable onPress={handleStartPress} style={styles.startButton}>
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>
            </View>

            {/* Technique Section */}
            <View style={styles.techniqueContainer}>
              <Text style={styles.techniqueLabel}>Technique:</Text>
              <Pressable
                onPress={sheets.handleTechniquePress}
                style={styles.techniqueSelectable}
              >
                <Text style={styles.techniqueValue}>
                  {displayExercise.title}
                </Text>
                <Text style={styles.chevronIcon}>⌄</Text>
              </Pressable>
            </View>
          </View>

          {/* Blurred backdrop (tap to dismiss) */}
          {(sheets.isSheetOpen ||
            sheets.isSupportSheetOpen ||
            sheets.isSelectionSheetOpen) && (
            <Pressable
              onPress={sheets.closeAllSheets}
              style={StyleSheet.absoluteFill}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          {/* Bottom Sheet Modals */}
          <ExerciseDetailSheet
            ref={sheets.sheetRef}
            exercise={sheets.selectedExerciseForInfo}
            onChange={sheets.handleSheetChange}
            onDismiss={sheets.handleSheetDismiss}
          />
          <ExerciseSelectionSheet
            ref={sheets.selectionSheetRef}
            exercises={sheets.exercises}
            currentExercise={sheets.currentExercise}
            onSelectExercise={sheets.handleSelectExercise}
            onChange={sheets.handleSelectionSheetChange}
            onDismiss={sheets.handleSelectionSheetDismiss}
          />
          <SupportSheet
            ref={sheets.supportSheetRef}
            onChange={sheets.handleSupportSheetChange}
            onDismiss={sheets.handleSupportSheetDismiss}
          />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
