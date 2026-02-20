import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Exercise } from '../lib/storage';
import BottomSheetCollapsibleSection from './BottomSheetCollapsibleSection';
import BottomSheetDivider from './BottomSheetDivider';
import { useTheme } from './Theme';

interface BottomSheetExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onToggleExpand: () => void;
}

export default function BottomSheetExerciseCard({
  exercise,
  isSelected,
  isExpanded,
  onPress,
  onToggleExpand,
}: BottomSheetExerciseCardProps) {
  const { tokens } = useTheme();
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [methodExpanded, setMethodExpanded] = useState(false);

  return (
    <View style={{
      marginBottom: 8,
      borderBottomWidth: isExpanded ? 0 : 1,
      borderBottomColor: tokens.bottomSheetSeparator,
    }}>
      <Pressable
        onPress={onPress}
        style={{
          paddingVertical: 16,
          paddingLeft: 4,
          paddingRight: 4,
          opacity: isSelected ? 1 : 0.85,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start',
          gap: 12,
        }}>
          {/* Selection Indicator */}
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? tokens.bottomSheetText : tokens.bottomSheetSeparator,
            backgroundColor: isSelected ? tokens.bottomSheetText : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
          }}>
            {isSelected && (
              <Text style={{ 
                color: tokens.bottomSheetBg, 
                fontSize: 12, 
                fontWeight: '700' 
              }}>
                ✓
              </Text>
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 18, 
              fontWeight: isSelected ? '700' : '600',
              marginBottom: 6,
            }}>
              {exercise.title}
            </Text>
            <Text style={{ 
              color: tokens.bottomSheetSecondaryText, 
              fontSize: 14, 
              lineHeight: 20,
              opacity: 0.8,
            }}>
              {exercise.shortDescription}
            </Text>
          </View>
          
          {/* Expand/Collapse Chevron */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            style={{
              width: 28,
              height: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 2,
            }}
          >
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 18, 
              fontWeight: '400' 
            }}>
              {isExpanded ? '⌃' : '⌄'}
            </Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={{ 
          paddingLeft: 36,
          paddingRight: 4,
          paddingBottom: 16,
        }}>
          {/* Breathing Pattern */}
          <Text style={{ 
            color: tokens.bottomSheetText, 
            fontSize: 14, 
            marginBottom: 16, 
            opacity: 0.8 
          }}>
            Inhale: {exercise.inhale}s → Hold: {exercise.hold1}s → Exhale: {exercise.exhale}s → Hold: {exercise.hold2}s
          </Text>

          {/* Description */}
          <Text style={{ 
            color: tokens.bottomSheetText, 
            fontSize: 15, 
            lineHeight: 22, 
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

          <BottomSheetDivider />
        </View>
      )}
    </View>
  );
}
