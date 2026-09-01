import { ExerciseDetailSheetHandle } from "@/components/ExerciseDetailSheet";
import { ExerciseSelectionSheetHandle } from "@/components/ExerciseSelectionSheet";
import { ScenesSheetHandle } from "@/components/ScenesSheet";
import { SupportSheetHandle } from "@/components/SupportSheet";
import { useBreathing } from "@/contexts/breathingContext";
import { Exercise, getExercises } from "@/lib/storage";
import { useCallback, useEffect, useRef, useState } from "react";

export function useBreathingSheets() {
  const { currentExercise, updateExercise } = useBreathing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSupportSheetOpen, setIsSupportSheetOpen] = useState(false);
  const [isScenesSheetOpen, setIsScenesSheetOpen] = useState(false);
  const [isSelectionSheetOpen, setIsSelectionSheetOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseForInfo, setSelectedExerciseForInfo] =
    useState<Exercise | null>(null);

  const sheetRef = useRef<ExerciseDetailSheetHandle>(null);
  const supportSheetRef = useRef<SupportSheetHandle>(null);
  const scenesSheetRef = useRef<ScenesSheetHandle>(null);
  const selectionSheetRef = useRef<ExerciseSelectionSheetHandle>(null);

  // Load exercises from storage
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const loadedExercises = await getExercises();
    setExercises(loadedExercises);
  };

  const handleInfoPress = useCallback(
    (exercise?: Exercise, defaultExercise?: Exercise) => {
      const exerciseToShow = exercise || defaultExercise || currentExercise;
      if (exerciseToShow) {
        setSelectedExerciseForInfo(exerciseToShow);
        setIsSheetOpen(true);
        sheetRef.current?.open();
      }
    },
    [currentExercise],
  );

  const handleTechniquePress = useCallback(() => {
    setIsSelectionSheetOpen(true);
    selectionSheetRef.current?.open();
  }, []);

  const handleSelectExercise = useCallback(
    async (exercise: Exercise) => {
      await updateExercise(exercise);
    },
    [updateExercise],
  );

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleSupportPress = useCallback(() => {
    setIsSupportSheetOpen(true);
    supportSheetRef.current?.open();
  }, []);

  const handleSupportSheetChange = useCallback((index: number) => {
    setIsSupportSheetOpen(index >= 0);
  }, []);

  const handleSupportSheetDismiss = useCallback(() => {
    setIsSupportSheetOpen(false);
  }, []);

  const closeSupportSheet = useCallback(() => {
    supportSheetRef.current?.close();
  }, []);

  const handleScenesPress = useCallback(() => {
    setIsScenesSheetOpen(true);
    scenesSheetRef.current?.open();
  }, []);

  const handleScenesSheetChange = useCallback((index: number) => {
    setIsScenesSheetOpen(index >= 0);
  }, []);

  const handleScenesSheetDismiss = useCallback(() => {
    setIsScenesSheetOpen(false);
  }, []);

  const closeScenesSheet = useCallback(() => {
    scenesSheetRef.current?.close();
  }, []);

  const handleSelectionSheetChange = useCallback((index: number) => {
    setIsSelectionSheetOpen(index >= 0);
  }, []);

  const handleSelectionSheetDismiss = useCallback(() => {
    setIsSelectionSheetOpen(false);
  }, []);

  const closeSelectionSheet = useCallback(() => {
    selectionSheetRef.current?.close();
  }, []);

  const closeAllSheets = useCallback(() => {
    if (isSheetOpen) closeSheet();
    if (isSupportSheetOpen) closeSupportSheet();
    if (isScenesSheetOpen) closeScenesSheet();
    if (isSelectionSheetOpen) closeSelectionSheet();
  }, [
    isSheetOpen,
    isSupportSheetOpen,
    isScenesSheetOpen,
    isSelectionSheetOpen,
    closeSheet,
    closeSupportSheet,
    closeScenesSheet,
    closeSelectionSheet,
  ]);

  return {
    // State
    isSheetOpen,
    isSupportSheetOpen,
    isScenesSheetOpen,
    isSelectionSheetOpen,
    exercises,
    currentExercise,
    selectedExerciseForInfo,

    // Refs
    sheetRef,
    supportSheetRef,
    scenesSheetRef,
    selectionSheetRef,

    // Handlers
    handleInfoPress,
    handleTechniquePress,
    handleSelectExercise,
    handleSheetChange,
    handleSheetDismiss,
    handleSupportPress,
    handleSupportSheetChange,
    handleSupportSheetDismiss,
    handleScenesPress,
    handleScenesSheetChange,
    handleScenesSheetDismiss,
    handleSelectionSheetChange,
    handleSelectionSheetDismiss,
    closeSheet,
    closeSupportSheet,
    closeScenesSheet,
    closeSelectionSheet,
    closeAllSheets,
  };
}
