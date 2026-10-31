import FeaturedLearnCarousel from "@/components/learn/FeaturedLearnCarousel";
import LearnGlassPanel from "@/components/learn/LearnGlassPanel";
import LearnPostRow from "@/components/learn/LearnPostRow";
import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import { useLearnChromeColors } from "@/components/learn/useLearnChromeColors";
import { useLearnResources } from "@/components/learn/useLearnResources";
import {
  getFeaturedPosts,
  getMoreVideoWalkthroughPosts,
  LearnPost,
} from "@/lib/learnContent";
import React, { useMemo } from "react";
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
};

/** Home pager tab: guided videos from the information archive. */
export default function VideoWalkthroughsTabContent({ bottomInset = 24 }: Props) {
  const colors = useLearnChromeColors("tab");
  const { resources, loading } = useLearnResources();

  const featuredPosts = useMemo(
    () => getFeaturedPosts(resources),
    [resources],
  );

  const moreVideos = useMemo(() => {
    const featuredIds = new Set(featuredPosts.map((post) => post.id));
    return getMoreVideoWalkthroughPosts(resources, featuredIds);
  }, [featuredPosts, resources]);

  const handlePostPress = (post: LearnPost) => {
    Linking.openURL(post.link).catch((error) => {
      console.error("Error opening video link:", error);
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

  const hasVideos = featuredPosts.length > 0 || moreVideos.length > 0;

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
        {hasVideos ? (
          <>
            {featuredPosts.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.sectionHeading}>Video walkthroughs</Text>
                <FeaturedLearnCarousel
                  posts={featuredPosts}
                  onPostPress={handlePostPress}
                />
              </View>
            ) : null}

            {moreVideos.length > 0 ? (
              <View style={styles.block}>
                {featuredPosts.length === 0 ? (
                  <Text style={styles.sectionHeading}>Video walkthroughs</Text>
                ) : (
                  <Text style={styles.sectionHeading}>More</Text>
                )}
                <LearnGlassPanel contentStyle={{ paddingVertical: 0 }}>
                  {moreVideos.map((post, index) => (
                    <LearnPostRow
                      key={post.id}
                      post={post}
                      onPress={() => handlePostPress(post)}
                      showDivider={index < moreVideos.length - 1}
                      testID={`learn.video-${post.id}`}
                    />
                  ))}
                </LearnGlassPanel>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.emptyText}>No video walkthroughs yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}
