import { useWallpaperForeground } from "@/components/Theme";
import { useApp } from "@/contexts/themeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// All wallpaper images from zenscapes folder
const WALLPAPER_IMAGES = [
  {
    source: require("../assets/images/BackGrounds/zenscapes/53f9385211ee5c576f8fa058326f479b.jpg"),
    filename: "53f9385211ee5c576f8fa058326f479b.jpg",
    name: "Jasper Lake",
  },
  {
    source: require("../assets/images/BackGrounds/zenscapes/a173ab0f7d9a7427676a776831bc8154.jpg"),
    filename: "a173ab0f7d9a7427676a776831bc8154.jpg",
    name: "Denali",
  },
  {
    source: require("../assets/images/BackGrounds/zenscapes/bda498c860d011ed38fe8877fe894261.jpg"),
    filename: "bda498c860d011ed38fe8877fe894261.jpg",
    name: "Yosemite",
  },
];

export default function WallpaperPage() {
  const wallpaperFg = useWallpaperForeground();
  const { backgroundImage, setBackgroundImage } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromScenes = params.from === "scenes";
  const selectedParam = params.selected as string | undefined;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize to the selected wallpaper or default on mount
  useEffect(() => {
    // If coming from scenes with a selected param, use that
    // Otherwise use the current backgroundImage or default
    const targetFilename =
      selectedParam ||
      backgroundImage ||
      "53f9385211ee5c576f8fa058326f479b.jpg";
    const selectedIndex = WALLPAPER_IMAGES.findIndex(
      (img) => img.filename === targetFilename,
    );

    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex);
      // Small delay to ensure ScrollView is mounted
      const pageWidth = fromScenes ? SCREEN_WIDTH - 40 : SCREEN_WIDTH;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: selectedIndex * pageWidth,
          animated: false,
        });
      }, 100);
    }
  }, [backgroundImage, selectedParam, fromScenes]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: fromScenes
        ? '#FFFFFF'
        : '#FFFFFF',
      padding: fromScenes ? 20 : 0,
    },
    contentWrapper: {
      flex: 1,
      borderRadius: fromScenes ? 24 : 0,
      borderWidth: fromScenes ? 3 : 0,
      borderColor: fromScenes ? '#E5E5EA' : "transparent",
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      color: wallpaperFg,
      fontSize: 20,
      fontWeight: "600",
      textAlign: "center",
      marginRight: 40, // Balance the back button
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      width: fromScenes ? SCREEN_WIDTH - 40 : SCREEN_WIDTH,
      height: fromScenes ? SCREEN_HEIGHT - 40 : SCREEN_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    contentOverlay: {
      position: "absolute",
      top: 60, // Match marginTop from index scrollableContent
      left: 0,
      right: 0,
      bottom: 180, // Match marginBottom from index scrollableContent
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      zIndex: 5,
      pointerEvents: "none",
    },
    subtitle: {
      color: wallpaperFg,
      fontSize: 48,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 16,
    },
    description: {
      color: wallpaperFg,
      fontSize: 18,
      textAlign: "center",
      opacity: 0.8,
    },
    footerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
    },
    selectButtonContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      marginBottom: 20,
    },
    selectButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    selectButtonText: {
      color: wallpaperFg,
      fontSize: 28,
      fontWeight: "700",
    },
    arrowButton: {
      position: "absolute",
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 5,
      top: "50%",
      marginTop: -24,
    },
    arrowIcon: {
      color: wallpaperFg,
      fontSize: 48,
      opacity: 0.8,
    },
    indicatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      gap: 8,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: wallpaperFg,
      opacity: 0.3,
    },
    indicatorActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: wallpaperFg,
      opacity: 1,
    },
    selectedBadge: {
      position: "absolute",
      top: 100,
      right: 24,
      backgroundColor: '#6B5BD0',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      zIndex: 10,
    },
    selectedBadgeText: {
      color: wallpaperFg,
      fontSize: 14,
      fontWeight: "600",
    },
  });

  const handleScroll = (event: any) => {
    const pageWidth = fromScenes ? SCREEN_WIDTH - 40 : SCREEN_WIDTH;
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / pageWidth);
    setCurrentIndex(pageIndex);
  };

  const scrollToPage = (index: number) => {
    const pageWidth = fromScenes ? SCREEN_WIDTH - 40 : SCREEN_WIDTH;
    scrollViewRef.current?.scrollTo({
      x: index * pageWidth,
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

    // If coming from scenes, stay in the wallpaper flow
    // Otherwise, navigate back to previous screen
    if (!fromScenes) {
      router.back();
    }
  };

  const currentWallpaper = WALLPAPER_IMAGES[currentIndex];
  const isCurrentSelected = backgroundImage === currentWallpaper.filename;

  const handleBackPress = () => {
    if (fromScenes) {
      router.push("/scenes");
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <SafeAreaView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <View style={styles.header}>
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={wallpaperFg}
              />
            </Pressable>
            <Text style={styles.headerTitle}>
              {fromScenes ? currentWallpaper.name : "Choose Wallpaper"}
            </Text>
          </View>
        </SafeAreaView>

        {/* Swipeable Wallpapers - Full Screen */}
        <View style={{ flex: 1, position: "relative" }}>
          {/* Selected Badge */}
          {isCurrentSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Selected ✓</Text>
            </View>
          )}

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
            contentContainerStyle={{ flexDirection: "row" }}
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

          {/* Static Content Overlay - Only show when not from scenes */}
          {!fromScenes && (
            <View style={styles.contentOverlay}>
              <Text style={styles.subtitle}>Relax</Text>
              <Text style={styles.description}>
                Quiet your mind and relieve stress
              </Text>
            </View>
          )}
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerContainer}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {WALLPAPER_IMAGES.map((_, index) => (
              <View
                key={index}
                style={
                  index === currentIndex
                    ? styles.indicatorActive
                    : styles.indicator
                }
              />
            ))}
          </View>

          {/* Select Button Container */}
          <View style={styles.selectButtonContainer}>
            <Pressable
              onPress={handleSelectWallpaper}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {isCurrentSelected ? "Selected ✓" : "Select"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
