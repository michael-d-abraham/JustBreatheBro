import ExerciseDetailSheet, { ExerciseDetailSheetHandle } from '@/components/ExerciseDetailSheet';
import { useTheme } from '@/components/Theme';
import { useBreathing } from '@/contexts/breathingContext';
import { useApp } from '@/contexts/themeContext';
import { defaultExercises } from '@/lib/storage';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();
  const router = useRouter();
  const { updateExercise } = useBreathing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useRef<ExerciseDetailSheetHandle>(null);

  // Get Deep Breathing exercise (id: "1")
  const deepBreathingExercise = defaultExercises.find(ex => ex.id === "1") || defaultExercises[0];

  const handleInfoPress = () => {
    setIsSheetOpen(true);
    sheetRef.current?.open();
  };

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const closeSheet = () => {
    sheetRef.current?.close();
  };

  const handleStartPress = async () => {
    await updateExercise(deepBreathingExercise);
    router.push('/breathing');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground,
    },
    title: {
      color: tokens.textOnAccent,
      fontSize: 32,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 60,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      color: tokens.textOnAccent,
      fontSize: 42,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      color: tokens.textOnAccent,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 60,
      opacity: 0.8,
    },
    circleContainer: {
      width: 300,
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 60,
    },
    circleButton: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: tokens.accentMuted,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
      opacity: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circleButtonText: {
      color: tokens.textOnAccent,
      fontSize: 24,
      fontWeight: '700',
    },
    techniqueContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    techniqueLabel: {
      color: tokens.textOnAccent,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    techniqueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    techniqueValue: {
      color: tokens.textOnAccent,
      fontSize: 16,
      opacity: 0.9,
    },
    infoButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: tokens.textOnAccent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>Relax</Text>
            
            {/* Description */}
            <Text style={styles.description}>Quiet your mind and relieve stress</Text>
            
            {/* Center Circle */}
            <View style={styles.circleContainer}>
              <Pressable onPress={handleStartPress} style={styles.circleButton}>
                <Text style={styles.circleButtonText}>Start</Text>
              </Pressable>
            </View>
            
            {/* Technique Section */}
            <View style={styles.techniqueContainer}>
              <Text style={styles.techniqueLabel}>Technique:</Text>
              <View style={styles.techniqueRow}>
                <Text style={styles.techniqueValue}>Deep Breathing</Text>
                <Pressable onPress={handleInfoPress} style={styles.infoButton}>
                  <Text style={styles.infoText}>i</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Blurred backdrop (tap to dismiss) */}
          {isSheetOpen && (
            <Pressable onPress={closeSheet} style={StyleSheet.absoluteFill}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          {/* Bottom Sheet Modal */}
          <ExerciseDetailSheet 
            ref={sheetRef} 
            exercise={deepBreathingExercise}
            onChange={handleSheetChange}
            onDismiss={handleSheetDismiss}
          />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
