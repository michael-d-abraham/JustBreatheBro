import type { AppTip } from "@/lib/appTipsContent";
import React from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

type Props = {
  tipId: AppTip["id"];
  size?: number;
  stroke: string;
  fill: string;
};

const VB = 48;

/** Simple line drawings for each Tips and Tricks step. */
export default function TipsWalkthroughDrawing({
  tipId,
  size = 72,
  stroke,
  fill,
}: Props) {
  const sw = 1.75;
  const soft = { stroke, strokeWidth: sw, strokeLinecap: "round" as const, fill: "none" };

  const content = (() => {
    switch (tipId) {
      case "start":
        return (
          <>
            <Circle cx={24} cy={24} r={17} {...soft} opacity={0.45} />
            <Circle cx={24} cy={24} r={11} {...soft} />
            <Path d="M21 18 L21 30 L30 24 Z" fill={fill} opacity={0.9} />
          </>
        );
      case "pause":
        return (
          <>
            <Circle cx={24} cy={24} r={14} {...soft} />
            <Line x1={19} y1={18} x2={19} y2={30} stroke={fill} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={29} y1={18} x2={29} y2={30} stroke={fill} strokeWidth={2.5} strokeLinecap="round" />
          </>
        );
      case "technique":
        return (
          <>
            <Rect x={10} y={14} width={28} height={8} rx={4} {...soft} />
            <Rect x={10} y={26} width={28} height={8} rx={4} stroke={fill} strokeWidth={2} fill={fill} opacity={0.25} />
            <Rect x={10} y={38} width={28} height={8} rx={4} {...soft} opacity={0.5} />
            <Path d="M32 30 L36 30 L34 27 M36 30 L34 33" {...soft} stroke={fill} />
          </>
        );
      case "dots":
        return (
          <>
            {[0, 1, 2, 3, 4].map((i) => {
              const cx = 12 + i * 6;
              const active = i < 3;
              return (
                <Circle
                  key={i}
                  cx={cx}
                  cy={24}
                  r={2.4}
                  stroke={stroke}
                  strokeWidth={1.5}
                  fill={active ? fill : "none"}
                  opacity={active ? 0.95 : 0.4}
                />
              );
            })}
            <Path d="M12 34 Q24 28 36 34" {...soft} opacity={0.35} />
            <Circle cx={24} cy={36} r={8} {...soft} opacity={0.35} />
          </>
        );
      case "scenes":
        return (
          <>
            <Line x1={24} y1={32} x2={24} y2={40} {...soft} />
            <Path
              d="M24 12 C20 18 16 20 16 24 C16 28 19.5 30 24 30 C28.5 30 32 28 32 24 C32 20 28 18 24 12 Z"
              {...soft}
            />
            <Path d="M20 22 C21 19 23 18 24 18 C25 18 27 19 28 22" {...soft} opacity={0.5} />
          </>
        );
      case "global":
        return (
          <>
            <Path
              d="M8 30 C14 22 20 26 24 20 C28 14 34 18 40 26"
              {...soft}
            />
            <Circle cx={30} cy={24} r={2.5} fill={fill} />
            <Circle cx={30} cy={24} r={6} {...soft} opacity={0.55} />
            <Circle cx={30} cy={24} r={10} {...soft} opacity={0.3} />
          </>
        );
      case "videos":
        return (
          <>
            <Rect x={11} y={14} width={26} height={20} rx={3} {...soft} />
            <Path d="M21 20 L21 28 L29 24 Z" fill={fill} opacity={0.85} />
            <Line x1={14} y1={38} x2={34} y2={38} {...soft} opacity={0.35} />
          </>
        );
      case "settings":
        return (
          <>
            <Circle cx={24} cy={22} r={7} {...soft} />
            <Circle cx={24} cy={22} r={2.5} fill={fill} opacity={0.8} />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 24 + Math.cos(rad) * 9;
              const y1 = 22 + Math.sin(rad) * 9;
              const x2 = 24 + Math.cos(rad) * 12;
              const y2 = 22 + Math.sin(rad) * 12;
              return (
                <Line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                />
              );
            })}
            <Path d="M14 38 Q17 34 20 38 T26 38 T32 38" stroke={fill} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7} />
          </>
        );
      default:
        return <Circle cx={24} cy={24} r={12} {...soft} />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} accessibilityRole="image">
      {content}
    </Svg>
  );
}
