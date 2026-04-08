import React, { RefObject, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SupportSheetHandle } from "./SupportSheet";
import { useWallpaperForeground } from "./Theme";

interface BreathingPageHeaderProps {
  supportSheetRef: RefObject<SupportSheetHandle | null>;
  onSupportPress: () => void;
  onCirclePress?: () => void;
  onInfoLibraryPress?: () => void;
}

export default function BreathingPageHeader({
  supportSheetRef,
  onSupportPress,
  onCirclePress,
  onInfoLibraryPress,
}: BreathingPageHeaderProps) {
  /** Always light — header sits on scene wallpapers (index / calm / energize). */
  const headerContentColor = useWallpaperForeground();
  const insets = useSafeAreaInsets();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    dropdown: {
      position: "absolute",
      top: insets.top + 48,
      right: 16,
      minWidth: 120,
      zIndex: 20,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    dropdownItemLast: {},
    dropdownItemText: {
      color: headerContentColor,
      fontSize: 16,
      fontWeight: "500",
    },
  });

  const handleHeartPress = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemPress = (item: "Love" | "Benefits" | "Support") => {
    setIsDropdownOpen(false);
    if (item === "Support") {
      onSupportPress();
    } else if (item === "Benefits" && onInfoLibraryPress) {
      onInfoLibraryPress();
    }
    // Love can be handled later if needed
  };

  return (
    <>
      {/* Backdrop to close dropdown when tapping outside */}
      {isDropdownOpen && (
        <Pressable
          onPress={() => setIsDropdownOpen(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 15,
          }}
        />
      )}

      {/* Flower — Top Left (e.g. scenes / appearance) */}
      <Pressable
        onPress={onCirclePress || onSupportPress}
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

      {/* Menu (more) — Top Right */}
      <Pressable
        onPress={handleHeartPress}
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

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <View style={styles.dropdown}>
          <Pressable
            onPress={() => handleMenuItemPress("Love")}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownItemText}>Love</Text>
          </Pressable>
          <Pressable
            onPress={() => handleMenuItemPress("Benefits")}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownItemText}>Benefits</Text>
          </Pressable>
          <Pressable
            onPress={() => handleMenuItemPress("Support")}
            style={[styles.dropdownItem, styles.dropdownItemLast]}
          >
            <Text style={styles.dropdownItemText}>Support</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
