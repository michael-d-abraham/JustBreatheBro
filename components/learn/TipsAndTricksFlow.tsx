import TipsAndTricksContent from "@/components/learn/TipsAndTricksContent";
import TipsAndTricksDetailContent from "@/components/learn/TipsAndTricksDetailContent";
import { SettingsSheetScreen } from "@/components/SettingsBottomSheet";
import { getAppTipById } from "@/lib/appTipsContent";
import React, { useState } from "react";

type Props = {
  onDone: () => void;
};

/** List ↔ detail navigation inside the Support bottom sheet. */
export default function TipsAndTricksFlow({ onDone }: Props) {
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const selectedTip = selectedTipId ? getAppTipById(selectedTipId) : undefined;

  if (selectedTip) {
    return (
      <SettingsSheetScreen
        title="Tips and Tricks"
        onClose={onDone}
        onBack={() => setSelectedTipId(null)}
        backLabel="Tips"
        closeTestID="tips-detail.close-button"
      >
        <TipsAndTricksDetailContent tip={selectedTip} bottomInset={8} />
      </SettingsSheetScreen>
    );
  }

  return (
    <SettingsSheetScreen
      title="Tips and Tricks"
      subtitle="All the tips gathered here to help you get the most out of the app."
      onClose={onDone}
      closeTestID="tips-and-tricks.close-button"
    >
      <TipsAndTricksContent
        bottomInset={8}
        onSelectTip={(id) => setSelectedTipId(id)}
      />
    </SettingsSheetScreen>
  );
}
