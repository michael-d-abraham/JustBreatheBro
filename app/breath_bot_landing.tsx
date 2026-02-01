import { useTheme } from '@/components/Theme';
import { useApp } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BreathBotLanding() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: tokens.textOnAccent,
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      color: tokens.textOnAccent,
      fontSize: 18,
      textAlign: 'center',
      opacity: 0.8,
    },
    backIcon: {
      fontSize: 32,
      color: tokens.textOnAccent,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button - Top Left */}
      <Pressable 
        onPress={() => router.back()} 
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          padding: 8,
          zIndex: 10,
        }}
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Breath Bot</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}
