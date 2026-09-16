import HomeNavDropdown from "@/components/HomeNavDropdown";
import {
  HOME_TECHNIQUE_DROPDOWN_WIDTH,
  HOME_TECHNIQUE_PILL_HEIGHT,
  HOME_TECHNIQUE_PILL_WIDTH,
} from "@/components/homeNavTokens";
import {
  BREATH_ROOM_CATALOG,
  CanonicalBreathRoomId,
  getBreathRoomCatalogEntry,
} from "@/hooks/useGlobalBreathingRoom";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

type Props = {
  roomId: CanonicalBreathRoomId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (roomId: CanonicalBreathRoomId) => void;
};

export function getHomeBreathRoomLabel(roomId: string): string {
  return getBreathRoomCatalogEntry(roomId)?.title ?? BREATH_ROOM_CATALOG[0].title;
}

export default function HomeBreathRoomDropdown({
  roomId,
  open,
  onOpenChange,
  onSelect,
}: Props) {
  const label = getHomeBreathRoomLabel(roomId);

  const options = useMemo(
    () =>
      BREATH_ROOM_CATALOG.map((option) => ({
        id: option.id,
        label: option.title,
        testID: `home.breath-room-option-${option.id}`,
      })),
    [],
  );

  const handleSelect = (id: string) => {
    const match = BREATH_ROOM_CATALOG.find((option) => option.id === id);
    if (match) {
      onSelect(match.id);
    }
  };

  return (
    <HomeNavDropdown
      testID="home.breath-room-dropdown"
      triggerLabel={label}
      triggerAccessibilityLabel={`Room: ${label}`}
      options={options}
      selectedId={roomId}
      onSelect={handleSelect}
      open={open}
      onOpenChange={onOpenChange}
      dropdownWidth={HOME_TECHNIQUE_DROPDOWN_WIDTH}
      triggerStyle={styles.trigger}
    />
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: HOME_TECHNIQUE_PILL_WIDTH,
    height: HOME_TECHNIQUE_PILL_HEIGHT,
  },
});
