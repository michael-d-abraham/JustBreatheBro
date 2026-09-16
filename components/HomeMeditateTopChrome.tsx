import HomeNavIconButton from "@/components/HomeNavIconButton";
import HomeNavMenu from "@/components/HomeNavMenu";
import { HOME_NAV_HORIZONTAL_INSET } from "@/components/HomeNavigation";
import React from "react";
import { StyleSheet, View } from "react-native";

const TOP_CHROME_PADDING_TOP = 8;

type Props = {
  onScenesPress: () => void;
  onTipsAndTricksPress: () => void;
  onProfilePress: () => void;
  onSettingsPress: () => void;
};

/** Scenes + menu row — Meditate pager page only; slides off when swiping to Create or Explore. */
export default function HomeMeditateTopChrome({
  onScenesPress,
  onTipsAndTricksPress,
  onProfilePress,
  onSettingsPress,
}: Props) {
  return (
    <View style={styles.root} pointerEvents="box-none">
      <HomeNavIconButton
        testID="home.scenes-button"
        accessibilityLabel="Scenes"
        onPress={onScenesPress}
        imageSource={require("../assets/icons/tulip.png")}
      />

      <HomeNavMenu
        onTipsAndTricksPress={onTipsAndTricksPress}
        onProfilePress={onProfilePress}
        onSettingsPress={onSettingsPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: HOME_NAV_HORIZONTAL_INSET,
    paddingTop: TOP_CHROME_PADDING_TOP,
    paddingBottom: 4,
    width: "100%",
  },
});
