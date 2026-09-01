import { useTheme as useBaseTheme, ThemeName } from '@/components/Theme';
import { DEFAULT_ZENSCAPE_BACKGROUND_FILENAME, isKnownZenscapeFilename, ZENSCAPE_IMAGE_MAP } from '@/constants/wallpapers';
import {
  getAnimationTheme,
  getAppleHealthConnected,
  getAppleHealthSyncEnabled,
  getBackgroundImage,
  saveAnimationTheme,
  saveAppleHealthConnected,
  saveAppleHealthSyncEnabled,
  saveBackgroundImage,
} from '@/lib/storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ImageBackground, View } from 'react-native';

export type SoundType = 'synth' | 'guzheng' | 'sine' | 'off';
export type SoundscapeType = 'dream' | 'fuzzy' | 'keys' | 'off';

type AppSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  animationsEnabled: boolean;
  backgroundType: 'solid';
  soundType: SoundType;
  soundscape: SoundscapeType;
  animationTheme: ThemeName;
  appleHealthSyncEnabled: boolean;
  appleHealthConnected: boolean;
};

type AppContextType = {
  // App-specific settings
  settings: AppSettings;
  backgroundImage: string | null;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setBackgroundImage: (imagePath: string | null) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleAnimations: () => void;
  setSoundType: (soundType: SoundType) => void;
  setSoundscape: (soundscape: SoundscapeType) => void;
  setAnimationTheme: (theme: ThemeName) => void;
  setAppleHealthSyncEnabled: (enabled: boolean) => Promise<void>;
  setAppleHealthConnected: (connected: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
    animationsEnabled: true,
    backgroundType: 'solid',
    soundType: 'sine',
    soundscape: 'dream',
    animationTheme: 'calm',
    appleHealthSyncEnabled: false,
    appleHealthConnected: false,
  });
  // Start with default zenscape so the first paint matches first-launch storage (no solid flash).
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(
    DEFAULT_ZENSCAPE_BACKGROUND_FILENAME,
  );

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setBackgroundImage = async (imagePath: string | null) => {
    const { saveBackgroundImage } = await import('@/lib/storage');
    await saveBackgroundImage(imagePath);
    setBackgroundImageState(imagePath);
  };

  const setAnimationTheme = async (theme: ThemeName) => {
    setSettings(prev => ({ ...prev, animationTheme: theme }));
    await saveAnimationTheme(theme);
  };

  useEffect(() => {
    let cancelled = false;
    // Load background image on mount; first install or bad legacy value → default zenscape + persist
    (async () => {
      const storedImage = await getBackgroundImage();
      if (cancelled) return;
      if (isKnownZenscapeFilename(storedImage)) {
        setBackgroundImageState(storedImage);
      } else {
        setBackgroundImageState(DEFAULT_ZENSCAPE_BACKGROUND_FILENAME);
        await saveBackgroundImage(DEFAULT_ZENSCAPE_BACKGROUND_FILENAME);
      }
    })();

    // Load animation theme from storage
    getAnimationTheme().then(stored => {
      if (stored) {
        setSettings(prev => ({ ...prev, animationTheme: stored as ThemeName }));
      }
    });

    (async () => {
      const [syncEnabled, connected] = await Promise.all([
        getAppleHealthSyncEnabled(),
        getAppleHealthConnected(),
      ]);
      if (cancelled) return;
      setSettings(prev => ({
        ...prev,
        appleHealthSyncEnabled: syncEnabled,
        appleHealthConnected: connected,
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSound = () => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  const toggleHaptics = () => setSettings(prev => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  const toggleAnimations = () => setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
  const setSoundType = (soundType: SoundType) => setSettings(prev => ({ ...prev, soundType }));
  const setSoundscape = (soundscape: SoundscapeType) => setSettings(prev => ({ ...prev, soundscape }));

  const setAppleHealthSyncEnabled = async (enabled: boolean) => {
    setSettings(prev => ({ ...prev, appleHealthSyncEnabled: enabled }));
    await saveAppleHealthSyncEnabled(enabled);
  };

  const setAppleHealthConnected = async (connected: boolean) => {
    setSettings((prev) => ({
      ...prev,
      appleHealthConnected: connected,
      appleHealthSyncEnabled: connected ? prev.appleHealthSyncEnabled : false,
    }));
    await saveAppleHealthConnected(connected);
    if (!connected) {
      await saveAppleHealthSyncEnabled(false);
    }
  };

  return (
    <AppContext.Provider value={{ 
      settings, 
      backgroundImage,
      updateSettings,
      setBackgroundImage,
      toggleSound,
      toggleHaptics,
      toggleAnimations,
      setSoundType,
      setSoundscape,
      setAnimationTheme,
      setAppleHealthSyncEnabled,
      setAppleHealthConnected,
    }}>
      <ThemedWrapper>
        {children}
      </ThemedWrapper>
    </AppContext.Provider>
  );
};

// Separate component that can safely use theme
const ThemedWrapper = ({ children }: { children: ReactNode }) => {
  const theme = useBaseTheme(); // Safe to call here
  const appContext = useContext(AppContext);
  const backgroundImage = appContext?.backgroundImage || null;
  
  const backgroundStyle = {
    flex: 1,
    backgroundColor: theme.tokens.sceneBackground,
  };

  const resolvedFilename = isKnownZenscapeFilename(backgroundImage)
    ? backgroundImage
    : DEFAULT_ZENSCAPE_BACKGROUND_FILENAME;
  const imageSource = ZENSCAPE_IMAGE_MAP[resolvedFilename];

  if (imageSource != null) {
    return (
      <ImageBackground
        source={imageSource}
        style={backgroundStyle}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={backgroundStyle}>
      {children}
    </View>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppProvider');
  }
  return context;
};