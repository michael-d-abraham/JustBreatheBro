import { useWallpaperForeground } from "@/components/Theme";
import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

interface BreathingControlsProps {
  isRunning: boolean;
  isUIVisible: boolean;
  animatedStyle: StyleProp<ViewStyle>;
  onSettingsPress: () => void;
  onPlayPause: () => void;
  onStopPress: () => void;
}

export default function BreathingControls({
  isRunning,
  isUIVisible,
  animatedStyle,
  onSettingsPress,
  onPlayPause,
  onStopPress,
}: BreathingControlsProps) {
  const wallpaperFg = useWallpaperForeground();

  return (
    <Animated.View style={[
      { 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        paddingBottom: 50,
        paddingHorizontal: 24,
        pointerEvents: isUIVisible ? 'auto' : 'none',
      },
      animatedStyle
    ]}>
      {/* Settings Button - Left */}
      <Pressable
        onPress={onSettingsPress}
        style={{
          width: 80,
          height: 80,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons 
          name="options" 
          size={38} 
          color={wallpaperFg} 
        />
      </Pressable>
      
      {/* Play/Pause Button - Middle */}
      <Pressable
        testID="breathing.pause-button"
        accessibilityLabel={isRunning ? "Pause" : "Resume"}
        onPress={onPlayPause}
        style={{
          width: 70,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isRunning ? (
          <Ionicons 
            name="pause" 
            size={38} 
            color={wallpaperFg} 
          />
        ) : (
          <Ionicons 
            name="play" 
            size={38} 
            color={wallpaperFg} 
          />
        )}
      </Pressable>
      
      {/* Stop Button - Right */}
      <Pressable
        testID="breathing.stop-button"
        accessibilityLabel="Stop"
        onPress={onStopPress}
        style={{
          width: 70,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons 
          name="stop" 
          size={38} 
          color={wallpaperFg} 
        />
      </Pressable>
    </Animated.View>
  );
}
