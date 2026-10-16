import {
  GLOBAL_ROOM_DOT_OPACITY,
  GLOBAL_ROOM_DOT_SIZE,
  GLOBAL_ROOM_GHOST_OPACITY,
  GLOBAL_ROOM_GLOW_SIZE,
  GLOBAL_ROOM_LAND_DOT_OPACITY,
  GLOBAL_ROOM_LAND_DOT_RADIUS,
  GLOBAL_ROOM_RIPPLE_BORDER_WIDTH,
  GLOBAL_ROOM_RIPPLE_SIZE,
  GLOBAL_ROOM_SELF_DOT_SIZE,
  type GlobalRoomPalette,
} from "@/components/globalRoomTokens";
import { WORLD_MAP_HEIGHT, WORLD_MAP_LAND_DOTS, WORLD_MAP_WIDTH } from "@/constants/worldMap";
import type { GlobalDot } from "@/lib/globalPresenceProtocol";
import type { GhostDot, PulseEvent } from "@/lib/globalPresenceState";
import { markBox } from "@/lib/globalRoomLayout";
import {
  GLOW_IN_MS,
  ghostFade,
  glowFrame,
  glowOutMs,
  rippleDurationMs,
  rippleFrame,
} from "@/lib/globalRoomMotion";
import { worldMapHeightForWidth } from "@/lib/worldMapProjection";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

type Props = {
  /** Rendered width in px; height follows the dotted map's aspect ratio. */
  width: number;
  selfId: string | null;
  dots: GlobalDot[];
  ghosts: GhostDot[];
  pulses: PulseEvent[];
  /** Every color, already resolved from the theme (see `globalRoomPalette`). */
  palette: GlobalRoomPalette;
};

/**
 * Minimal dotted world map: precomputed land grid, one dot per connected person, dim fading ghosts for people who
 * just left, and a ripple + soft glow at the origin of every pulse. Purely presentational — all
 * state arrives through props from `useGlobalPresence`; this component never touches the network.
 * Positions are the server's coarse, jittered points, so nothing here can be more precise than that.
 */
