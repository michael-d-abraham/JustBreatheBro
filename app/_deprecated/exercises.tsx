import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import ExerciseContainer from '../components/ExerciseContainer';
import ExerciseDetailSheet, { ExerciseDetailSheetHandle } from '../components/ExerciseDetailSheet';
import { useTheme } from '../components/Theme';
import { useBreathing } from '../contexts/breathingContext';
import { useApp } from '../contexts/themeContext';
import { Exercise, forceUpdateToDefaults, getExercises } from '../lib/storage';

export default function ExercisesPage() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();
  const { updateExercise } = useBreathing();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useRef<ExerciseDetailSheetHandle>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const loadedExercises = await getExercises();
    setExercises(loadedExercises);
  };

  const handleExercisePress = async (exercise: Exercise) => {
    // Update the current exercise in context
    await updateExercise(exercise);
    // Navigate directly to breathing screen
    router.push('/breathing');
  };

  const handleInfoPress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsSheetOpen(true); // Set immediately for instant blur
    sheetRef.current?.open();
  };

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0); // -1 means closed
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const closeSheet = () => {
    sheetRef.current?.close();
  };

  const handleResetToDefaults = async () => {
    await forceUpdateToDefaults();
    await loadExercises();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground }}>
          <View style={{ flex: 1, padding: 16 }}>
            <BackButton onPress={() => router.back()} />

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 24,
            paddingHorizontal: 8,
          }}>
            <Text style={{ 
              color: tokens.textOnAccent, 
              fontSize: 28, 
              fontWeight: '700',
            }}>
              Choose an Exercise
            </Text>
            
            {/* DEV: Temporary button to reload defaults */}
            <Pressable 
              onPress={handleResetToDefaults}
              style={{
                backgroundColor: tokens.accentPrimary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: tokens.textOnAccent, fontSize: 12 }}>
                🔄 Reset
              </Text>
            </Pressable>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 2-Column Grid */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 16,
            }}>
              {exercises.map((exercise) => (
                <View 
                  key={exercise.id}
                  style={{ 
                    width: '47%', // Slightly less than 50% to account for gap
                  }}
                >
                  <ExerciseContainer
                    exercise={exercise}
                    onPress={() => handleExercisePress(exercise)}
                    onInfoPress={() => handleInfoPress(exercise)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Blurred backdrop (tap to dismiss) */}
          {isSheetOpen && (
            <Pressable onPress={closeSheet} style={StyleSheet.absoluteFill}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          {/* Bottom Sheet Modal */}
          <ExerciseDetailSheet 
            ref={sheetRef} 
            exercise={selectedExercise}
            onChange={handleSheetChange}
            onDismiss={handleSheetDismiss}
          />
          </View>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

