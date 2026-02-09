import { useTheme } from '@/components/Theme';
import { useApp } from '@/contexts/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// All wallpaper images from zenscapes folder
const WALLPAPER_IMAGES = [
  { source: require('../assets/images/BackGrounds/zenscapes/09a7c46feafa016b657ae2b59cfc89c3.jpg'), filename: '09a7c46feafa016b657ae2b59cfc89c3.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/25ad8d669f24496f38efeb220a94d7d1.jpg'), filename: '25ad8d669f24496f38efeb220a94d7d1.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/53f9385211ee5c576f8fa058326f479b.jpg'), filename: '53f9385211ee5c576f8fa058326f479b.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/8b5ab95f17ebce31ce33d4477b0a2394.jpg'), filename: '8b5ab95f17ebce31ce33d4477b0a2394.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/9c35536ff418ad74cd2e223e0cdbe3aa.jpg'), filename: '9c35536ff418ad74cd2e223e0cdbe3aa.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/a173ab0f7d9a7427676a776831bc8154.jpg'), filename: 'a173ab0f7d9a7427676a776831bc8154.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/bda498c860d011ed38fe8877fe894261.jpg'), filename: 'bda498c860d011ed38fe8877fe894261.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/kilimanjaro-studioz-jM-Fp4J2xvk-unsplash.jpg'), filename: 'kilimanjaro-studioz-jM-Fp4J2xvk-unsplash.jpg' },
  { source: require('../assets/images/BackGrounds/zenscapes/masaaki-komori-fzHaSRdAi68-unsplash.jpg'), filename: 'masaaki-komori-fzHaSRdAi68-unsplash.jpg' },
];

export default function WallpaperPage() {
  const { tokens } = useTheme();
  const { backgroundImage, setBackgroundImage } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.sceneBackground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      color: tokens.textOnAccent,
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginRight: 40, // Balance the back button
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    contentOverlay: {
      position: 'absolute',
      top: 60, // Match marginTop from index scrollableContent
      left: 0,
      right: 0,
      bottom: 180, // Match marginBottom from index scrollableContent
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      zIndex: 5,
      pointerEvents: 'none',
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
      opacity: 0.8,
    },
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
    },
    selectButtonContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginBottom: 20,
    },
    selectButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    selectButtonText: {
      color: tokens.textOnAccent,
      fontSize: 28,
      fontWeight: '700',
    },
    arrowButton: {
      position: 'absolute',
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 5,
      top: '50%',
      marginTop: -24,
    },
    arrowIcon: {
      color: tokens.textOnAccent,
      fontSize: 48,
      opacity: 0.8,
    },
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: tokens.textOnAccent,
      opacity: 0.3,
    },
    indicatorActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: tokens.textOnAccent,
      opacity: 1,
    },
  });

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(pageIndex);
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleLeftArrow = () => {
    if (currentIndex > 0) {
      scrollToPage(currentIndex - 1);
    }
  };

  const handleRightArrow = () => {
    if (currentIndex < WALLPAPER_IMAGES.length - 1) {
      scrollToPage(currentIndex + 1);
    }
  };

  const handleSelectWallpaper = async () => {
    const selectedImage = WALLPAPER_IMAGES[currentIndex];
    await setBackgroundImage(selectedImage.filename);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={tokens.textOnAccent} />
          </Pressable>
          <Text style={styles.headerTitle}>Choose Wallpaper</Text>
        </View>
      </SafeAreaView>

      {/* Swipeable Wallpapers - Full Screen */}
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Left Arrow */}
        {currentIndex > 0 && (
          <Pressable 
            onPress={handleLeftArrow} 
            style={[styles.arrowButton, { left: 20 }]}
          >
            <Text style={styles.arrowIcon}>‹</Text>
          </Pressable>
        )}

        {/* Right Arrow */}
        {currentIndex < WALLPAPER_IMAGES.length - 1 && (
          <Pressable 
            onPress={handleRightArrow} 
            style={[styles.arrowButton, { right: 20 }]}
          >
            <Text style={styles.arrowIcon}>›</Text>
          </Pressable>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={{ flexDirection: 'row' }}
        >
          {WALLPAPER_IMAGES.map((wallpaper, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={wallpaper.source}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Static Content Overlay */}
        <View style={styles.contentOverlay}>
          <Text style={styles.subtitle}>Relax</Text>
          <Text style={styles.description}>Quiet your mind and relieve stress</Text>
        </View>
      </View>

      {/* Fixed Footer */}
      <View style={styles.footerContainer}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {WALLPAPER_IMAGES.map((_, index) => (
            <View
              key={index}
              style={index === currentIndex ? styles.indicatorActive : styles.indicator}
            />
          ))}
        </View>

        {/* Select Button Container */}
        <View style={styles.selectButtonContainer}>
          <Pressable onPress={handleSelectWallpaper} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
