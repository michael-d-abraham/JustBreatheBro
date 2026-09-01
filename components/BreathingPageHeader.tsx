import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWallpaperForeground } from "./Theme";

type Props = {
  onScenesPress: () => void;
  onSupportPress: () => void;
};

/**
 * Home header — scenes (tulip) left; ⋮ opens Support directly.
 * One Breath / Benefits live on the home pager pages.
 */
export default function BreathingPageHeader({
  onScenesPress,
  onSupportPress,
}: Props) {
  const headerContentColor = useWallpaperForeground();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    leftHeaderIcon: {
      width: 28,
      height: 28,
      tintColor: headerContentColor,
    },
    moreIcon: {
      width: 28,
      height: 28,
      tintColor: headerContentColor,
    },
  });

  return (
    <>
      <Pressable
        testID="home.scenes-button"
        accessibilityLabel="Scenes"
        onPress={onScenesPress}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          padding: 8,
          zIndex: 10,
        }}
      >
        <Image
          source={require("../assets/icons/tulip.png")}
          style={styles.leftHeaderIcon}
          resizeMode="contain"
        />
      </Pressable>

      <Pressable
        accessibilityLabel="Settings"
        onPress={onSupportPress}
        style={{
          position: "absolute",
          top: insets.top + 8,
          right: 16,
          padding: 8,
          zIndex: 10,
        }}
      >
        <Image
          source={require("../assets/icons/more.png")}
          style={styles.moreIcon}
          resizeMode="contain"
        />
      </Pressable>
    </>
  );
}
