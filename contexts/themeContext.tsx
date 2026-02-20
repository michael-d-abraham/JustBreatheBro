import { useTheme as useBaseTheme } from '@/components/Theme';
import { getBackgroundImage } from '@/lib/storage';
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
  });
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setBackgroundImage = async (imagePath: string | null) => {
    const { saveBackgroundImage } = await import('@/lib/storage');
    await saveBackgroundImage(imagePath);
    setBackgroundImageState(imagePath);
  };

  useEffect(() => {
    // Load background image on mount, or set default zenscape
    getBackgroundImage().then(async (storedImage) => {
      if (storedImage) {
        setBackgroundImageState(storedImage);
      } else {
        // On first startup, set the default zenscape image
        const defaultZenscape = '53f9385211ee5c576f8fa058326f479b.jpg';
        await setBackgroundImage(defaultZenscape);
      }
    });
  }, []);

  const toggleSound = () => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  const toggleHaptics = () => setSettings(prev => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  const toggleAnimations = () => setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
  const setSoundType = (soundType: SoundType) => setSettings(prev => ({ ...prev, soundType }));
  const setSoundscape = (soundscape: SoundscapeType) => setSettings(prev => ({ ...prev, soundscape }));

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
      setSoundscape
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

  if (backgroundImage) {
    // Map image paths to require statements - all images from zenscapes folder
    const imageMap: Record<string, any> = {
      '53f9385211ee5c576f8fa058326f479b.jpg': require('../assets/images/BackGrounds/zenscapes/53f9385211ee5c576f8fa058326f479b.jpg'),
      'a173ab0f7d9a7427676a776831bc8154.jpg': require('../assets/images/BackGrounds/zenscapes/a173ab0f7d9a7427676a776831bc8154.jpg'),
      'bda498c860d011ed38fe8877fe894261.jpg': require('../assets/images/BackGrounds/zenscapes/bda498c860d011ed38fe8877fe894261.jpg'),
    };

    const imageSource = imageMap[backgroundImage];
    
    if (imageSource) {
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
  }
  
  return (
    <View style={backgroundStyle}>
      {children}
    </View>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};