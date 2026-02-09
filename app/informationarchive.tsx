import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";
import { useTheme } from "../components/Theme";
import { useApp } from "../contexts/themeContext";
import { getResources, InformationResource, ResourceType } from "../lib/informationArchive";

export default function InformationArchiveScreen() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();
  const [resources, setResources] = useState<InformationResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const loadedResources = await getResources();
      setResources(loadedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const getTypeLabel = (type: ResourceType): string => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'book':
        return 'Book';
      case 'video':
        return 'Video';
      default:
        return type;
    }
  };

  const getTypeEmoji = (type: ResourceType): string => {
    switch (type) {
      case 'article':
        return '📄';
      case 'book':
        return '📚';
      case 'video':
        return '🎥';
      default:
        return '📄';
    }
  };

  const renderResource = (resource: InformationResource) => (
    <View key={resource.id} style={{ marginBottom: 24 }}>
      <View style={{ 
        backgroundColor: tokens.surface, 
        borderRadius: 12, 
        padding: 16,
        marginBottom: 12
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: tokens.textOnAccent, 
              fontSize: 20, 
              fontWeight: '700',
              marginBottom: 4
            }}>
              {resource.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ 
                backgroundColor: tokens.accentPrimary + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6
              }}>
                <Text style={{ 
                  color: tokens.accentPrimary, 
                  fontSize: 12, 
                  fontWeight: '600'
                }}>
                  {getTypeEmoji(resource.type)} {getTypeLabel(resource.type)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ 
          color: tokens.textOnAccent, 
          fontSize: 14, 
          lineHeight: 20,
          marginBottom: 12,
          opacity: 0.9
        }}>
          {resource.shortDescription}
        </Text>

        {resource.tags && resource.tags.length > 0 && (
          <View style={{ marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {resource.tags.map((tag, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: tokens.accentPrimary + '10',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: tokens.accentPrimary + '30'
                }}
              >
                <Text style={{ 
                  color: tokens.accentPrimary, 
                  fontSize: 11,
                  fontWeight: '500'
                }}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => handleLinkPress(resource.link)}
          style={{
            backgroundColor: tokens.accentPrimary + '15',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8,
            borderWidth: 1,
            borderColor: tokens.accentPrimary + '30'
          }}
        >
          <Text style={{ 
            color: tokens.accentPrimary, 
            fontSize: 14,
            fontWeight: '600'
          }}>
            Open {getTypeLabel(resource.type)} →
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : tokens.sceneBackground, padding: 12 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={tokens.accentPrimary} />
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 14, 
            marginTop: 12,
            opacity: 0.7
          }}>
            Loading archive...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Information Archive
          </Text>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 16,
            textAlign: 'center',
            opacity: 0.8
          }}>
            Comprehensive guide to breathing practices, techniques, and resources
          </Text>
        </View>

        {/* Resources List */}
        <View>
          {resources.length > 0 ? (
            resources.map(renderResource)
          ) : (
            <View style={{ 
              backgroundColor: tokens.surface, 
              borderRadius: 12, 
              padding: 24,
              alignItems: 'center'
            }}>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 16,
                opacity: 0.7
              }}>
                No resources found
              </Text>
            </View>
          )}
        </View>

        {/* Footer Note */}
        <View style={{ 
          backgroundColor: tokens.surface, 
          borderRadius: 12, 
          padding: 16,
          marginTop: 8,
          marginBottom: 20
        }}>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 12, 
            lineHeight: 18,
            textAlign: 'center',
            opacity: 0.7
          }}>
            This archive is continuously updated with new breathing practices, research, and resources.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
