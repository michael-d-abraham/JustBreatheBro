import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Exercise } from '../lib/storage';
import { useTheme } from './Theme';

export type ExerciseSelectionSheetHandle = {
  open: () => void;
  close: () => void;
};

interface ExerciseSelectionSheetProps {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  onSelectExercise: (exercise: Exercise) => void;
  onInfoPress: (exercise: Exercise) => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const ExerciseSelectionSheet = forwardRef<ExerciseSelectionSheetHandle, ExerciseSelectionSheetProps>(
  ({ exercises, currentExercise, onSelectExercise, onInfoPress, onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.present(),
      close: () => modalRef.current?.dismiss(),
    }));

    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={['70%']}
        index={0}
        enablePanDownToClose
        enableOverDrag={false}
        enableDynamicSizing={false}
        onChange={onChange}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: tokens.sceneBackground }}
        handleIndicatorStyle={{ backgroundColor: tokens.textOnAccent }}
      >
        <BottomSheetScrollView 
          style={{ flex: 1, paddingHorizontal: 20 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 24, 
            fontWeight: '700', 
            marginBottom: 24, 
            textAlign: 'center' 
          }}>
            Choose a Technique
          </Text>

          {exercises.map((exercise) => {
            const isSelected = currentExercise?.id === exercise.id;
            
            return (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  onSelectExercise(exercise);
                  modalRef.current?.dismiss();
                }}
                style={{
                  backgroundColor: isSelected ? tokens.accentPrimary : tokens.accentMuted,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? tokens.accentPrimary : tokens.borderSubtle,
                }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 32 }}>
                      {exercise.symbol}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: tokens.textOnAccent, 
                        fontSize: 18, 
                        fontWeight: '700',
                        marginBottom: 4,
                      }}>
                        {exercise.title}
                      </Text>
                      <Text style={{ 
                        color: tokens.textOnAccent, 
                        fontSize: 14, 
                        opacity: 0.8,
                      }}>
                        {exercise.shortDescription}
                      </Text>
                    </View>
                  </View>
                  
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onInfoPress(exercise);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: tokens.textOnAccent,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 14, 
                      fontWeight: '600' 
                    }}>
                      i
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

ExerciseSelectionSheet.displayName = 'ExerciseSelectionSheet';

export default ExerciseSelectionSheet;
