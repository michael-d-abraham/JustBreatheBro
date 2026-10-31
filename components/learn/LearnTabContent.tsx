import FeaturedLearnCarousel from "@/components/learn/FeaturedLearnCarousel";
import LearnGlassPanel from "@/components/learn/LearnGlassPanel";
import LearnPostRow from "@/components/learn/LearnPostRow";
import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { useLearnChromeColors } from "@/components/learn/useLearnChromeColors";
import { getFeaturedPosts, getLatestPosts, LearnPost } from "@/lib/learnContent";
import { getResources, InformationResource } from "@/lib/informationArchive";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  bottomInset?: number;
  variant?: "tab" | "sheet";
};

export default function LearnTabContent({
  bottomInset = 24,
  variant = "tab",
}: Props) {
  const colors = useLearnChromeColors(variant);
  const [resources, setResources] = useState<InformationResource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResources = useCallback(async () => {
    try {
      setResources(await getResources());
    } catch (error) {
      console.error("Error loading Learn content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const featuredPosts = useMemo(
    () => getFeaturedPosts(resources),
    [resources],
  );

  const latestPosts = useMemo(() => {
    const featuredIds = new Set(featuredPosts.map((post) => post.id));
    return getLatestPosts(resources, featuredIds);
  }, [featuredPosts, resources]);

  const handlePostPress = (post: LearnPost) => {
    Linking.openURL(post.link).catch((error) => {
      console.error("Error opening Learn link:", error);
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: "transparent",
        },
        scroll: {
          flex: 1,
          backgroundColor: "transparent",
        },
        scrollContent: {
          paddingHorizontal: LEARN_TAB.pagePadding,
          paddingTop: 8,
          gap: LEARN_TAB.sectionGap,
        },
        block: {
          gap: LEARN_TAB.blockGap,
        },
        articleList: {
          gap: LEARN_TAB.articleCardGap,
        },
        sectionHeading: {
          color: colors.onWallpaper,
          fontSize: LEARN_TAB.sectionHeadingSize,
          fontWeight: LEARN_TAB.sectionHeadingWeight,
          letterSpacing: -0.3,
        },
        emptyText: {
          color: colors.onWallpaper,
          fontSize: 15,
          lineHeight: 21,
          paddingVertical: 8,
          opacity: colors.onWallpaperMutedOpacity,
        },
        loadingBox: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: "transparent",
        },
        loadingCaption: {
          color: colors.onWallpaper,
          fontSize: 15,
          marginTop: 12,
          opacity: colors.onWallpaperMutedOpacity,
        },
      }),
    [colors.onWallpaper, colors.onWallpaperMutedOpacity],
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingBox]}>
        <ActivityIndicator size="large" color={colors.onWallpaper} />
        <Text style={styles.loadingCaption}>Loading…</Text>
      </View>
    );
  }

  const hasContent = resources.length > 0;

  const body = hasContent ? (
    <>
      {featuredPosts.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <FeaturedLearnCarousel
            posts={featuredPosts}
            onPostPress={handlePostPress}
          />
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.sectionHeading}>Articles</Text>
        {latestPosts.length > 0 ? (
          <View style={styles.articleList}>
            {latestPosts.map((post) => (
              <LearnGlassPanel key={post.id} contentStyle={{ paddingVertical: 0 }}>
                <LearnPostRow
                  post={post}
                  onPress={() => handlePostPress(post)}
                  showDivider={false}
                  articleCard
                  testID={`learn.post-${post.id}`}
                />
              </LearnGlassPanel>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nothing here yet.</Text>
        )}
      </View>
    </>
  ) : (
    <Text style={styles.emptyText}>No Learn content yet.</Text>
  );

  if (variant === "sheet") {
    return (
      <View style={[styles.scrollContent, { paddingBottom: bottomInset }]}>
        {body}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {body}
      </ScrollView>
    </View>
  );
}
