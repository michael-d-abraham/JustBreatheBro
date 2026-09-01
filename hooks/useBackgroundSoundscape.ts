import { SoundscapeType } from "@/contexts/appSettingsContext";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const SOUNDSCAPE_FILES: Record<Exclude<SoundscapeType, 'off'>, any> = {
  dream: require('../assets/SoundScapes/DreamScape.m4a'),
  fuzzy: require('../assets/SoundScapes/Fuzzy.m4a'),
  keys: require('../assets/SoundScapes/Keys.mp3'),
};

const SOUNDSCAPE_DISPLAY_NAMES: Record<Exclude<SoundscapeType, 'off'>, string> = {
  dream: 'Dreamscape',
  fuzzy: 'Fuzzy Rain',
  keys: 'Keys',
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
  
  const player = useAudioPlayer(audioSource, { keepAudioSessionActive: true });
  const previousSoundscapeRef = useRef<SoundscapeType | null>(null);
  // True when WE paused playback due to an AppState transition; cleared on foreground.
  const pausedByBackgroundRef = useRef(false);

  // Prefer native looping (more reliable than polling timers).
  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
    } catch {
      // Ignore if loop is unsupported.
    }
  }, [player]);

  // Pause on background / inactive; resume on foreground.
  // Lock-screen controls are kept active while paused so the user can resume
  // from the iOS lock screen or Control Center.
  useEffect(() => {
    if (!player) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        try {
          if (player.playing) {
            player.pause();
            pausedByBackgroundRef.current = true;
          }
          // Do NOT call setActiveForLockScreen(false) here — keep controls
          // visible so the user can resume from the lock screen.
        } catch {
          // Ignore
        }
      } else if (nextState === 'active') {
        try {
          if (pausedByBackgroundRef.current && !player.playing && audioActive) {
            // Resume from current position (no seekTo — preserve loop position).
            player.play();
            // soundscape is narrowed to Exclude<SoundscapeType, 'off'> here
            // because audioActive = soundEnabled && soundscape !== 'off'.
            try {
              (player as any).setActiveForLockScreen(true, {
                title: 'JustBreatheBro',
                artist: SOUNDSCAPE_DISPLAY_NAMES[soundscape],
              });
            } catch {
              // Ignore if setActiveForLockScreen is not available
            }
          }
        } catch {
          // Ignore
        }
        pausedByBackgroundRef.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [player, audioActive, soundscape]);

  // Handle soundscape changes - stop current playback when switching
  useEffect(() => {
    if (previousSoundscapeRef.current !== null && previousSoundscapeRef.current !== soundscape) {
      if (soundscape === 'off' && player) {
        try {
          if (player.playing) {
            player.pause();
          }
          try {
            (player as any).setActiveForLockScreen(false);
          } catch {
            // Ignore
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
      try {
        (player as any).setActiveForLockScreen(false);
      } catch {
        // Ignore
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

    // soundscape is narrowed to Exclude<SoundscapeType, 'off'> here because
    // audioActive = soundEnabled && soundscape !== 'off', and !audioActive returns above.
    const activateLockScreen = () => {
      try {
        (player as any).setActiveForLockScreen(true, {
          title: 'JustBreatheBro',
          artist: SOUNDSCAPE_DISPLAY_NAMES[soundscape],
        });
      } catch {
        // Ignore if setActiveForLockScreen is not available
      }
    };

    const startPlayback = () => {
      if (cancelled) return;
      try {
        player.seekTo(0);
        player.play();
        activateLockScreen();
      } catch (error) {
        console.error('Failed to start soundscape:', error);
        retryTimer = setTimeout(() => {
          if (cancelled) return;
          try {
            player.seekTo(0);
            player.play();
            activateLockScreen();
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
          try {
            (player as any).setActiveForLockScreen(false);
          } catch {
            // Ignore
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [player, audioActive, soundscape]);

  return { player };
}
