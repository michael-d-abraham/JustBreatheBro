import QuoteCard from "@/components/QuoteCard";
import { SettingsOptionCardRow } from "@/components/SettingsOptionCard";
import {
  getSoundscapeEnvironmentBaseWidth,
  getSoundscapeEnvironmentCardSize,
  soundscapeEnvironmentCard,
} from "@/components/settingsScreenTokens";
import {
  QUOTE_SHEET_ORDER,
  type QuotePackId,
} from "@/constants/quoteEnvironments";
import React, { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

/** Placeholder quote pack row — soundscape card sizing, local selection only. */
export default function QuotesPicker() {
  const [selectedQuote, setSelectedQuote] = useState<QuotePackId>("shitIHeard");
  const { width: screenWidth } = useWindowDimensions();
  const baseWidth = useMemo(
    () => getSoundscapeEnvironmentBaseWidth(screenWidth),
    [screenWidth],
  );

  return (
    <SettingsOptionCardRow
      peek
      contentStyle={{
        alignItems: "flex-end",
        gap: soundscapeEnvironmentCard.gap,
        paddingHorizontal: soundscapeEnvironmentCard.screenInset,
        paddingRight:
          soundscapeEnvironmentCard.screenInset +
          soundscapeEnvironmentCard.gap * 2,
      }}
    >
      {QUOTE_SHEET_ORDER.map((quotePack) => {
        const selected = selectedQuote === quotePack;
        const { width, height } = getSoundscapeEnvironmentCardSize(baseWidth);

        return (
          <QuoteCard
            key={quotePack}
            quotePack={quotePack}
            selected={selected}
            onPress={() => setSelectedQuote(quotePack)}
            width={width}
            height={height}
            testID={`scenes.quote-${quotePack}`}
          />
        );
      })}
    </SettingsOptionCardRow>
  );
}
