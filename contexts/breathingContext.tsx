import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Exercise, getCurrentExercise, saveCurrentExercise } from '@/lib/storage';

interface BreathingContextType {
  currentExercise: Exercise | null;
  updateExercise: (exercise: Exercise) => void;
}

const BreathingContext = createContext<BreathingContextType | undefined>(undefined);

export const useBreathing = () => {
  const context = useContext(BreathingContext);
  if (!context) {
    throw new Error('useBreathing must be used within a BreathingProvider');
  }
  return context;
};

export const BreathingProvider = ({ children }: { children: ReactNode }) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    getCurrentExercise().then(setCurrentExercise);
  }, []);

  const updateExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    saveCurrentExercise(exercise);
  };

  return (
    <BreathingContext.Provider value={{ currentExercise, updateExercise }}>
      {children}
    </BreathingContext.Provider>
  );
};
