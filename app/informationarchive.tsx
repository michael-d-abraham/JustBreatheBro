import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { useTheme, useWallpaperForeground } from "@/components/Theme";
import { useApp } from "@/contexts/themeContext";
import { getResources, InformationResource, ResourceType } from "@/lib/informationArchive";

/** 6-digit hex + alpha (0–1) for translucent surfaces over wallpaper */
function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const a = Math.min(255, Math.max(0, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${a}`;
}

function typeLabel(type: ResourceType): string {
  switch (type) {
    case "article":
      return "Article";
    case "book":
      return "Book";
    case "video":
      return "Video";
    default:
      return type;
  }
}

const CARD_SURFACE_ALPHA = 0.84;
const CARD_BORDER_ALPHA = 0.55;

export default function InformationArchiveScreen() {
  const { tokens } = useTheme();
  /** Header over scene wallpaper — match index header (always light). */
  const headerLightColor = useWallpaperForeground();
  const { backgroundImage } = useApp();
  const [resources, setResources] = useState<InformationResource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResources = useCallback(async () => {
    try {
      setResources(await getResources());
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const cardBackground = hexWithAlpha(tokens.surface, CARD_SURFACE_ALPHA);
  const cardBorder = hexWithAlpha(tokens.borderSubtle, CARD_BORDER_ALPHA);
  const floatingShadow = Platform.select({
    ios: {
      shadowColor: tokens.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  });

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: backgroundImage ? "transparent" : tokens.sceneBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: {
      color: headerLightColor,
      fontSize: 20,
      fontWeight: "700",
      position: "absolute",
      left: 0,
      right: 0,
      textAlign: "center",
      pointerEvents: "none",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    floatingCard: {
      backgroundColor: cardBackground,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      marginBottom: 12,
      ...floatingShadow,
    },
    intro: {
      color: tokens.textOnAccent,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.82,
      paddingVertical: 14,
      paddingHorizontal: 16,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    rowBody: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      color: tokens.textOnAccent,
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    rowMeta: {
      color: tokens.textOnAccent,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      opacity: 0.45,
      marginTop: 4,
    },
    rowDescription: {
      color: tokens.textOnAccent,
      fontSize: 13,
      lineHeight: 18,
      opacity: 0.72,
      marginTop: 6,
    },
    chevron: {
      opacity: 0.35,
    },
    emptyText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      opacity: 0.7,
      textAlign: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    footerText: {
      color: tokens.textOnAccent,
      fontSize: 12,
      lineHeight: 17,
      textAlign: "center",
      opacity: 0.7,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    loadingBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    loadingCaption: {
      color: tokens.textOnAccent,
      fontSize: 14,
      marginTop: 12,
      opacity: 0.7,
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton
          onPress={() => router.back()}
          iconColor={headerLightColor}
        />
        <Text style={styles.headerTitle}>Information Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={tokens.accentPrimary} />
          <Text style={styles.loadingCaption}>Loading archive…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.floatingCard}>
            <Text style={styles.intro}>
              Practices, techniques, and resources.
            </Text>
          </View>

          {resources.length > 0 ? (
            resources.map((resource) => (
              <Pressable
                key={resource.id}
                onPress={() => Linking.openURL(resource.link)}
                style={({ pressed }) => [
                  styles.floatingCard,
                  pressed && {
                    backgroundColor: hexWithAlpha(tokens.surface, CARD_SURFACE_ALPHA + 0.08),
                  },
                ]}
              >
                <View style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{resource.name}</Text>
                    <Text style={styles.rowMeta}>{typeLabel(resource.type)}</Text>
                    <Text style={styles.rowDescription} numberOfLines={2}>
                      {resource.shortDescription}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={tokens.textOnAccent}
                    style={styles.chevron}
                  />
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.floatingCard}>
              <Text style={styles.emptyText}>No resources yet</Text>
            </View>
          )}

          <View style={[styles.floatingCard, { marginBottom: 0 }]}>
            <Text style={styles.footerText}>
              Updated over time.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
