import HomeMeditateHero from "@/components/HomeMeditateHero";
import HomeMeditateTopChrome from "@/components/HomeMeditateTopChrome";
import HomeOneBreathHero from "@/components/HomeOneBreathHero";
import LearnTabContent from "@/components/learn/LearnTabContent";
import HomeNavigation, {
  HOME_FLOATING_NAV_ESTIMATED_HEIGHT,
} from "@/components/HomeNavigation";
import ExerciseDetailSheet from "@/components/ExerciseDetailSheet";
import ScenesSheet from "@/components/ScenesSheet";
import SupportSheet from "@/components/SupportSheet";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useBreathing } from "@/contexts/breathingContext";
import { useBreathingSheets } from "@/hooks/useBreathingSheets";
import {
  BREATH_ROOM_DEEP,
  type CanonicalBreathRoomId,
} from "@/hooks/useGlobalBreathingRoom";
import { defaultExercises } from "@/lib/storage";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PAGES = [
  { id: "oneBreath" },
  { id: "relax" },
  { id: "benefits" },
] as const;

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currentExercise,
    sessionDurationMinutes,
    updateExercise,
    updateSessionDuration,
  } = useBreathing();
  const sheets = useBreathingSheets();
  const { backgroundImage } = useAppSettings();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1); // Start at Relax
  const [selectedBreathRoomId, setSelectedBreathRoomId] =
    useState<CanonicalBreathRoomId>(BREATH_ROOM_DEEP);

  // Android has no ScrollView contentOffset; iOS uses contentOffset on the ScrollView below.
  useEffect(() => {
    if (Platform.OS === "ios") return;
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

  const handleStartPress = () => {
    updateExercise(displayExercise);
    router.push({
      pathname: "/breathing",
      params: { autoStart: "true" },
    });
  };

  const handleTechniqueSelect = (exerciseId: string) => {
    const exercise = defaultExercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      updateExercise(exercise);
    }
  };

  const handleOneBreathJoin = () => {
    router.push({
      pathname: "/global_room",
      params: { room: selectedBreathRoomId },
    });
  };

  const handleTipsAndTricksPress = () => {
    sheets.handleTipsAndTricksPress();
  };

  const handleProfilePress = () => {
    scrollToPage(2, true);
  };

  const handleSettingsPress = () => {
    sheets.handleSupportPress();
  };

  const scrollToPage = (index: number, animated = false) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated,
    });
    setCurrentPageIndex(index);
  };

  const handleNavSelect = (index: number) => {
    scrollToPage(index, true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== currentPageIndex) {
      setCurrentPageIndex(pageIndex);
    }
  };

  const bottomContentInset =
    insets.bottom + HOME_FLOATING_NAV_ESTIMATED_HEIGHT + 24;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? "transparent" : "#FFFFFF",
    },
    scrollableContent: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    learnPageContainer: {
      width: SCREEN_WIDTH,
      flex: 1,
      alignItems: "stretch",
    },
    meditatePageContainer: {
      width: SCREEN_WIDTH,
      flex: 1,
    },
    meditateHeroCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
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
              {...(Platform.OS === "ios"
                ? { contentOffset: { x: SCREEN_WIDTH, y: 0 } }
                : {})}
            >
              {PAGES.map((page) => (
                <View
                  key={page.id}
                  style={
                    page.id === "benefits"
                      ? styles.learnPageContainer
                      : styles.meditatePageContainer
                  }
                >
                  {page.id === "benefits" ? (
                    <LearnTabContent bottomInset={bottomContentInset} />
                  ) : page.id === "oneBreath" ? (
                    <View style={styles.meditateHeroCenter}>
                      <HomeOneBreathHero
                        onJoinPress={handleOneBreathJoin}
                        roomId={selectedBreathRoomId}
                        onRoomSelect={setSelectedBreathRoomId}
                        durationMinutes={sessionDurationMinutes}
                        onTimerSelect={updateSessionDuration}
                      />
                    </View>
                  ) : (
                    <>
                      <HomeMeditateTopChrome
                        onScenesPress={sheets.handleScenesPress}
                        onTipsAndTricksPress={handleTipsAndTricksPress}
                        onProfilePress={handleProfilePress}
                        onSettingsPress={handleSettingsPress}
                      />
                      <View style={styles.meditateHeroCenter}>
                        <HomeMeditateHero
                          onStartPress={handleStartPress}
                          exerciseId={displayExercise.id}
                          exerciseTitle={displayExercise.title}
                          onTechniqueSelect={handleTechniqueSelect}
                          durationMinutes={sessionDurationMinutes}
                          onTimerSelect={updateSessionDuration}
                        />
                      </View>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          <HomeNavigation
            selectedIndex={currentPageIndex}
            onSelect={handleNavSelect}
          />

          {(sheets.isSheetOpen ||
            sheets.isSupportSheetOpen ||
            sheets.isScenesSheetOpen) && (
            <Pressable
              onPress={sheets.closeAllSheets}
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Close sheet"
              accessibilityRole="button"
            />
          )}

          <ExerciseDetailSheet
            ref={sheets.sheetRef}
            exercise={sheets.selectedExerciseForInfo}
            onChange={sheets.handleSheetChange}
            onDismiss={sheets.handleSheetDismiss}
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
