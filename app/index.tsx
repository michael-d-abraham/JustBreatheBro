import BreathingPageHeader from "@/components/BreathingPageHeader";
import ExerciseDetailSheet from "@/components/ExerciseDetailSheet";
import ExerciseSelectionSheet from "@/components/ExerciseSelectionSheet";
import ScenesSheet from "@/components/ScenesSheet";
import SupportSheet from "@/components/SupportSheet";
import { useWallpaperForeground } from "@/components/Theme";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useBreathing } from "@/contexts/breathingContext";
import { useBreathingSheets } from "@/hooks/useBreathingSheets";
import { defaultExercises } from "@/lib/storage";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PAGES = [
  {
    id: "oneBreath",
    subtitle: "One Breath",
    description: "Breathe together in a live room",
  },
  {
    id: "relax",
    subtitle: "Relax",
    description: "Quiet your mind and relieve stress",
  },
  {
    id: "benefits",
    subtitle: "Benefits",
    description: "Articles, books, and videos to go deeper",
  },
] as const;

type PageId = (typeof PAGES)[number]["id"];

export default function Index() {
  const wallpaperFg = useWallpaperForeground();
  const router = useRouter();
  const { currentExercise, updateExercise } = useBreathing();
  const sheets = useBreathingSheets();
  const { backgroundImage } = useAppSettings();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1); // Start at Relax

  useEffect(() => {
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: 1 * SCREEN_WIDTH,
        animated: false,
      });
    }, 100);
    return () => clearTimeout(id);
  }, []);

  const displayExercise =
    currentExercise ||
    defaultExercises.find((ex) => ex.id === "1") ||
    defaultExercises[0];

  const currentPageId: PageId = PAGES[currentPageIndex]?.id ?? "relax";
  const isRelaxPage = currentPageId === "relax";

  const handleStartPress = async () => {
    if (currentPageId === "oneBreath") {
      router.push("/global_room_picker");
      return;
    }
    if (currentPageId === "benefits") {
      router.push("/informationarchive");
      return;
    }
    await updateExercise(displayExercise);
    router.push({
      pathname: "/breathing",
      params: { autoStart: "true" },
    });
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: false,
    });
    setCurrentPageIndex(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== currentPageIndex) {
      setCurrentPageIndex(pageIndex);
    }
  };

  const handleLeftArrow = () => {
    if (currentPageIndex > 0) {
      scrollToPage(currentPageIndex - 1);
    }
  };

  const handleRightArrow = () => {
    if (currentPageIndex < PAGES.length - 1) {
      scrollToPage(currentPageIndex + 1);
    }
  };

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
    scrollableContent: {
      flex: 1,
      marginTop: 60,
      marginBottom: 180,
    },
    scrollView: {
      flex: 1,
    },
    pageContainer: {
      width: SCREEN_WIDTH,
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
    arrowButton: {
      position: "absolute",
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 5,
    },
    arrowIcon: {
      color: wallpaperFg,
      fontSize: 32,
      opacity: 0.7,
    },
    techniqueContainer: {
      alignItems: "center",
      minHeight: 56,
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
          <View style={styles.headerContainer}>
            <BreathingPageHeader
              onScenesPress={sheets.handleScenesPress}
              onSupportPress={sheets.handleSupportPress}
            />
          </View>

          <View style={styles.scrollableContent}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.scrollView}
              contentContainerStyle={{ flexDirection: "row" }}
            >
              {PAGES.map((page) => (
                <View key={page.id} style={styles.pageContainer}>
                  <Text style={styles.subtitle}>{page.subtitle}</Text>
                  <Text style={styles.description}>{page.description}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.startButtonContainer}>
              {currentPageIndex > 0 && (
                <Pressable
                  accessibilityLabel="Previous page"
                  onPress={handleLeftArrow}
                  style={[styles.arrowButton, { left: 20 }]}
                >
                  <Text style={styles.arrowIcon}>‹</Text>
                </Pressable>
              )}

              <Pressable
                testID="home.start-button"
                accessibilityLabel="Start"
                onPress={handleStartPress}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>

              {currentPageIndex < PAGES.length - 1 && (
                <Pressable
                  accessibilityLabel="Next page"
                  onPress={handleRightArrow}
                  style={[styles.arrowButton, { right: 20 }]}
                >
                  <Text style={styles.arrowIcon}>›</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.techniqueContainer}>
              {isRelaxPage && (
                <>
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
                </>
              )}
            </View>
          </View>

          {(sheets.isSheetOpen ||
            sheets.isSupportSheetOpen ||
            sheets.isScenesSheetOpen ||
            sheets.isSelectionSheetOpen) && (
            <Pressable
              onPress={sheets.closeAllSheets}
              style={StyleSheet.absoluteFill}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

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
          <ScenesSheet
            ref={sheets.scenesSheetRef}
            onChange={sheets.handleScenesSheetChange}
            onDismiss={sheets.handleScenesSheetDismiss}
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
