import { ExerciseDetailSheetHandle } from "@/components/ExerciseDetailSheet";
import { ScenesSheetHandle } from "@/components/ScenesSheet";
import {
  SupportSheetEntry,
  SupportSheetHandle,
} from "@/components/SupportSheet";
import { useBreathing } from "@/contexts/breathingContext";
import { Exercise, getExercises } from "@/lib/storage";
import { useCallback, useEffect, useRef, useState } from "react";

export function useBreathingSheets() {
  const { currentExercise } = useBreathing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSupportSheetOpen, setIsSupportSheetOpen] = useState(false);
  const [isScenesSheetOpen, setIsScenesSheetOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseForInfo, setSelectedExerciseForInfo] =
    useState<Exercise | null>(null);

  const sheetRef = useRef<ExerciseDetailSheetHandle>(null);
  const supportSheetRef = useRef<SupportSheetHandle>(null);
  const scenesSheetRef = useRef<ScenesSheetHandle>(null);

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

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const openSupportSheet = useCallback((entry: SupportSheetEntry = "settings") => {
    setIsSupportSheetOpen(true);
    supportSheetRef.current?.open(entry);
  }, []);

  const handleSupportPress = useCallback(() => {
    openSupportSheet("settings");
  }, [openSupportSheet]);

  const handleTipsAndTricksPress = useCallback(() => {
    openSupportSheet("explore");
  }, [openSupportSheet]);

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

  const closeAllSheets = useCallback(() => {
    if (isSheetOpen) closeSheet();
    if (isSupportSheetOpen) closeSupportSheet();
    if (isScenesSheetOpen) closeScenesSheet();
  }, [
    isSheetOpen,
    isSupportSheetOpen,
    isScenesSheetOpen,
    closeSheet,
    closeSupportSheet,
    closeScenesSheet,
  ]);

  return {
    isSheetOpen,
    isSupportSheetOpen,
    isScenesSheetOpen,
    exercises,
    currentExercise,
    selectedExerciseForInfo,
    sheetRef,
    supportSheetRef,
    scenesSheetRef,
    handleInfoPress,
    handleSheetChange,
    handleSheetDismiss,
    handleSupportPress,
    handleTipsAndTricksPress,
    handleSupportSheetChange,
    handleSupportSheetDismiss,
    handleScenesPress,
    handleScenesSheetChange,
    handleScenesSheetDismiss,
    closeSheet,
    closeSupportSheet,
    closeScenesSheet,
    closeAllSheets,
  };
}
