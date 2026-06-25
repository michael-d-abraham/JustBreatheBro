import { router } from 'expo-router';
import React from "react";
import { Pressable, Text } from "react-native";

import { useTheme } from "@/components/Theme";

interface StartButtonProps {
  onPress?: () => void;
  path?: string;
  children: React.ReactNode;
}

const StartButton = ({ onPress, path, children }: StartButtonProps) => {
    const { tokens } = useTheme(); 

    const handlePress = () => {
        if (path) {
            router.push(path as any);
        } else if (onPress) {
            onPress();
        }
    };

    return(
        <Pressable
            style={{
                backgroundColor: tokens.accentPrimary,
                borderRadius: 8, 
                paddingHorizontal: 20,
                marginVertical: 5, // Add some spacing between buttons
            }}
            onPress={handlePress}>
            <Text style={{
                color: tokens.textOnAccent,
                fontSize: 20, 
                padding: 10
            }}>
                {children}
            </Text>
        </Pressable>
    )
}

export default StartButton;
