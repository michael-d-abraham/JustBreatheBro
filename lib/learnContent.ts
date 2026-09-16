import { WALLPAPER_IMAGES } from "@/constants/wallpapers";
import {
  InformationResource,
  ResourceType,
} from "@/lib/informationArchive";
import { ImageSourcePropType } from "react-native";

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
  imageSource: ImageSourcePropType;
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
  return {
    id: resource.id,
    title: resource.name,
    eyebrow: resourceTypeLabel(resource.type),
    subtitle: resource.shortDescription,
    link: resource.link,
    imageSource: placeholderImage(index),
    resource,
  };
}

export function toLearnPosts(resources: InformationResource[]): LearnPost[] {
  return resources.map((resource, index) => toLearnPost(resource, index));
}

export function isVideoResource(resource: InformationResource): boolean {
  return resource.type === "video";
}

/** Top carousel — YouTube / video resources only. */
export function getFeaturedPosts(resources: InformationResource[]): LearnPost[] {
  const videos = resources.filter(isVideoResource);
  return toLearnPosts(videos.slice(0, FEATURED_COUNT));
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
