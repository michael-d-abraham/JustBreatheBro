import { router, Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";
import SettingsSection from "../components/SettingsSection";
import { useTheme } from "../components/Theme";
import { useApp } from "../contexts/themeContext";

export default function SupportScreen() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();

  const handleYouTubePress = () => {
    Linking.openURL('https://www.youtube.com/watch?v=8WPaO819-_g');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground, padding: 12 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <BackButton onPress={() => router.back()} />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          gap: 15, 
          paddingVertical: 20,
          paddingHorizontal: 12
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 32, 
            fontWeight: '700',
            marginBottom: 8
          }}>
            Support
          </Text>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 16,
            textAlign: 'center'
          }}>
            Breath through your nose homie
          </Text>
        </View>

        {/* About Section */}
        <SettingsSection title="About Breath">
          <View style={{ 
            backgroundColor: tokens.surface, 
            borderRadius: 12, 
            padding: 16 
          }}>
            <Text style={{ 
              color: tokens.textOnAccent, 
              fontSize: 14, 
              lineHeight: 22 
            }}>
              Breathing is cool. All the cool kids do it. 
            </Text>
            <Text style={{ 
              color: tokens.textOnAccent, 
              fontSize: 12, 
              marginTop: 12 
            }}>
              Version 1.0.0
            </Text>
          </View>
        </SettingsSection>

        {/* Contact Section */}
        <SettingsSection title="Get In Touch">
          <Pressable
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onPress={handleYouTubePress}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 16, 
                fontWeight: '600' 
              }}>
                📧 Email Support
              </Text>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 12, 
                marginTop: 4,
                opacity: 0.8
              }}>
                hello@breathbro.app
              </Text>
            </View>
            <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>→</Text>
          </Pressable>
        </SettingsSection>

        {/* Feedback Section */}
        <SettingsSection title="We'd Love Your Feedback">
          <Pressable
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onPress={handleYouTubePress}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 16, 
                fontWeight: '600' 
              }}>
                Send Feedback
              </Text>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 12, 
                marginTop: 4,
                opacity: 0.8,
              }}>
                Help us improve by sharing your thoughts
              </Text>
            </View>
            <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>→</Text>
          </Pressable>
        </SettingsSection>

        {/* Legal Section */}
        <SettingsSection title="Legal">
          <View style={{ gap: 12 }}>
            <Pressable
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onPress={handleYouTubePress}
            >
              <Text style={{ color: tokens.textOnAccent, fontSize: 16 }}>
                Privacy Policy
              </Text>
              <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>
                →
              </Text>
            </Pressable>

            <Pressable
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onPress={handleYouTubePress}
            >
              <Text style={{ color: tokens.textOnAccent, fontSize: 16 }}>
                Terms of Service
              </Text>
              <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>
                →
              </Text>
            </Pressable>
          </View>
        </SettingsSection>

      </ScrollView>
    </SafeAreaView>
  );
}

