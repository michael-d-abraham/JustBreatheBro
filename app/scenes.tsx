import BottomSheetAppearancePicker from "@/components/BottomSheetAppearancePicker";
import BottomSheetSoundHapticsPicker from "@/components/BottomSheetSoundHapticsPicker";
import BottomSheetSoundscapePicker from "@/components/BottomSheetSoundscapePicker";
import BottomSheetThemePicker from "@/components/BottomSheetThemePicker";
import { useTheme } from "@/components/Theme";
import { useApp } from "@/contexts/themeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

export default function ScenesScreen() {
  const { tokens } = useTheme();
  const { backgroundImage, setBackgroundImage } = useApp();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bottomSheetBg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      color: tokens.bottomSheetText,
      fontSize: 24,
      fontWeight: "700",
      position: "absolute",
      left: 0,
      right: 0,
      textAlign: "center",
      zIndex: -1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    sectionTitle: {
      color: tokens.bottomSheetText,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      opacity: 0.6,
      marginTop: 24,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: tokens.bottomSheetSeparator,
      marginVertical: 20,
    },
    scenesGallery: {
      flexDirection: "row",
      gap: 16,
      marginTop: 12,
    },
    sceneCard: {
      width: (SCREEN_WIDTH - 72) / 2.5,
      aspectRatio: 0.56,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: "transparent",
    },
    sceneCardSelected: {
      borderColor: tokens.bottomSheetText,
    },
    sceneImage: {
      width: "100%",
      height: "100%",
    },
    sceneCheckmark: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: tokens.bottomSheetText,
      justifyContent: "center",
      alignItems: "center",
    },
    sceneLabel: {
      color: tokens.bottomSheetText,
      fontSize: 15,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 8,
    },
    appearanceSection: {
      flexDirection: "row",
      gap: 16,
      marginTop: 12,
    },
    appearanceSectionSpaced: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 12,
      paddingHorizontal: 32,
    },
    fullExperienceButton: {
      backgroundColor: tokens.bottomSheetText,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 20,
      marginBottom: 8,
    },
    fullExperienceButtonText: {
      color: tokens.bottomSheetBg,
      fontSize: 17,
      fontWeight: "600",
    },
  });

  const handleScenePress = async (filename: string) => {
    await setBackgroundImage(filename);
  };

  const handleFullExperience = () => {
    router.push(`/wallpaper?from=scenes&selected=${backgroundImage}`);
  };

  const handleClosePress = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClosePress} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={tokens.bottomSheetText} />
        </Pressable>
        <Text style={styles.headerTitle}>Scenes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Soundscape Section */}
        <Text style={styles.sectionTitle}>SOUNDSCAPE</Text>
        <View style={styles.appearanceSection}>
          <BottomSheetSoundscapePicker />
        </View>

        <View style={styles.divider} />

        {/* Scenes Gallery */}
        <Text style={styles.sectionTitle}>SCENES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenesGallery}
        >
          {WALLPAPER_IMAGES.map((wallpaper) => {
            const isSelected = backgroundImage === wallpaper.filename;
            return (
              <Pressable
                key={wallpaper.filename}
                onPress={() => handleScenePress(wallpaper.filename)}
              >
                <View
                  style={[
                    styles.sceneCard,
                    isSelected && styles.sceneCardSelected,
                  ]}
                >
                  <Image
                    source={wallpaper.source}
                    style={styles.sceneImage}
                    resizeMode="cover"
                  />
                  {isSelected && (
                    <View style={styles.sceneCheckmark}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={tokens.bottomSheetBg}
                      />
                    </View>
                  )}
                </View>
                <Text style={styles.sceneLabel}>{wallpaper.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Full Experience Button */}
        <Pressable
          style={styles.fullExperienceButton}
          onPress={handleFullExperience}
        >
          <Text style={styles.fullExperienceButtonText}>Full Experience</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Animation Theme Section */}
        <Text style={styles.sectionTitle}>ANIMATION THEME</Text>
        <View style={styles.appearanceSection}>
          <BottomSheetThemePicker />
        </View>

        <View style={styles.divider} />

        {/* Appearance Mode Section */}
        <Text style={styles.sectionTitle}>APPEARANCE MODE</Text>
        <View style={styles.appearanceSectionSpaced}>
          <BottomSheetAppearancePicker />
        </View>

        <View style={styles.divider} />

        {/* Sound & Haptics Section */}
        <Text style={styles.sectionTitle}>SOUND & HAPTICS</Text>
        <View style={{ flexDirection: 'row', marginTop: 4, gap: 8 }}>
          <BottomSheetSoundHapticsPicker />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
