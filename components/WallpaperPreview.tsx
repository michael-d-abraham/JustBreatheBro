import { useTheme } from "@/components/Theme";
import { WallpaperImage } from "@/constants/wallpapers";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  wallpaper: WallpaperImage;
  isSelected: boolean;
  onPress: () => void;
};

export default function WallpaperPreview({
  wallpaper,
  isSelected,
  onPress,
}: Props) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
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
  });

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.sceneCard, isSelected && styles.sceneCardSelected]}>
        <Image
          source={wallpaper.source}
          style={styles.sceneImage}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.sceneCheckmark}>
            <Ionicons name="checkmark" size={18} color={tokens.bottomSheetBg} />
          </View>
        )}
      </View>
      <Text style={styles.sceneLabel}>{wallpaper.name}</Text>
    </Pressable>
  );
}