export default function GlobalRoomMap({
  width,
  selfId,
  dots,
  ghosts,
  pulses,
  palette,
}: Props) {
  const height = worldMapHeightForWidth(width);
  const reducedMotion = useReducedMotion();

  // Latest visible pulse per origin, so that dot can glow.
  const latestPulseSeq: Record<string, number> = {};
  for (const p of pulses) latestPulseSeq[p.id] = Math.max(latestPulseSeq[p.id] ?? 0, p.seq);

  const self = dots.find((d) => d.id === selfId);
  const others = dots.filter((d) => d.id !== selfId);

  const landDots = useMemo(
    () => <LandDotGrid ink={palette.ink} />,
    [palette.ink],
  );

  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`World map showing ${dots.length} ${dots.length === 1 ? "person" : "people"} here`}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${WORLD_MAP_WIDTH} ${WORLD_MAP_HEIGHT}`}>
        {landDots}
      </Svg>

      {ghosts.map((g) => (
        <GhostDotView key={g.id} ghost={g} width={width} color={palette.ink} />
      ))}
      {others.map((d) => (
        <PresenceDot
          key={d.id}
          dot={d}
          width={width}
          baseSize={GLOBAL_ROOM_DOT_SIZE}
          baseOpacity={GLOBAL_ROOM_DOT_OPACITY}
          color={palette.ink}
          glowColor={palette.glow}
          glowSeq={latestPulseSeq[d.id] ?? 0}
          reducedMotion={reducedMotion}
        />
      ))}
      {self ? (
        <PresenceDot
          dot={self}
          width={width}
          baseSize={GLOBAL_ROOM_SELF_DOT_SIZE}
          baseOpacity={1}
          color={palette.self}
          glowColor={palette.selfGlow}
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
          color={p.isSelf ? palette.self : palette.ink}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}

const landDotNodeCache = new Map<string, React.ReactElement[]>();

function landDotNodes(ink: string): React.ReactElement[] {
  const cached = landDotNodeCache.get(ink);
  if (cached) return cached;

  const out: React.ReactElement[] = [];
  const dots = WORLD_MAP_LAND_DOTS;
  for (let i = 0; i < dots.length; i += 2) {
    out.push(
      <Circle
        key={i}
        cx={dots[i]}
        cy={dots[i + 1]}
        r={GLOBAL_ROOM_LAND_DOT_RADIUS}
        fill={ink}
        fillOpacity={GLOBAL_ROOM_LAND_DOT_OPACITY}
      />,
    );
  }
  landDotNodeCache.set(ink, out);
  return out;
}

/** Precomputed dotted-map land grid — built once per ink color. */
function LandDotGrid({ ink }: { ink: string }) {
  const nodes = useMemo(() => landDotNodes(ink), [ink]);
  return <>{nodes}</>;
}

/** A connected person. Glows (halo + brief swell) whenever a pulse originates here. */
function PresenceDot({
  dot,
  width,
  baseSize,
  baseOpacity,
  color,
  glowColor,
  glowSeq,
  reducedMotion,
  testID,
}: {
  dot: GlobalDot;
  width: number;
  baseSize: number;
  baseOpacity: number;
  color: string;
  glowColor: string;
  glowSeq: number;
  reducedMotion: boolean;
  testID?: string;
}) {
  const box = markBox(dot.lat, dot.lon, width, baseSize);
  const halo = markBox(dot.lat, dot.lon, width, GLOBAL_ROOM_GLOW_SIZE);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (glowSeq === 0) return;
    glow.value = withSequence(
      withTiming(1, { duration: GLOW_IN_MS }),
      withTiming(0, { duration: glowOutMs(reducedMotion) }),
    );
  }, [glowSeq, glow, reducedMotion]);

  const dotStyle = useAnimatedStyle(() => {
    const f = glowFrame(glow.value, baseOpacity, reducedMotion);
    return { opacity: f.dotOpacity, transform: [{ scale: f.dotScale }] };
  });
  const haloStyle = useAnimatedStyle(() => {
    const f = glowFrame(glow.value, baseOpacity, reducedMotion);
    return { opacity: f.haloOpacity, transform: [{ scale: f.haloScale }] };
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: halo.left,
            top: halo.top,
            width: halo.size,
            height: halo.size,
            borderRadius: halo.size / 2,
            backgroundColor: glowColor,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        testID={testID}
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.size,
            height: box.size,
            borderRadius: box.size / 2,
            backgroundColor: color,
          },
          dotStyle,
        ]}
      />
    </>
  );
}

/** A person who just left: a dim dot that fades to nothing over the remainder of the ghost TTL. */
function GhostDotView({
  ghost,
  width,
  color,
}: {
  ghost: GhostDot;
  width: number;
  color: string;
}) {
  const box = markBox(ghost.lat, ghost.lon, width, GLOBAL_ROOM_DOT_SIZE);
  // Fixed at mount: the fade is one timeline that ends exactly when the state machine drops the
  // ghost, not something to recompute (and restart) on every render.
  const [fade] = useState(() =>
    ghostFade(ghost.leftAtMs, Date.now(), GLOBAL_ROOM_GHOST_OPACITY),
  );
  const opacity = useSharedValue(fade.startOpacity);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: fade.remainingMs, easing: Easing.linear });
  }, [opacity, fade]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: box.left,
          top: box.top,
          width: box.size,
          height: box.size,
          borderRadius: box.size / 2,
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
  color,
  reducedMotion,
}: {
  pulse: PulseEvent;
  width: number;
  color: string;
  reducedMotion: boolean;
}) {
  const box = markBox(pulse.lat, pulse.lon, width, GLOBAL_ROOM_RIPPLE_SIZE);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: rippleDurationMs(reducedMotion),
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const f = rippleFrame(progress.value, pulse.isSelf, reducedMotion);
    return { opacity: f.opacity, transform: [{ scale: f.scale }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: box.left,
          top: box.top,
          width: box.size,
          height: box.size,
          borderRadius: box.size / 2,
          borderWidth: GLOBAL_ROOM_RIPPLE_BORDER_WIDTH,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}
