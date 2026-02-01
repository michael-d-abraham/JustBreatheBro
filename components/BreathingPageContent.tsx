import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Exercise } from '../lib/storage';
import { useTheme } from './Theme';

interface BreathingPageContentProps {
  subtitle: string;
  description: string;
  currentExercise: Exercise;
  onTechniquePress: () => void;
  onInfoPress: (exercise?: Exercise) => void;
  onStartPress: () => void;
  showLeftArrow?: boolean;
  showRightArrow?: boolean;
  onLeftArrowPress?: () => void;
  onRightArrowPress?: () => void;
}

export default function BreathingPageContent({
  subtitle,
  description,
  currentExercise,
  onTechniquePress,
  onInfoPress,
  onStartPress,
  showLeftArrow = false,
  showRightArrow = false,
  onLeftArrowPress,
  onRightArrowPress,
}: BreathingPageContentProps) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'space-evenly',
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
      marginBottom: 20,
      opacity: 0.8,
    },
    startButtonContainer: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
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
    techniqueContainer: {
      alignItems: 'center',
    },
    techniqueLabel: {
      color: tokens.textOnAccent,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 12,
    },
    techniqueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    techniqueValue: {
      color: tokens.textOnAccent,
      fontSize: 18,
      opacity: 0.9,
    },
    techniqueSelectable: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chevronIcon: {
      color: tokens.textOnAccent,
      fontSize: 16,
      opacity: 0.7,
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
  });

  return (
    <View style={styles.contentContainer}>
      {/* Subtitle */}
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {/* Description */}
      <Text style={styles.description}>{description}</Text>
      
      {/* Start Button with Arrows */}
      <View style={styles.startButtonContainer}>
        {/* Left Arrow */}
        {showLeftArrow && onLeftArrowPress && (
          <Pressable 
            onPress={onLeftArrowPress} 
            style={[styles.arrowButton, { left: 20 }]}
          >
            <Text style={styles.arrowIcon}>‹</Text>
          </Pressable>
        )}
        
        <Pressable onPress={onStartPress} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start</Text>
        </Pressable>
        
        {/* Right Arrow */}
        {showRightArrow && onRightArrowPress && (
          <Pressable 
            onPress={onRightArrowPress} 
            style={[styles.arrowButton, { right: 20 }]}
          >
            <Text style={styles.arrowIcon}>›</Text>
          </Pressable>
        )}
      </View>
      
      {/* Technique Section */}
      <View style={styles.techniqueContainer}>
        <Text style={styles.techniqueLabel}>Technique:</Text>
        <Pressable onPress={onTechniquePress} style={styles.techniqueSelectable}>
          <View style={styles.techniqueRow}>
            <Text style={styles.techniqueValue}>{currentExercise.title}</Text>
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                onInfoPress();
              }} 
              style={styles.infoButton}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>
          <Text style={styles.chevronIcon}>⌄</Text>
        </Pressable>
      </View>
    </View>
  );
}
