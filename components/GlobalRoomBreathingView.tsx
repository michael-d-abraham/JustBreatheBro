import {
  useBreathingAnimationTokens,
  useWallpaperForeground,
} from "@/components/Theme";
import { GlobalRoomPhase } from "@/hooks/useGlobalBreathingRoom";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function phaseLabel(phase: GlobalRoomPhase | null): string {
  if (!phase) return "";
  if (phase === "inhale") return "Inhale";
  if (phase === "exhale") return "Exhale";
  return "Hold";
}

type Props = {
  phase: GlobalRoomPhase | null;
  radius: SharedValue<number>;
  strokeWidth: SharedValue<number>;
  remainingMs: number;
  onScreenTap: () => void;
};

export default function GlobalRoomBreathingView({
  phase,
  radius,
  strokeWidth,
  remainingMs,
  onScreenTap,
}: Props) {
  const breathingAnim = useBreathingAnimationTokens();
  const wallpaperFg = useWallpaperForeground();

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
    strokeWidth: strokeWidth.value,
  }));

  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return (
    <Pressable
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      onPress={onScreenTap}
    >
      <View style={{ alignItems: "center", position: "relative" }}>
        <Svg width={400} height={400}>
          <Circle
            cx={200}
            cy={200}
            r={180}
            stroke={breathingAnim.guideOuterStroke}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
          <Circle
            cx={200}
            cy={200}
            r={65}
            stroke={breathingAnim.guideInnerStroke}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
          <AnimatedCircle
            cx={200}
            cy={200}
            animatedProps={animatedProps}
            stroke={breathingAnim.mainStroke}
            fill={breathingAnim.mainFill}
            strokeLinecap="round"
            opacity={0.8}
          />
        </Svg>

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: wallpaperFg,
              fontSize: 32,
              fontWeight: "300",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {phaseLabel(phase)}
          </Text>
          <Text
            style={{
              color: wallpaperFg,
              fontSize: 20,
              fontWeight: "500",
              marginTop: 12,
              opacity: 0.85,
            }}
          >
            {displaySeconds}s
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
