import HomeNavIconButton from "@/components/HomeNavIconButton";
import HomeNavMenuItem from "@/components/HomeNavMenuItem";
import {
  CloseNavIcon,
  HamburgerNavIcon,
  ProfileMenuIcon,
  SettingsMenuIcon,
  TipsMenuIcon,
} from "@/components/HomeNavIcons";
import {
  HOME_NAV_ICON_BUTTON_SIZE,
  HOME_NAV_ICON_SIZE,
  HOME_NAV_MENU_ANIM_MS,
  HOME_NAV_MENU_GAP_BELOW_TRIGGER,
  HOME_NAV_MENU_PILL_GAP,
  HOME_NAV_MENU_PILL_WIDTH,
  homeNavIconPrimary,
} from "@/components/homeNavTokens";
import { useTheme } from "@/components/Theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type MenuItemId = "tipsAndTricks" | "profile" | "settings";

type MenuItemConfig = {
  id: MenuItemId;
  label: string;
  testID: string;
  Icon: typeof TipsMenuIcon;
};

const MENU_ITEMS: MenuItemConfig[] = [
  {
    id: "tipsAndTricks",
    label: "Tips and tricks",
    testID: "home.menu-tips-and-tricks",
    Icon: TipsMenuIcon,
  },
  {
    id: "profile",
    label: "Profile",
    testID: "home.menu-profile",
    Icon: ProfileMenuIcon,
  },
  {
    id: "settings",
    label: "Settings",
    testID: "home.menu-settings",
    Icon: SettingsMenuIcon,
  },
];

type Props = {
  onTipsAndTricksPress: () => void;
  onProfilePress: () => void;
  onSettingsPress: () => void;
};

const MENU_TIMING = {
  duration: HOME_NAV_MENU_ANIM_MS,
  easing: Easing.out(Easing.cubic),
};

/** Top-right hamburger — mode-aware menu pills beneath frosted trigger. */
export default function HomeNavMenu({
  onTipsAndTricksPress,
  onProfilePress,
  onSettingsPress,
}: Props) {
  const { tokens } = useTheme();
  const iconColor = homeNavIconPrimary(tokens.mode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const panelProgress = useSharedValue(0);
  const iconProgress = useSharedValue(0);

  const menuActions: Record<MenuItemId, () => void> = useMemo(
    () => ({
      tipsAndTricks: onTipsAndTricksPress,
      profile: onProfilePress,
      settings: onSettingsPress,
    }),
    [onTipsAndTricksPress, onProfilePress, onSettingsPress],
  );

  const animatePanel = useCallback(
    (open: boolean) => {
      panelProgress.value = withTiming(open ? 1 : 0, MENU_TIMING);
      iconProgress.value = withTiming(open ? 1 : 0, MENU_TIMING);
    },
    [iconProgress, panelProgress],
  );

  const openMenu = useCallback(() => {
    setMenuVisible(true);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      animatePanel(true);
      return;
    }

    if (!menuVisible) {
      return;
    }

    animatePanel(false);

    const timeout = setTimeout(() => {
      setMenuVisible(false);
    }, HOME_NAV_MENU_ANIM_MS);

    return () => clearTimeout(timeout);
  }, [animatePanel, menuOpen, menuVisible]);

  const handleMenuItemPress = (id: MenuItemId) => {
    closeMenu();
    menuActions[id]();
  };

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: panelProgress.value,
    transform: [
      {
        translateY: interpolate(panelProgress.value, [0, 1], [-6, 0]),
      },
      {
        scale: interpolate(panelProgress.value, [0, 1], [0.94, 1]),
      },
    ],
  }));

  const hamburgerIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconProgress.value, [0, 1], [1, 0]),
    transform: [
      { scale: interpolate(iconProgress.value, [0, 1], [1, 0.85]) },
    ],
  }));

  const closeIconStyle = useAnimatedStyle(() => ({
    opacity: iconProgress.value,
    transform: [
      { scale: interpolate(iconProgress.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <>
      {menuVisible && (
        <Pressable
          style={styles.backdrop}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
          onPress={closeMenu}
          pointerEvents={menuOpen ? "auto" : "none"}
        />
      )}

      <View style={styles.anchor}>
        <HomeNavIconButton
          testID="home.menu-button"
          accessibilityLabel={menuOpen ? "Close menu" : "Menu"}
          accessibilityState={{ expanded: menuOpen }}
          onPress={() => (menuOpen ? closeMenu() : openMenu())}
        >
          <View style={styles.triggerIconStack}>
            <Animated.View style={[styles.triggerIcon, hamburgerIconStyle]}>
              <HamburgerNavIcon
                size={HOME_NAV_ICON_SIZE}
                color={iconColor}
              />
            </Animated.View>
            <Animated.View style={[styles.triggerIcon, closeIconStyle]}>
              <CloseNavIcon size={HOME_NAV_ICON_SIZE} color={iconColor} />
            </Animated.View>
          </View>
        </HomeNavIconButton>

        {menuVisible && (
          <Animated.View
            style={[styles.pillStack, panelAnimatedStyle]}
            pointerEvents={menuOpen ? "auto" : "none"}
          >
            {MENU_ITEMS.map(({ id, label, testID, Icon }) => (
              <HomeNavMenuItem
                key={id}
                label={label}
                testID={testID}
                Icon={Icon}
                onPress={() => handleMenuItemPress(id)}
              />
            ))}
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
  },
  anchor: {
    position: "relative",
    zIndex: 30,
    overflow: "visible",
  },
  triggerIconStack: {
    width: HOME_NAV_ICON_SIZE,
    height: HOME_NAV_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pillStack: {
    position: "absolute",
    top: HOME_NAV_ICON_BUTTON_SIZE + HOME_NAV_MENU_GAP_BELOW_TRIGGER,
    right: 0,
    width: HOME_NAV_MENU_PILL_WIDTH,
    gap: HOME_NAV_MENU_PILL_GAP,
    alignItems: "flex-end",
  },
});
