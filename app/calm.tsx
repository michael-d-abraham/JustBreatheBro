import BreathingPageContent from '@/components/BreathingPageContent';
import BreathingPageHeader from '@/components/BreathingPageHeader';
import ExerciseDetailSheet from '@/components/ExerciseDetailSheet';
import ExerciseSelectionSheet from '@/components/ExerciseSelectionSheet';
import SupportSheet from '@/components/SupportSheet';
import { useTheme } from '@/components/Theme';
import { useBreathing } from '@/contexts/breathingContext';
import { useApp } from '@/contexts/themeContext';
import { useBreathingSheets } from '@/hooks/useBreathingSheets';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { defaultExercises } from '@/lib/storage';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from "react-native";
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Calm() {
  const { tokens } = useTheme();
  const router = useRouter();
  const { currentExercise, updateExercise } = useBreathing();
  const sheets = useBreathingSheets();
  const { navigateToRelax, createSwipeGesture } = useSwipeNavigation();

  // Get current exercise or default to Deep Breathing
  const displayExercise = currentExercise || defaultExercises.find(ex => ex.id === "1") || defaultExercises[0];

  const handleStartPress = async () => {
    await updateExercise(displayExercise);
    router.push({
      pathname: '/breathing',
      params: { autoStart: 'true' }
    });
  };

  const handleInfoPress = (exercise?: typeof displayExercise) => {
    sheets.handleInfoPress(exercise, displayExercise);
  };

  const swipeGesture = createSwipeGesture(
    () => navigateToRelax(), // Swipe left -> Relax (index)
    undefined                  // No swipe right from calm
  );

  const handleInfoLibraryPress = () => {
    router.push('/informationarchive');
  };

  const { backgroundImage } = useApp();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <GestureDetector gesture={swipeGesture}>
          <SafeAreaView style={styles.container}>
            <BreathingPageHeader
              supportSheetRef={sheets.supportSheetRef}
              onSupportPress={sheets.handleSupportPress}
              onInfoLibraryPress={handleInfoLibraryPress}
            />

            <BreathingPageContent
              subtitle="Calm"
              description="Find peace and tranquility"
              currentExercise={displayExercise}
              onTechniquePress={sheets.handleTechniquePress}
              onInfoPress={handleInfoPress}
              onStartPress={handleStartPress}
              showRightArrow={true}
              onRightArrowPress={navigateToRelax}
            />

          {/* Blurred backdrop (tap to dismiss) */}
          {(sheets.isSheetOpen || sheets.isSupportSheetOpen || sheets.isSelectionSheetOpen) && (
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
        </GestureDetector>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
