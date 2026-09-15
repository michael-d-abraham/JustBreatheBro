import { ImageSourcePropType } from "react-native";

export type AppIconOptionId = "default" | "tulip" | "midnight" | "dawn";

export type AppIconCoverGradient = {
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
};

export type AppIconOption = {
  id: AppIconOptionId;
  label: string;
  imageSource?: ImageSourcePropType;
  gradient?: AppIconCoverGradient;
};

/** Placeholder app icon choices — visual samples until switching is wired up. */
export const APP_ICON_OPTIONS: AppIconOption[] = [
  {
    id: "default",
    label: "Default",
    imageSource: require("../assets/icons/icon.png"),
  },
  {
    id: "tulip",
    label: "Tulip",
    imageSource: require("../assets/icons/tulip.png"),
  },
  {
    id: "midnight",
    label: "Midnight",
    gradient: {
      gradientTop: "#4A4A4C",
      gradientMid: "#2C2C2E",
      gradientBottom: "#1C1C1E",
    },
  },
  {
    id: "dawn",
    label: "Dawn",
    gradient: {
      gradientTop: "#F2E8DC",
      gradientMid: "#D4C4B0",
      gradientBottom: "#A8947E",
    },
  },
];

export const APP_ICON_SHEET_ORDER: AppIconOptionId[] = APP_ICON_OPTIONS.map(
  (option) => option.id,
);

export function getAppIconOption(id: AppIconOptionId): AppIconOption {
  const option = APP_ICON_OPTIONS.find((entry) => entry.id === id);
  if (!option) {
    return APP_ICON_OPTIONS[0];
  }
  return option;
}
