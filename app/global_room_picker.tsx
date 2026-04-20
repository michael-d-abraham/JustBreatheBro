import { useTheme, useWallpaperForeground } from "@/components/Theme";
import { useApp } from "@/contexts/themeContext";
import {
  BREATH_ROOM_CATALOG,
  CanonicalBreathRoomId,
  fetchBreathRoomStats,
} from "@/hooks/useGlobalBreathingRoom";
import { getBreathRoomApiBaseUrl } from "@/lib/breathRoomBackend";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

/** 6-digit hex + alpha (0–1) for translucent surfaces over wallpaper */
function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const a = Math.min(255, Math.max(0, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${a}`;
}

const CARD_SURFACE_ALPHA = 0.84;
const CARD_BORDER_ALPHA = 0.55;

const ROOM_STATS_POLL_MS = 8000;

export default function GlobalRoomPickerPage() {
  const { tokens } = useTheme();
  const wallpaperFg = useWallpaperForeground();
  const { backgroundImage } = useApp();
  const insets = useSafeAreaInsets();
  const apiBase = getBreathRoomApiBaseUrl();

  const [roomCounts, setRoomCounts] = useState<Record<CanonicalBreathRoomId, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!apiBase) return;
    setStatsLoading(true);
    try {
      const next = await fetchBreathRoomStats(apiBase);
      if (next) setRoomCounts(next);
    } finally {
      setStatsLoading(false);
    }
  }, [apiBase]);

  useFocusEffect(
    useCallback(() => {
      if (!apiBase) return undefined;
      void loadStats();
      const id = setInterval(() => void loadStats(), ROOM_STATS_POLL_MS);
      return () => clearInterval(id);
    }, [apiBase, loadStats])
  );

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

  /** Scene / scroll chrome: light on wallpaper (readability), theme primary on solid background. */
  const pageChromeColor = backgroundImage ? wallpaperFg : tokens.textPrimary;

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: backgroundImage ? "transparent" : tokens.sceneBackground,
    },
    headerRow: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backBtn: {
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    backGlyph: {
      color: pageChromeColor,
      fontSize: 28,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    title: {
      color: pageChromeColor,
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      color: pageChromeColor,
      fontSize: 17,
      opacity: 0.85,
      lineHeight: 24,
      marginBottom: 28,
      textAlign: "center",
    },
    options: {},
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    loadingText: {
      color: pageChromeColor,
      fontSize: 15,
      opacity: 0.85,
    },
    card: {
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      opacity: 0.9,
      backgroundColor: cardBackground,
      marginBottom: 12,
      ...floatingShadow,
    },
    cardRoomTitle: {
      color: tokens.textOnAccent,
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
    },
    cardExercise: {
      color: tokens.textOnAccent,
      fontSize: 17,
      fontWeight: "600",
      opacity: 0.95,
      lineHeight: 24,
    },
    cardCountHint: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: "500",
      marginTop: 10,
      opacity: 0.75,
    },
    cardSubtext: {
      color: tokens.textOnAccent,
      fontSize: 14,
      marginTop: 10,
      opacity: 0.8,
      lineHeight: 21,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.headerRow, { paddingTop: insets.top > 0 ? 8 : 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backGlyph}>←</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Breathe Together</Text>
          <Text style={styles.subtitle}>
            Join a shared rhythm. Set an intention, and breathe as one in quiet unison
          </Text>

          <View style={styles.options}>
            {statsLoading && roomCounts === null ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={tokens.accentPrimary} />
                <Text style={styles.loadingText}>Loading room activity…</Text>
              </View>
            ) : null}
            {BREATH_ROOM_CATALOG.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() =>
                  router.push({
                    pathname: "/global_room",
                    params: { room: opt.id },
                  })
                }
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.cardRoomTitle}>{opt.title}</Text>
                <Text style={styles.cardExercise}>
                  {opt.exerciseLine}
                </Text>
                <Text style={styles.cardCountHint}>
                  {roomCounts === null
                    ? statsLoading
                      ? "…"
                      : "—"
                    : `${roomCounts[opt.id]} - Breathing`}
                </Text>
                <Text style={styles.cardSubtext}>{opt.subtext}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
