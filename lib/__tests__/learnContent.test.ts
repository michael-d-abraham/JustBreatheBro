jest.mock("@/constants/wallpapers", () => ({
  WALLPAPER_IMAGES: [{ source: 1, filename: "mock.jpg", name: "Mock" }],
}));

import {
  filterResourcesByQuery,
  filterResourcesBySection,
  getFeaturedPosts,
  getLatestPosts,
  resourceMatchesSection,
  resourceTypeLabel,
} from "@/lib/learnContent";
import { InformationResource } from "@/lib/informationArchive";

const sampleResource: InformationResource = {
  id: "sample",
  name: "Diaphragmatic Breathing Guide",
  link: "https://example.com",
  type: "article",
  shortDescription: "A practical breathing guide.",
  AI_description: "Detailed breathing instructions.",
  tags: ["breathing", "practice-guide", "deep-breathing"],
};

describe("learnContent", () => {
  it("maps unknown resource types to Article", () => {
    expect(resourceTypeLabel("preprint")).toBe("Article");
  });

  it("matches guided breathing by tag", () => {
    expect(resourceMatchesSection(sampleResource, "guidedBreathing")).toBe(
      true,
    );
  });

  it("matches guided meditations by meditation tag", () => {
    const meditation: InformationResource = {
      ...sampleResource,
      id: "meditation",
      tags: ["meditation", "easy watch"],
    };

    expect(resourceMatchesSection(meditation, "guidedMeditations")).toBe(true);
    expect(resourceMatchesSection(sampleResource, "guidedMeditations")).toBe(
      false,
    );
  });

  it("matches articles and books in Learn", () => {
    const book: InformationResource = {
      ...sampleResource,
      id: "book",
      type: "book",
      tags: ["book", "popular-science"],
    };

    expect(resourceMatchesSection(sampleResource, "learn")).toBe(true);
    expect(resourceMatchesSection(book, "learn")).toBe(true);
  });

  it("filters Learn to articles and books only", () => {
    const book: InformationResource = {
      ...sampleResource,
      id: "book",
      type: "book",
      tags: ["book", "popular-science"],
    };
    const video: InformationResource = {
      ...sampleResource,
      id: "video",
      type: "video",
      tags: ["video", "easy watch"],
    };

    const filtered = filterResourcesBySection(
      [sampleResource, book, video],
      "learn",
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.map((entry) => entry.id)).toEqual(["sample", "book"]);
  });

  it("features only video resources in the top carousel", () => {
    const video: InformationResource = {
      ...sampleResource,
      id: "video",
      type: "video",
      tags: ["video"],
    };

    const featured = getFeaturedPosts([sampleResource, video]);

    expect(featured).toHaveLength(1);
    expect(featured[0].id).toBe("video");
    expect(featured[0].eyebrow).toBe("Video");
  });

  it("excludes videos from Latest", () => {
    const video: InformationResource = {
      ...sampleResource,
      id: "video",
      type: "video",
      tags: ["video"],
    };

    const latest = getLatestPosts([sampleResource, video], new Set());

    expect(latest).toHaveLength(1);
    expect(latest[0].id).toBe("sample");
  });

  it("filters resources by query", () => {
    const filtered = filterResourcesByQuery(
      [sampleResource],
      "diaphragmatic",
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toContain("Diaphragmatic");
  });
});
