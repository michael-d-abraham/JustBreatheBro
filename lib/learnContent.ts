import { WALLPAPER_IMAGES } from "@/constants/wallpapers";
import {
  InformationResource,
  ResourceType,
} from "@/lib/informationArchive";
import {
  learnVideoGradient,
  type LearnCardGradient,
} from "@/lib/learnVideoGradients";
import { ImageSourcePropType } from "react-native";

export type { LearnCardGradient };

export type LearnSectionId =
  | "guidedBreathing"
  | "guidedMeditations"
  | "music"
  | "learn";

export type LearnPost = {
  id: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  link: string;
  /** Wallpaper thumbnail for articles/books; omitted for videos (use `gradient`). */
  imageSource?: ImageSourcePropType;
  /** Video carousel / row art — color gradient instead of a photo. */
  gradient?: LearnCardGradient;
  resource: InformationResource;
};

export type LearnSection = {
  id: LearnSectionId;
  title: string;
  tagMatchers: string[];
};

export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: "guidedBreathing",
    title: "Guided Breathing",
    tagMatchers: [
      "breathing",
      "diaphragmatic",
      "deep-breathing",
      "respiration",
      "box-breathing",
      "practice-guide",
      "self-management",
      "clinical-guide",
    ],
  },
  {
    id: "guidedMeditations",
    title: "Guided Meditations",
    tagMatchers: ["meditation", "mindfulness", "guided-meditation"],
  },
  {
    id: "music",
    title: "Music",
    tagMatchers: ["music", "ambient", "soundscape", "audio"],
  },
  {
    id: "learn",
    title: "Learn",
    tagMatchers: [],
  },
];

const FEATURED_COUNT = 5;

/** Explore / walkthrough carousel order (information archive resource ids). */
export const FEATURED_VIDEO_IDS = [
  "10", // 5-Minute Guided Breath Meditation
  "9", // 4-7-8 Breathing for Sleep and Anxiety
  "8", // Box Breathing — Navy SEAL Technique for Calm
  "11", // Why Slow Breathing Changes Your Nervous System
  "7", // Dr. Joe Dispenza — Break the Habit of Being Yourself
] as const;

function orderResourcesByIds(
  resources: InformationResource[],
  ids: readonly string[],
): InformationResource[] {
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  const ordered: InformationResource[] = [];
  for (const id of ids) {
    const match = byId.get(id);
    if (match) ordered.push(match);
  }
  for (const resource of resources) {
    if (!ids.includes(resource.id)) ordered.push(resource);
  }
  return ordered;
}

function orderedVideoResources(
  resources: InformationResource[],
): InformationResource[] {
  return orderResourcesByIds(
    resources.filter(isVideoResource),
    FEATURED_VIDEO_IDS,
  );
}

export function resourceTypeLabel(type: string): string {
  switch (type) {
    case "article":
      return "Article";
    case "book":
      return "Book";
    case "video":
      return "Video";
    default:
      return "Article";
  }
}

function placeholderImage(index: number): ImageSourcePropType {
  const wallpaper = WALLPAPER_IMAGES[index % WALLPAPER_IMAGES.length];
  return wallpaper.source;
}

export function toLearnPost(
  resource: InformationResource,
  index: number,
): LearnPost {
  const isVideo = resource.type === "video";
  return {
    id: resource.id,
    title: resource.name,
    eyebrow: resourceTypeLabel(resource.type),
    subtitle: resource.shortDescription,
    link: resource.link,
    ...(isVideo
      ? { gradient: learnVideoGradient(resource.id) }
      : { imageSource: placeholderImage(index) }),
    resource,
  };
}

export function toLearnPosts(resources: InformationResource[]): LearnPost[] {
  return resources.map((resource, index) => toLearnPost(resource, index));
}

export function isVideoResource(resource: InformationResource): boolean {
  return resource.type === "video";
}

/** All video resources for the Video walkthroughs tab. */
export function getVideoWalkthroughPosts(
  resources: InformationResource[],
): LearnPost[] {
  return toLearnPosts(orderedVideoResources(resources));
}

/** Top carousel — first N videos in `FEATURED_VIDEO_IDS` order. */
export function getFeaturedPosts(resources: InformationResource[]): LearnPost[] {
  return toLearnPosts(
    orderedVideoResources(resources).slice(0, FEATURED_COUNT),
  );
}

export function getMoreVideoWalkthroughPosts(
  resources: InformationResource[],
  featuredIds: Set<string>,
): LearnPost[] {
  return getVideoWalkthroughPosts(resources).filter(
    (post) => !featuredIds.has(post.id),
  );
}

function normalizedTags(resource: InformationResource): string[] {
  return resource.tags.map((tag) => tag.toLowerCase());
}

function isLearnResource(resource: InformationResource): boolean {
  const type = resource.type as ResourceType | string;
  return type === "article" || type === "book" || type === "preprint";
}

export function resourceMatchesSection(
  resource: InformationResource,
  sectionId: LearnSectionId,
): boolean {
  const section = LEARN_SECTIONS.find((entry) => entry.id === sectionId);
  if (!section) {
    return false;
  }

  if (sectionId === "learn") {
    return isLearnResource(resource);
  }

  const tags = normalizedTags(resource);
  return section.tagMatchers.some((matcher) => tags.includes(matcher));
}

export function filterResourcesBySection(
  resources: InformationResource[],
  sectionId: LearnSectionId | null,
): InformationResource[] {
  if (!sectionId) {
    return resources;
  }
  return resources.filter((resource) =>
    resourceMatchesSection(resource, sectionId),
  );
}

export function filterResourcesByQuery(
  resources: InformationResource[],
  query: string,
): InformationResource[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return resources;
  }

  const lowerQuery = trimmed.toLowerCase();
  return resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(lowerQuery) ||
      resource.shortDescription.toLowerCase().includes(lowerQuery) ||
      resource.AI_description.toLowerCase().includes(lowerQuery) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}

export function getLatestPosts(
  resources: InformationResource[],
  featuredIds: Set<string>,
): LearnPost[] {
  return toLearnPosts(
    resources.filter(
      (resource) =>
        !featuredIds.has(resource.id) && !isVideoResource(resource),
    ),
  );
}
