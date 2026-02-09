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
    // Load background image on mount, or set default to first zenscape
    getBackgroundImage().then(async (storedImage) => {
      if (storedImage) {
        setBackgroundImageState(storedImage);
      } else {
        // On first startup, set the first zenscape image as default
        const firstZenscape = '09a7c46feafa016b657ae2b59cfc89c3.jpg';
        await setBackgroundImage(firstZenscape);
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
      '09a7c46feafa016b657ae2b59cfc89c3.jpg': require('../assets/images/BackGrounds/zenscapes/09a7c46feafa016b657ae2b59cfc89c3.jpg'),
      '25ad8d669f24496f38efeb220a94d7d1.jpg': require('../assets/images/BackGrounds/zenscapes/25ad8d669f24496f38efeb220a94d7d1.jpg'),
      '53f9385211ee5c576f8fa058326f479b.jpg': require('../assets/images/BackGrounds/zenscapes/53f9385211ee5c576f8fa058326f479b.jpg'),
      '8b5ab95f17ebce31ce33d4477b0a2394.jpg': require('../assets/images/BackGrounds/zenscapes/8b5ab95f17ebce31ce33d4477b0a2394.jpg'),
      '9c35536ff418ad74cd2e223e0cdbe3aa.jpg': require('../assets/images/BackGrounds/zenscapes/9c35536ff418ad74cd2e223e0cdbe3aa.jpg'),
      'a173ab0f7d9a7427676a776831bc8154.jpg': require('../assets/images/BackGrounds/zenscapes/a173ab0f7d9a7427676a776831bc8154.jpg'),
      'bda498c860d011ed38fe8877fe894261.jpg': require('../assets/images/BackGrounds/zenscapes/bda498c860d011ed38fe8877fe894261.jpg'),
      'kilimanjaro-studioz-jM-Fp4J2xvk-unsplash.jpg': require('../assets/images/BackGrounds/zenscapes/kilimanjaro-studioz-jM-Fp4J2xvk-unsplash.jpg'),
      'masaaki-komori-fzHaSRdAi68-unsplash.jpg': require('../assets/images/BackGrounds/zenscapes/masaaki-komori-fzHaSRdAi68-unsplash.jpg'),
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