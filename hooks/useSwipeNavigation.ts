import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export function useSwipeNavigation() {
  const router = useRouter();

  const navigateToCalm = useCallback(() => {
    router.push('/calm');
  }, [router]);

  const navigateToRelax = useCallback(() => {
    router.push('/');
  }, [router]);

  const navigateToEnergize = useCallback(() => {
    router.push('/energize');
  }, [router]);

  const createSwipeGesture = useCallback((
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void
  ) => {
    const gestures: Gesture[] = [];

    // Swipe left (finger moves left) -> navigate to right page
    if (onSwipeLeft) {
      gestures.push(
        Gesture.Fling()
          .direction(1) // Right direction (triggered by swipe left)
          .onEnd(() => {
            runOnJS(onSwipeLeft)();
          })
      );
    }

    // Swipe right (finger moves right) -> navigate to left page
    if (onSwipeRight) {
      gestures.push(
        Gesture.Fling()
          .direction(2) // Left direction (triggered by swipe right)
          .onEnd(() => {
            runOnJS(onSwipeRight)();
          })
      );
    }

    if (gestures.length === 0) {
      return Gesture.Tap(); // Return a no-op gesture if no handlers
    }

    if (gestures.length === 1) {
      return gestures[0];
    }

    return Gesture.Race(...gestures);
  }, []);

  return {
    navigateToCalm,
    navigateToRelax,
    navigateToEnergize,
    createSwipeGesture,
  };
}
