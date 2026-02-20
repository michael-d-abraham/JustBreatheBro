import BreathingPageHeader from '@/components/BreathingPageHeader';
import ExerciseDetailSheet from '@/components/ExerciseDetailSheet';
import ExerciseSelectionSheet from '@/components/ExerciseSelectionSheet';
import SupportSheet from '@/components/SupportSheet';
import { useTheme } from '@/components/Theme';
import { useBreathing } from '@/contexts/breathingContext';
import { useApp } from '@/contexts/themeContext';
import { useBreathingSheets } from '@/hooks/useBreathingSheets';
import { defaultExercises } from '@/lib/storage';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  { subtitle: 'Calm', description: 'Find peace and tranquility' },
  { subtitle: 'Relax', description: 'Quiet your mind and relieve stress' },
  { subtitle: 'Energize', description: 'Boost your energy and focus' },
];

export default function Index() {
  const { tokens } = useTheme();
  const router = useRouter();
  const { currentExercise, updateExercise } = useBreathing();
  const sheets = useBreathingSheets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1); // Start at Relax (middle page)

  // Set initial scroll position to middle page (Relax)
  useEffect(() => {
    // Small delay to ensure ScrollView is mounted
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: 1 * SCREEN_WIDTH, // Middle page (index 1)
        animated: false,
      });
    }, 100);
  }, []);

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

  const handleCirclePress = () => {
    // Navigate to wallpaper selection page
    router.push('/wallpaper');
  };

  const handleInfoLibraryPress = () => {
    router.push('/informationarchive');
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: false, // No animation as requested
    });
    setCurrentPageIndex(index);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPageIndex(pageIndex);
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

  const { backgroundImage } = useApp();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    scrollableContent: {
      flex: 1,
      marginTop: 60, // Space for fixed header
      marginBottom: 180, // Space for fixed footer
    },
    scrollView: {
      flex: 1,
    },
    pageContainer: {
      width: SCREEN_WIDTH,
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      color: tokens.textOnAccent,
      fontSize: 48,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      color: tokens.textOnAccent,
      fontSize: 18,
      textAlign: 'center',
      opacity: 0.8,
    },
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
    },
    startButtonContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginBottom: 40,
    },
    startButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    startButtonText: {
      color: tokens.textOnAccent,
      fontSize: 28,
      fontWeight: '700',
    },
    arrowButton: {
      position: 'absolute',
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 5,
    },
    arrowIcon: {
      color: tokens.textOnAccent,
      fontSize: 32,
      opacity: 0.7,
    },
    techniqueContainer: {
      alignItems: 'center',
    },
    techniqueLabel: {
      color: tokens.textOnAccent,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 12,
    },
    techniqueValue: {
      color: tokens.textOnAccent,
      fontSize: 18,
    },
    techniqueSelectable: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chevronIcon: {
      color: tokens.textOnAccent,
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
          />
        </View>

        {/* Scrollable Middle Content */}
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
            contentContainerStyle={{ flexDirection: 'row' }}
          >
            {PAGES.map((page, index) => (
              <View key={index} style={styles.pageContainer}>
                <Text style={styles.subtitle}>{page.subtitle}</Text>
                <Text style={styles.description}>{page.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.startButtonContainer}>
            {/* Left Arrow */}
            {currentPageIndex > 0 && (
              <Pressable 
                onPress={handleLeftArrow} 
                style={[styles.arrowButton, { left: 20 }]}
          >
                <Text style={styles.arrowIcon}>‹</Text>
          </Pressable>
            )}
            
            <Pressable onPress={handleStartPress} style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
            
            {/* Right Arrow */}
            {currentPageIndex < PAGES.length - 1 && (
              <Pressable 
                onPress={handleRightArrow} 
                style={[styles.arrowButton, { right: 20 }]}
              >
                <Text style={styles.arrowIcon}>›</Text>
              </Pressable>
            )}
            </View>
            
            {/* Technique Section */}
            <View style={styles.techniqueContainer}>
              <Text style={styles.techniqueLabel}>Technique:</Text>
            <Pressable onPress={sheets.handleTechniquePress} style={styles.techniqueSelectable}>
                <Text style={styles.techniqueValue}>{displayExercise.title}</Text>
              <Text style={styles.chevronIcon}>⌄</Text>
            </Pressable>
            </View>
          </View>

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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

