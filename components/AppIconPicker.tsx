import AppIconCard from "@/components/AppIconCard";
import { SettingsOptionCardRow } from "@/components/SettingsOptionCard";
import {
  appIconEnvironmentCard,
  getAppIconEnvironmentBaseWidth,
  getAppIconEnvironmentCardSize,
} from "@/components/settingsScreenTokens";
import {
  APP_ICON_SHEET_ORDER,
  getAppIconOption,
  type AppIconOptionId,
} from "@/constants/appIconOptions";
import React, { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

/** Placeholder app icon row — square tiles sized like home-screen icons. */
export default function AppIconPicker() {
  const [selectedIcon, setSelectedIcon] = useState<AppIconOptionId>("default");
  const { width: screenWidth } = useWindowDimensions();
  const baseWidth = useMemo(
    () => getAppIconEnvironmentBaseWidth(screenWidth),
    [screenWidth],
  );
  const { width: iconSize } = getAppIconEnvironmentCardSize(baseWidth);

  return (
    <SettingsOptionCardRow
      peek
      contentStyle={{
        alignItems: "flex-start",
        gap: appIconEnvironmentCard.gap,
        paddingHorizontal: appIconEnvironmentCard.screenInset,
        paddingRight:
          appIconEnvironmentCard.screenInset + appIconEnvironmentCard.gap * 2,
      }}
    >
      {APP_ICON_SHEET_ORDER.map((iconId) => {
        const selected = selectedIcon === iconId;
        const option = getAppIconOption(iconId);

        return (
          <AppIconCard
            key={iconId}
            option={option}
            selected={selected}
            onPress={() => setSelectedIcon(iconId)}
            size={iconSize}
            testID={`scenes.app-icon-${iconId}`}
          />
        );
      })}
    </SettingsOptionCardRow>
  );
}
