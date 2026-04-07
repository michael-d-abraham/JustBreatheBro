import { SoundscapeType } from "@/contexts/themeContext";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";

const SOUNDSCAPE_FILES: Record<Exclude<SoundscapeType, 'off'>, any> = {
  dream: require('../assets/SoundScapes/DreamScape.wav'),
  fuzzy: require('../assets/SoundScapes/Fuzzy.wav'),
  keys: require('../assets/SoundScapes/Keys.mp3'),
};

interface UseBackgroundSoundscapeProps {
  soundscape: SoundscapeType;
  /** Master mute: when false, soundscape never plays (same as global sound off). */
  soundEnabled: boolean;
}

/**
 * Hook to manage background soundscape playback
 * Plays continuously in a loop throughout the app
 */
export function useBackgroundSoundscape({ soundscape, soundEnabled }: UseBackgroundSoundscapeProps) {
  const audioActive = soundEnabled && soundscape !== 'off';

  // Always call useAudioPlayer to maintain hook order (Rules of Hooks)
  // Use a placeholder source when 'off' to ensure hook is always called
  const audioSource = soundscape !== 'off' 
    ? SOUNDSCAPE_FILES[soundscape]
    : SOUNDSCAPE_FILES.dream; // Use dream as placeholder when off (won't be played)
  
  const player = useAudioPlayer(audioSource);
  const previousSoundscapeRef = useRef<SoundscapeType | null>(null);
  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle looping when sound finishes
  useEffect(() => {
    if (!audioActive || !player) return;

    const checkAndLoop = () => {
      try {
        // Check if playback is near the end or has finished
        if (player.duration && player.currentTime > 0) {
          // If we're at or past the end, restart from beginning
          if (player.currentTime >= player.duration - 0.05) {
            player.seekTo(0);
            if (!player.playing) {
              player.play();
            }
          }
        }
      } catch (error) {
        // Ignore errors during checking
      }
    };

    // Clear any existing interval
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    // Set up interval to check playback status for looping
    loopIntervalRef.current = setInterval(checkAndLoop, 50);

    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    };
  }, [player, audioActive]);

  // Handle soundscape changes - stop current playback when switching
  useEffect(() => {
    if (previousSoundscapeRef.current !== null && previousSoundscapeRef.current !== soundscape) {
      if (soundscape === 'off' && player) {
        try {
          if (player.playing) {
            player.pause();
          }
        } catch (error) {
          // Ignore errors
        }
      }
    }
    
    previousSoundscapeRef.current = soundscape;
  }, [soundscape, player]);

  // Master mute: stop immediately when sound is turned off app-wide
  useEffect(() => {
    if (!player || soundEnabled) return;
    try {
      if (player.playing) {
        player.pause();
      }
      if (typeof player.seekTo === 'function') {
        player.seekTo(0);
      }
    } catch {
      // Ignore
    }
  }, [player, soundEnabled]);

  // Start playing when player is available and audio should be active
  useEffect(() => {
    if (!player || !audioActive) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const startPlayback = () => {
      if (cancelled) return;
      try {
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.error('Failed to start soundscape:', error);
        retryTimer = setTimeout(() => {
          if (cancelled) return;
          try {
            player.seekTo(0);
            player.play();
          } catch (retryError) {
            console.error('Failed to start soundscape on retry:', retryError);
          }
        }, 200);
      }
    };

    const timer = setTimeout(startPlayback, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (player) {
        try {
          if (player.playing) {
            player.pause();
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [player, audioActive]);

  return { player };
}

