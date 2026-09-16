/** Editorial Learn tab layout tokens — light iOS-style content discovery. */
export const LEARN_TAB = {
  pagePadding: 24,
  sectionGap: 32,
  blockGap: 16,
  cardGap: 10,
  cardRadius: 18,
  sectionHeadingSize: 22,
  sectionHeadingWeight: "600" as const,
  eyebrowSize: 11,
  eyebrowWeight: "600" as const,
  eyebrowLetterSpacing: 0.6,
  postTitleSize: 17,
  postTitleWeight: "600" as const,
  postSubtitleSize: 14,
  featuredAspectRatio: 1.15,
  featuredTitleSize: 15,
  featuredTitleLineHeight: 19,
  featuredContentInset: 10,
  /** ~2+ cards visible with intentional peek */
  featuredVisibleCount: 2.35,
  thumbnailSize: 72,
  thumbnailRadius: 12,
  rowMinHeight: 44,
  panelRadius: 20,
} as const;

export function getFeaturedCardWidth(screenWidth: number): number {
  const available = screenWidth - LEARN_TAB.pagePadding * 2;
  const gap = LEARN_TAB.cardGap;
  const visibleCount = LEARN_TAB.featuredVisibleCount;
  return Math.floor((available - (visibleCount - 1) * gap) / visibleCount);
}

export function getFeaturedCardHeight(cardWidth: number): number {
  return Math.round(cardWidth / LEARN_TAB.featuredAspectRatio);
}

export function getFeaturedSnapInterval(cardWidth: number): number {
  return cardWidth + LEARN_TAB.cardGap;
}
