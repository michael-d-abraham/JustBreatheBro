import { useBreathingAnimationTokens, useWallpaperForeground } from "@/components/Theme";
import { BreathingPhase } from "@/hooks/useBreathingCycle";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BreathingRingProps {
  phase: BreathingPhase;
  radius: SharedValue<number>;
  strokeWidth: SharedValue<number>;
  onInnerPress: () => void;
}

export default function BreathingRing({
  phase,
  radius,
  strokeWidth,
  onInnerPress,
}: BreathingRingProps) {
  const breathingAnim = useBreathingAnimationTokens();
  const wallpaperFg = useWallpaperForeground();

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
    strokeWidth: strokeWidth.value,
  }));

  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <Svg width={400} height={400}>
        {/* Outer circle */}
        <Circle cx={200} cy={200} r={180} stroke={breathingAnim.guideOuterStroke} strokeWidth={1} fill="none" opacity={0.6} />
        {/* Middle circle */}
        <Circle cx={200} cy={200} r={65} stroke={breathingAnim.guideInnerStroke} strokeWidth={1} fill="none" opacity={0.6} />
        {/* Inner animated circle */}
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
      
      {/* Phase text overlay */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ 
          color: wallpaperFg, 
          fontSize: 32, 
          fontWeight: '300',
          letterSpacing: 2,
          textTransform: 'uppercase'
        }}>
          {phase === 'inhale' ? 'Inhale' : 
           phase === 'hold1' ? 'Hold' : 
           phase === 'exhale' ? 'Exhale' : 
           phase === 'hold2' ? 'Hold' : ''}
        </Text>
      </View>
      
      {/* Inner circle tap area - only the small inner circle is tappable */}
      <Pressable 
        onPress={onInnerPress}
        style={{
          position: 'absolute',
          width: 140, // Slightly larger than minimum inner circle (radius 66 = diameter 132) for easier tapping
          height: 140,
          borderRadius: 70,
          top: '50%',
          left: '50%',
          marginTop: -70, // Center the pressable (half of height)
          marginLeft: -70, // Center the pressable (half of width)
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </View>
  );
}
