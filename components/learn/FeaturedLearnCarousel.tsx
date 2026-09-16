import FeaturedLearnCard from "@/components/learn/FeaturedLearnCard";
import {
  getFeaturedCardHeight,
  getFeaturedCardWidth,
  getFeaturedSnapInterval,
  LEARN_TAB,
} from "@/components/learn/learnTabTokens";
import { LearnPost } from "@/lib/learnContent";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

type Props = {
  posts: LearnPost[];
  onPostPress: (post: LearnPost) => void;
};

export default function FeaturedLearnCarousel({ posts, onPostPress }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = useMemo(
    () => getFeaturedCardWidth(screenWidth),
    [screenWidth],
  );
  const cardHeight = getFeaturedCardHeight(cardWidth);
  const snapInterval = getFeaturedSnapInterval(cardWidth);

  if (posts.length === 0) {
    return null;
  }

  return (
    <FlatList
      horizontal
      data={posts}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={snapInterval}
      nestedScrollEnabled
      renderItem={({ item }) => (
        <FeaturedLearnCard
          post={item}
          width={cardWidth}
          height={cardHeight}
          onPress={() => onPostPress(item)}
          testID={`learn.featured-${item.id}`}
        />
      )}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: LEARN_TAB.cardGap,
    paddingRight: LEARN_TAB.pagePadding,
  },
});
