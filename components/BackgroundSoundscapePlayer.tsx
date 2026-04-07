import { useApp } from "@/contexts/themeContext";
import { useBackgroundSoundscape } from "@/hooks/useBackgroundSoundscape";

/**
 * Component that manages background soundscape playback throughout the app
 * Plays continuously in a loop and switches when soundscape changes in settings
 */
export default function BackgroundSoundscapePlayer() {
  const { settings } = useApp();
  useBackgroundSoundscape({
    soundscape: settings.soundscape,
    soundEnabled: settings.soundEnabled,
  });

  // This component doesn't render anything - the hook handles everything
  return null;
}

