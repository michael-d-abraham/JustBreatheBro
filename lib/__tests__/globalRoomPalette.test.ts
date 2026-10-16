import { globalRoomPalette } from "@/components/globalRoomTokens";
import { accentHighlightWash, modeTokens, type Mode } from "@/components/modeTokens";
import { THEME_ORDER, themeAccents } from "@/components/themeAccentTokens";

const MODES: Mode[] = ["light", "dark"];

describe("globalRoomPalette", () => {
  it.each(MODES.flatMap((m) => THEME_ORDER.map((t) => [m, t] as const)))(
    "derives every color from the %s mode and %s accent tokens",
    (mode, theme) => {
      const m = modeTokens[mode];
      const a = themeAccents[theme];
      expect(globalRoomPalette(m, a)).toEqual({
        ink: m.iconPrimary,
        self: a.highlight,
        selfGlow: accentHighlightWash(a.highlight),
        glow: m.glass.activeWash,
        link: a.highlight,
      });
    },
  );

  it("follows appearance: ink differs between light and dark", () => {
    const accent = themeAccents[THEME_ORDER[0]];
    expect(globalRoomPalette(modeTokens.light, accent).ink).not.toBe(
      globalRoomPalette(modeTokens.dark, accent).ink,
    );
  });

  it("follows theme: your dot changes with the accent but land/ink does not", () => {
    const [first, second] = THEME_ORDER.map((t) => themeAccents[t]);
    const a = globalRoomPalette(modeTokens.dark, first);
    const b = globalRoomPalette(modeTokens.dark, second);
    expect(a.ink).toBe(b.ink);
    expect(a.self).not.toBe(b.self);
  });

  it("makes your dot visually distinct from everyone else's in every combination", () => {
    for (const mode of MODES) {
      for (const theme of THEME_ORDER) {
        const p = globalRoomPalette(modeTokens[mode], themeAccents[theme]);
        expect(p.self.toLowerCase()).not.toBe(p.ink.toLowerCase());
      }
    }
  });
});
