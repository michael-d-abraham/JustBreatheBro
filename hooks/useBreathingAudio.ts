import { SoundType } from "@/contexts/themeContext";
import { useAudioPlayer } from "expo-audio";
import { useEffect } from "react";

const SOUND_FILES: Record<Exclude<SoundType, 'off'>, { inhale: any; exhale: any }> = {
  guzheng: {
    inhale: require('../assets/sounds/Guzheng/Inhale.wav'),
    exhale: require('../assets/sounds/Guzheng/Exhale.wav'),
  },
  sine: {
    inhale: require('../assets/sounds/Sine/Inhale.wav'),
    exhale: require('../assets/sounds/Sine/Exhale.wav'),
  },
  synth: {
    inhale: require('../assets/sounds/synth/Inhale.wav'),
    exhale: require('../assets/sounds/synth/Exhale - Synth.wav'),
  },
};

interface UseBreathingAudioProps {
  soundEnabled: boolean;
  isRunning: boolean;
  soundType: SoundType;
}

/**
 * Hook to manage audio playback for breathing exercises
 * Handles separate inhale and exhale sounds for each sound type
 * Dynamically switches between different sound types
 */
export function useBreathingAudio({ soundEnabled, isRunning, soundType }: UseBreathingAudioProps) {
  // Always call useAudioPlayer to maintain hook order (Rules of Hooks)
  // Use placeholder sources when 'off' to ensure hooks are always called
  const inhaleSource = soundType !== 'off' 
    ? SOUND_FILES[soundType].inhale
    : SOUND_FILES.sine.inhale; // Use sine as placeholder when off (won't be played)
  const exhaleSource = soundType !== 'off'
    ? SOUND_FILES[soundType].exhale
    : SOUND_FILES.sine.exhale; // Use sine as placeholder when off (won't be played)
  
  const inhalePlayer = useAudioPlayer(inhaleSource, { keepAudioSessionActive: true });
  const exhalePlayer = useAudioPlayer(exhaleSource, { keepAudioSessionActive: true });
  
  // Helper to safely check if player is valid
  const isPlayerValid = (p: typeof inhalePlayer): boolean => {
    try {
      // Try to access a property to check if player is still valid
      return p !== null && p !== undefined;
    } catch {
      return false;
    }
  };
  
  // Set volume for breathing sounds (0.0 to 1.0, where 0.5 = 50% volume)
  // Adjust this value to make sounds quieter or louder:
  // - 0.3 = 30% volume (quieter)
  // - 0.5 = 50% volume (moderate)
  // - 0.7 = 70% volume (louder)
  // - 1.0 = 100% volume (full volume)
  const BREATHING_SOUND_VOLUME = 0.3; // Adjust this value as needed
  
  // Set volume on players when they're created or sound type changes
  useEffect(() => {
    if (inhalePlayer && isPlayerValid(inhalePlayer)) {
      try {
        // expo-audio's AudioPlayer has a volume property that can be set directly
        if ('volume' in inhalePlayer) {
          (inhalePlayer as any).volume = BREATHING_SOUND_VOLUME;
        }
      } catch (error) {
        // Ignore if volume property doesn't exist or can't be set
      }
    }
    if (exhalePlayer && isPlayerValid(exhalePlayer)) {
      try {
        if ('volume' in exhalePlayer) {
          (exhalePlayer as any).volume = BREATHING_SOUND_VOLUME;
        }
      } catch (error) {
        // Ignore if volume property doesn't exist or can't be set
      }
    }
  }, [inhalePlayer, exhalePlayer]);

  // Master sound off: stop breathing cues immediately (top-level mute)
  useEffect(() => {
    if (soundEnabled) return;
    if (inhalePlayer && isPlayerValid(inhalePlayer)) {
      try {
        if (inhalePlayer.playing) {
          inhalePlayer.pause();
        }
        if (typeof inhalePlayer.seekTo === 'function') {
          inhalePlayer.seekTo(0);
        }
      } catch {
        // ignore
      }
    }
    if (exhalePlayer && isPlayerValid(exhalePlayer)) {
      try {
        if (exhalePlayer.playing) {
          exhalePlayer.pause();
        }
        if (typeof exhalePlayer.seekTo === 'function') {
          exhalePlayer.seekTo(0);
        }
      } catch {
        // ignore
      }
    }
  }, [soundEnabled, inhalePlayer, exhalePlayer]);
  
  // Cleanup audio players on unmount
  useEffect(() => {
    return () => {
      if (inhalePlayer && isPlayerValid(inhalePlayer)) {
        try {
          if (inhalePlayer.playing) {
            inhalePlayer.pause();
          }
          if (typeof inhalePlayer.seekTo === 'function') {
            inhalePlayer.seekTo(0);
          }
        } catch (error) {
          // Player might be disposed, ignore cleanup errors
        }
      }
      if (exhalePlayer && isPlayerValid(exhalePlayer)) {
        try {
          if (exhalePlayer.playing) {
            exhalePlayer.pause();
          }
          if (typeof exhalePlayer.seekTo === 'function') {
            exhalePlayer.seekTo(0);
          }
        } catch (error) {
          // Player might be disposed, ignore cleanup errors
        }
      }
    };
  }, [inhalePlayer, exhalePlayer]);

  const playInhaleSound = async () => {
    if (!soundEnabled) return;
    if (soundType === 'off' || !inhalePlayer) return; // Don't play if sound is off
    
    // Check if player exists and is valid
    if (!isPlayerValid(inhalePlayer)) {
      throw new Error('Inhale audio player is not initialized');
    }
    
    try {
      // Check if player methods exist
      if (typeof inhalePlayer.play !== 'function') {
        throw new Error('Inhale audio player play method is not available');
      }
      
      // Reset to beginning and play
      if (typeof inhalePlayer.seekTo === 'function') {
        inhalePlayer.seekTo(0);
      }
      inhalePlayer.play();
    } catch (error) {
      // If player is disposed, throw a clearer error
      throw new Error(`Failed to play inhale sound: ${error}`);
    }
  };

  const playExhaleSound = async () => {
    if (!soundEnabled) return;
    if (soundType === 'off' || !exhalePlayer) return; // Don't play if sound is off
    
    // Check if player exists and is valid
    if (!isPlayerValid(exhalePlayer)) {
      throw new Error('Exhale audio player is not initialized');
    }
    
    try {
      // Check if player methods exist
      if (typeof exhalePlayer.play !== 'function') {
        throw new Error('Exhale audio player play method is not available');
      }
      
      // Reset to beginning and play
      if (typeof exhalePlayer.seekTo === 'function') {
        exhalePlayer.seekTo(0);
      }
      exhalePlayer.play();
    } catch (error) {
      // If player is disposed, throw a clearer error
      throw new Error(`Failed to play exhale sound: ${error}`);
    }
  };

  const stopSound = () => {
    if (inhalePlayer && isPlayerValid(inhalePlayer)) {
      try {
        if (inhalePlayer.playing) {
          inhalePlayer.pause();
        }
      } catch (error) {
        // Player might be disposed, ignore
      }
    }
    if (exhalePlayer && isPlayerValid(exhalePlayer)) {
      try {
        if (exhalePlayer.playing) {
          exhalePlayer.pause();
        }
      } catch (error) {
        // Player might be disposed, ignore
      }
    }
  };

  const forceStop = () => {
    // Force stop immediately, even if mid-sound
    if (inhalePlayer && isPlayerValid(inhalePlayer)) {
      try {
        if (inhalePlayer.playing) {
          inhalePlayer.pause();
        }
        if (typeof inhalePlayer.seekTo === 'function') {
          inhalePlayer.seekTo(0);
        }
      } catch (error) {
        // Player might be disposed, ignore
      }
    }
    if (exhalePlayer && isPlayerValid(exhalePlayer)) {
      try {
        if (exhalePlayer.playing) {
          exhalePlayer.pause();
        }
        if (typeof exhalePlayer.seekTo === 'function') {
          exhalePlayer.seekTo(0);
        }
      } catch (error) {
        // Player might be disposed, ignore
      }
    }
  };

  return { playInhaleSound, playExhaleSound, stopSound, forceStop };
}

