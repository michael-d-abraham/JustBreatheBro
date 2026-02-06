import { router, Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";
import { useTheme } from "../components/Theme";
import { useApp } from "../contexts/themeContext";

interface ArchiveItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  benefits: string[];
  method: string;
  links?: {
    articles?: string[];
    books?: string[];
    videos?: string[];
  };
}

// Filler data for the information archive
const ARCHIVE_DATA: ArchiveItem[] = [
  {
    id: '1',
    title: 'Box Breathing',
    category: 'Calming',
    summary: 'A simple breathing technique that helps reduce stress and improve focus by breathing in a square pattern.',
    benefits: [
      'Reduces stress and anxiety',
      'Improves concentration',
      'Helps regulate the nervous system',
      'Can be done anywhere, anytime'
    ],
    method: 'Inhale for 4 counts, hold for 4 counts, exhale for 4 counts, hold for 4 counts. Repeat.',
    links: {
      articles: ['https://example.com/box-breathing-guide'],
      videos: ['https://example.com/box-breathing-tutorial']
    }
  },
  {
    id: '2',
    title: '4-7-8 Breathing',
    category: 'Relaxation',
    summary: 'A breathing technique developed by Dr. Andrew Weil that promotes relaxation and better sleep.',
    benefits: [
      'Promotes deep relaxation',
      'Helps with sleep disorders',
      'Reduces anxiety',
      'Improves digestion'
    ],
    method: 'Inhale through your nose for 4 counts, hold for 7 counts, exhale through your mouth for 8 counts. Repeat 4 times.',
    links: {
      articles: ['https://example.com/478-breathing'],
      books: ['The Breathing Book by Dr. Andrew Weil']
    }
  },
  {
    id: '3',
    title: 'Alternate Nostril Breathing',
    category: 'Balance',
    summary: 'A yogic breathing practice that balances the left and right hemispheres of the brain.',
    benefits: [
      'Balances the nervous system',
      'Improves focus and clarity',
      'Reduces stress',
      'Enhances respiratory function'
    ],
    method: 'Close right nostril, inhale through left. Close left nostril, exhale through right. Inhale through right, close it, exhale through left. Repeat.',
    links: {
      articles: ['https://example.com/nadi-shodhana'],
      videos: ['https://example.com/alternate-nostril-demo']
    }
  },
  {
    id: '4',
    title: 'Diaphragmatic Breathing',
    category: 'Foundation',
    summary: 'Also known as belly breathing, this is the foundation of all breathing practices.',
    benefits: [
      'Strengthens the diaphragm',
      'Improves oxygen exchange',
      'Reduces blood pressure',
      'Decreases stress hormones'
    ],
    method: 'Place one hand on your chest and one on your belly. Breathe in through your nose, letting your belly rise. Exhale slowly through your mouth.',
    links: {
      articles: ['https://example.com/diaphragmatic-breathing'],
      books: ['Breath by James Nestor']
    }
  },
  {
    id: '5',
    title: 'Wim Hof Method',
    category: 'Energizing',
    summary: 'A combination of breathing exercises, cold exposure, and meditation developed by Wim Hof.',
    benefits: [
      'Increases energy levels',
      'Boosts immune system',
      'Improves mental clarity',
      'Enhances physical performance'
    ],
    method: 'Take 30-40 deep breaths, then exhale and hold for as long as comfortable. Inhale deeply and hold for 15 seconds. Repeat 3-4 rounds.',
    links: {
      articles: ['https://example.com/wim-hof-method'],
      videos: ['https://example.com/wim-hof-tutorial'],
      books: ['The Wim Hof Method by Wim Hof']
    }
  },
  {
    id: '6',
    title: 'Coherent Breathing',
    category: 'Harmony',
    summary: 'A breathing technique that synchronizes heart rate variability for optimal coherence.',
    benefits: [
      'Improves heart rate variability',
      'Reduces stress',
      'Enhances emotional regulation',
      'Promotes overall well-being'
    ],
    method: 'Breathe at a rate of 5-6 breaths per minute (5 seconds in, 5 seconds out). Maintain this rhythm for 10-20 minutes.',
    links: {
      articles: ['https://example.com/coherent-breathing'],
      books: ['The Healing Power of the Breath by Richard Brown']
    }
  }
];

export default function InformationArchiveScreen() {
  const { tokens } = useTheme();
  const { backgroundImage } = useApp();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const renderArchiveItem = (item: ArchiveItem) => (
    <View key={item.id} style={{ marginBottom: 24 }}>
      <View style={{ 
        backgroundColor: tokens.surface, 
        borderRadius: 12, 
        padding: 16,
        marginBottom: 12
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 20, 
            fontWeight: '700',
            flex: 1
          }}>
            {item.title}
          </Text>
          <View style={{ 
            backgroundColor: tokens.accentPrimary + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            marginLeft: 8
          }}>
            <Text style={{ 
              color: tokens.accentPrimary, 
              fontSize: 12, 
              fontWeight: '600'
            }}>
              {item.category}
            </Text>
          </View>
        </View>

        <Text style={{ 
          color: tokens.textOnAccent, 
          fontSize: 14, 
          lineHeight: 20,
          marginBottom: 12,
          opacity: 0.9
        }}>
          {item.summary}
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 14, 
            fontWeight: '600',
            marginBottom: 6
          }}>
            Benefits:
          </Text>
          {item.benefits.map((benefit, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: tokens.accentPrimary, marginRight: 8 }}>•</Text>
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 13, 
                lineHeight: 18,
                flex: 1,
                opacity: 0.85
              }}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 14, 
            fontWeight: '600',
            marginBottom: 6
          }}>
            Method:
          </Text>
          <Text style={{ 
            color: tokens.textOnAccent, 
            fontSize: 13, 
            lineHeight: 18,
            opacity: 0.85
          }}>
            {item.method}
          </Text>
        </View>

        {item.links && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.textOnAccent + '20' }}>
            {item.links.articles && item.links.articles.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  fontWeight: '600',
                  marginBottom: 4,
                  opacity: 0.7
                }}>
                  Articles:
                </Text>
                {item.links.articles.map((article, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleLinkPress(article)}
                    style={{ marginBottom: 4 }}
                  >
                    <Text style={{ 
                      color: tokens.accentPrimary, 
                      fontSize: 13,
                      textDecorationLine: 'underline'
                    }}>
                      {article}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {item.links.books && item.links.books.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  fontWeight: '600',
                  marginBottom: 4,
                  opacity: 0.7
                }}>
                  Books:
                </Text>
                {item.links.books.map((book, index) => (
                  <Text key={index} style={{ 
                    color: tokens.textOnAccent, 
                    fontSize: 13,
                    marginBottom: 4,
                    opacity: 0.85
                  }}>
                    📚 {book}
                  </Text>
                ))}
              </View>
            )}

            {item.links.videos && item.links.videos.length > 0 && (
              <View>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  fontWeight: '600',
                  marginBottom: 4,
                  opacity: 0.7
                }}>
                  Videos:
                </Text>
                {item.links.videos.map((video, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleLinkPress(video)}
                    style={{ marginBottom: 4 }}
                  >
                    <Text style={{ 
                      color: tokens.accentPrimary, 
                      fontSize: 13,
                      textDecorationLine: 'underline'
                    }}>
                      {video}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

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

        {/* Archive Items */}
        <View>
          {ARCHIVE_DATA.map(renderArchiveItem)}
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
