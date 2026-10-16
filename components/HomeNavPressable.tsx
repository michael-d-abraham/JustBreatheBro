import HomeNavFrostedSurface from "@/components/HomeNavFrostedSurface";
import { useTheme } from "@/components/Theme";
import { homeNavInnerCapsuleWash } from "@/components/homeNavTokens";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  onPress: () => void;
  testID?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: {
    selected?: boolean;
    expanded?: boolean;
    disabled?: boolean;
  };
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  active?: boolean;
  surfaceOverlay?: string;
  borderColor?: string;
  blurIntensity?: number;
  shadowOpacity?: number;
  children: React.ReactNode;
};

/**
 * Frosted nav control — optional inner capsule wash layered above glass
 * (same stack as footer selected tab: glass → activeWash → content).
 */
export default function HomeNavPressable({
  onPress,
  testID,
  accessibilityRole = "button",
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  style,
  borderRadius = 999,
  active = false,
  surfaceOverlay,
  borderColor,
  blurIntensity,
  shadowOpacity,
  children,
}: Props) {
  const { tokens } = useTheme();
  const innerWash = homeNavInnerCapsuleWash(tokens.mode);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        surface: {
          alignItems: "center",
          justifyContent: "center",
        },
        innerCapsule: {
          backgroundColor: innerWash,
        },
        content: {
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        },
        pressed: {
          opacity: 0.88,
        },
      }),
    [innerWash],
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <HomeNavFrostedSurface
        borderRadius={borderRadius}
        surfaceOverlay={surfaceOverlay}
        borderColor={borderColor}
        blurIntensity={blurIntensity}
        shadowOpacity={shadowOpacity}
        style={[styles.surface, style]}
      >
        {active ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.innerCapsule]}
          />
        ) : null}
        <View style={styles.content}>{children}</View>
      </HomeNavFrostedSurface>
    </Pressable>
  );
}
