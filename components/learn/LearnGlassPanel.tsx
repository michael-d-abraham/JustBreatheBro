import HomeNavFrostedSurface from "@/components/HomeNavFrostedSurface";
import { LEARN_TAB } from "@/components/learn/learnTabTokens";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Frosted container — floats above the home wallpaper like nav chrome. */
export default function LearnGlassPanel({
  children,
  borderRadius = LEARN_TAB.panelRadius,
  style,
  contentStyle,
}: Props) {
  return (
    <HomeNavFrostedSurface borderRadius={borderRadius} style={style}>
      <View style={[{ paddingHorizontal: 16, paddingVertical: 4 }, contentStyle]}>
        {children}
      </View>
    </HomeNavFrostedSurface>
  );
}
