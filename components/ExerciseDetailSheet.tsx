import React, { forwardRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Exercise } from '../lib/storage';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetCollapsibleSection from './BottomSheetCollapsibleSection';
import BottomSheetDivider from './BottomSheetDivider';
import { useTheme } from './Theme';

export type ExerciseDetailSheetHandle = BaseBottomSheetHandle;

interface ExerciseDetailSheetProps {
  exercise: Exercise | null;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const ExerciseDetailSheet = forwardRef<ExerciseDetailSheetHandle, ExerciseDetailSheetProps>(
  ({ exercise, onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const [benefitsExpanded, setBenefitsExpanded] = useState(false);
    const [methodExpanded, setMethodExpanded] = useState(false);

    return (
      <BaseBottomSheet
        ref={ref}
        title={exercise?.title || 'Exercise Details'}
        onChange={onChange}
        onDismiss={onDismiss}
      >
        {exercise ? (
          <>
            {/* Breathing Pattern */}
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 16, 
              marginBottom: 20, 
              textAlign: 'center', 
              opacity: 0.8 
            }}>
              Inhale: {exercise.inhale}s → Hold: {exercise.hold1}s → Exhale: {exercise.exhale}s → Hold: {exercise.hold2}s
            </Text>

            {/* Description */}
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 16, 
              lineHeight: 24, 
              marginBottom: 16, 
              opacity: 0.9 
            }}>
              {exercise.description}
            </Text>

            <BottomSheetDivider />

            {/* Benefits Section */}
            <BottomSheetCollapsibleSection 
              title="BENEFITS" 
              content={exercise.benefit} 
              expanded={benefitsExpanded} 
              onToggle={() => setBenefitsExpanded(!benefitsExpanded)} 
            />

            <BottomSheetDivider />

            {/* Method Section */}
            <BottomSheetCollapsibleSection 
              title="METHOD" 
              content={exercise.method} 
              expanded={methodExpanded} 
              onToggle={() => setMethodExpanded(!methodExpanded)} 
            />
          </>
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: tokens.bottomSheetText }}>No exercise selected</Text>
          </View>
        )}
      </BaseBottomSheet>
    );
  }
);

ExerciseDetailSheet.displayName = 'ExerciseDetailSheet';

export default ExerciseDetailSheet;
