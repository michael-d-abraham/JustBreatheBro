import { WORLD_MAP_HEIGHT, WORLD_MAP_LAND_PATH, WORLD_MAP_WIDTH } from "@/constants/worldMap";
import type { GlobalDot } from "@/lib/globalPresenceProtocol";
import {
  GHOST_TTL_MS,
  type GhostDot,
  type PulseEvent,
} from "@/lib/globalPresenceState";
import { projectToWorldMap, worldMapHeightForWidth } from "@/lib/worldMapProjection";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const DOT_SIZE = 7;
const SELF_DOT_SIZE = 10;
const RIPPLE_SIZE = 28;
const RIPPLE_MS = 2600;
const RIPPLE_MAX_SCALE = 5;
const GHOST_START_OPACITY = 0.35;

type Props = {
  /** Rendered width in px; height follows the land outline's aspect ratio. */
  width: number;
  selfId: string | null;
  dots: GlobalDot[];
  ghosts: GhostDot[];
  pulses: PulseEvent[];
  /** Land + other people's dots (wallpaper-aware foreground). */
  color: string;
  /** Your dot and your own ripples. */
  accentColor: string;
};

/**
 * Minimal flat world map: faint land, one dot per connected person, dim fading ghosts for people who
 * just left, and a ripple at the origin of every pulse. Purely presentational — all state comes
 * from `useGlobalPresence`. Positions are the server's coarse, jittered points; nothing here can be
 * more precise than that.
 */
export default function GlobalRoomMap({
  width,
  selfId,
  dots,
  ghosts,
  pulses,
  color,
  accentColor,
}: Props) {
  const height = worldMapHeightForWidth(width);
  const reducedMotion = useReducedMotion();

  // Latest visible pulse per origin, so that dot can briefly brighten.
  const latestPulseSeq: Record<string, number> = {};
  for (const p of pulses) latestPulseSeq[p.id] = Math.max(latestPulseSeq[p.id] ?? 0, p.seq);

  const self = dots.find((d) => d.id === selfId);
  const others = dots.filter((d) => d.id !== selfId);

  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`World map showing ${dots.length} ${dots.length === 1 ? "person" : "people"} breathing together`}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${WORLD_MAP_WIDTH} ${WORLD_MAP_HEIGHT}`}>
        <Path d={WORLD_MAP_LAND_PATH} fill={color} fillOpacity={0.2} />
      </Svg>

      {ghosts.map((g) => (
        <GhostDotView key={g.id} ghost={g} width={width} height={height} color={color} />
      ))}
      {others.map((d) => (
        <PresenceDot
          key={d.id}
          dot={d}
          size={DOT_SIZE}
          width={width}
          height={height}
          color={color}
          baseOpacity={0.8}
          glowSeq={latestPulseSeq[d.id] ?? 0}
          reducedMotion={reducedMotion}
        />
      ))}
      {self ? (
        <PresenceDot
          dot={self}
          size={SELF_DOT_SIZE}
          width={width}
          height={height}
          color={accentColor}
          baseOpacity={1}
          glowSeq={latestPulseSeq[self.id] ?? 0}
          reducedMotion={reducedMotion}
          testID="global-room-self-dot"
        />
      ) : null}

      {pulses.map((p) => (
        <PulseRipple
          key={p.seq}
          pulse={p}
          width={width}
          height={height}
          color={p.isSelf ? accentColor : color}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}

function PresenceDot({
  dot,
  size,
  width,
  height,
  color,
  baseOpacity,
  glowSeq,
  reducedMotion,
  testID,
}: {
  dot: GlobalDot;
  size: number;
  width: number;
  height: number;
  color: string;
  baseOpacity: number;
  glowSeq: number;
  reducedMotion: boolean;
  testID?: string;
}) {
  const { x, y } = projectToWorldMap(dot.lat, dot.lon);
  const glow = useSharedValue(0);

  // Soft brighten when this dot is the origin of a pulse.
  useEffect(() => {
    if (glowSeq === 0) return;
    glow.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(0, { duration: reducedMotion ? 400 : 900 }),
    );
  }, [glowSeq, glow, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: baseOpacity + (1 - baseOpacity) * glow.value,
    transform: [{ scale: reducedMotion ? 1 : 1 + 0.8 * glow.value }],
  }));

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x * width - size / 2,
          top: y * height - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

/** A person who just left: a dim dot that fades to nothing over the remainder of the ghost TTL. */
function GhostDotView({
  ghost,
  width,
  height,
  color,
}: {
  ghost: GhostDot;
  width: number;
  height: number;
  color: string;
}) {
  const { x, y } = projectToWorldMap(ghost.lat, ghost.lon);
  const remainingMs = Math.max(0, ghost.leftAtMs + GHOST_TTL_MS - Date.now());
  const opacity = useSharedValue(GHOST_START_OPACITY * (remainingMs / GHOST_TTL_MS));

  useEffect(() => {
    opacity.value = withTiming(0, { duration: remainingMs, easing: Easing.linear });
    // Runs once per ghost (keyed by id): the fade is a single timeline, not something to restart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x * width - DOT_SIZE / 2,
          top: y * height - DOT_SIZE / 2,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

/** One soft ring expanding from a pulse's origin. Removed from state shortly after it finishes. */
function PulseRipple({
  pulse,
  width,
  height,
  color,
  reducedMotion,
}: {
  pulse: PulseEvent;
  width: number;
  height: number;
  color: string;
  reducedMotion: boolean;
}) {
  const { x, y } = projectToWorldMap(pulse.lat, pulse.lon);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: reducedMotion ? 1200 : RIPPLE_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * (pulse.isSelf ? 0.75 : 0.55),
    transform: [{ scale: reducedMotion ? 1.6 : 0.4 + progress.value * RIPPLE_MAX_SCALE }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x * width - RIPPLE_SIZE / 2,
          top: y * height - RIPPLE_SIZE / 2,
          width: RIPPLE_SIZE,
          height: RIPPLE_SIZE,
          borderRadius: RIPPLE_SIZE / 2,
          borderWidth: 1.5,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}
