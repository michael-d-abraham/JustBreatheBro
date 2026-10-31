/** Three-stop card gradient (matches AppIconCard / SceneCard pattern). */
export type LearnCardGradient = {
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
};

/**
 * One distinct gradient per featured video — muted, low-contrast tones (mist, sage, stone)
 * so the carousel feels calm next to the wallpaper, not loud or promotional.
 */
export const LEARN_VIDEO_GRADIENTS: Record<string, LearnCardGradient> = {
  "10": {
    gradientTop: "#E4E2EA",
    gradientMid: "#C5C0D0",
    gradientBottom: "#8E899C",
  },
  "9": {
    gradientTop: "#DDE4EA",
    gradientMid: "#B0BEC9",
    gradientBottom: "#758590",
  },
  "8": {
    gradientTop: "#DCE8E2",
    gradientMid: "#AFC4BA",
    gradientBottom: "#728578",
  },
  "11": {
    gradientTop: "#E8E2DA",
    gradientMid: "#C9BFB3",
    gradientBottom: "#918578",
  },
  "7": {
    gradientTop: "#E6DDE2",
    gradientMid: "#C7B3BC",
    gradientBottom: "#8F7A84",
  },
};

const FALLBACK_GRADIENTS: LearnCardGradient[] = Object.values(LEARN_VIDEO_GRADIENTS);

export function learnVideoGradient(resourceId: string): LearnCardGradient {
  const mapped = LEARN_VIDEO_GRADIENTS[resourceId];
  if (mapped) return mapped;
  let hash = 0;
  for (let i = 0; i < resourceId.length; i++) {
    hash = (hash + resourceId.charCodeAt(i)) % FALLBACK_GRADIENTS.length;
  }
  return FALLBACK_GRADIENTS[hash] ?? FALLBACK_GRADIENTS[0]!;
}
