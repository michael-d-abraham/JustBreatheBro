export type QuotePackId =
  | "shitIHeard"
  | "peace"
  | "inspiration"
  | "love"
  | "custom";

export type QuoteCoverGradient = {
  label: string;
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
};

/** Placeholder quote packs — gradient covers until real content ships. */
export const QUOTE_ENVIRONMENTS: Record<QuotePackId, QuoteCoverGradient> = {
  shitIHeard: {
    label: "Shit I heard",
    gradientTop: "#8A7B6A",
    gradientMid: "#6B5E50",
    gradientBottom: "#3D342C",
  },
  peace: {
    label: "Peace",
    gradientTop: "#6B8FA3",
    gradientMid: "#4A6B7C",
    gradientBottom: "#2C3E47",
  },
  inspiration: {
    label: "Inspiration",
    gradientTop: "#7A6B8C",
    gradientMid: "#5C4F6A",
    gradientBottom: "#352E3F",
  },
  love: {
    label: "Love",
    gradientTop: "#A86B7A",
    gradientMid: "#7C4F5A",
    gradientBottom: "#3F2E32",
  },
  custom: {
    label: "Custom",
    gradientTop: "#6A8C7A",
    gradientMid: "#4F6B5A",
    gradientBottom: "#2E3F36",
  },
};

export const QUOTE_SHEET_ORDER: QuotePackId[] = [
  "shitIHeard",
  "peace",
  "inspiration",
  "love",
  "custom",
];
