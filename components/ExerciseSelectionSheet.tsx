import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Exercise } from '../lib/storage';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetExerciseCard from './BottomSheetExerciseCard';

export type ExerciseSelectionSheetHandle = BaseBottomSheetHandle;

interface ExerciseSelectionSheetProps {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  onSelectExercise: (exercise: Exercise) => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const ExerciseSelectionSheet = forwardRef<ExerciseSelectionSheetHandle, ExerciseSelectionSheetProps>(
  ({ exercises, currentExercise, onSelectExercise, onChange, onDismiss }, ref) => {
    const baseSheetRef = useRef<BaseBottomSheetHandle>(null);
    const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

    // Forward the ref methods from BaseBottomSheet
    useImperativeHandle(ref, () => ({
      open: () => baseSheetRef.current?.open(),
      close: () => baseSheetRef.current?.close(),
    }));

    const handleToggleExpand = (exerciseId: string) => {
      setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
    };

    return (
      <BaseBottomSheet
        ref={baseSheetRef}
        title="Choose a Technique"
        snapPoints={['70%', '90%']}
        onChange={onChange}
        onDismiss={onDismiss}
      >
        {exercises.map((exercise) => {
          const isSelected = currentExercise?.id === exercise.id;
          const isExpanded = expandedExerciseId === exercise.id;
          
          return (
            <BottomSheetExerciseCard
              key={exercise.id}
              exercise={exercise}
              isSelected={isSelected}
              isExpanded={isExpanded}
              onPress={() => onSelectExercise(exercise)}
              onToggleExpand={() => handleToggleExpand(exercise.id)}
            />
          );
        })}
      </BaseBottomSheet>
    );
  }
);

ExerciseSelectionSheet.displayName = 'ExerciseSelectionSheet';

export default ExerciseSelectionSheet;
