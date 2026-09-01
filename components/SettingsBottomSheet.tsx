import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import BaseBottomSheet, { BaseBottomSheetHandle } from "./BaseBottomSheet";
import { SettingsInsetGroupedLayout } from "./SettingsInsetGrouped";

export type SettingsBottomSheetHandle = BaseBottomSheetHandle;

type SettingsSheetScreenProps = {
  title: string;
  /** Secondary copy below the large title. */
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  closeTestID: string;
  closeAccessibilityLabel?: string;
  onBack?: () => void;
  backLabel?: string;
};

/**
 * Shared inset-grouped chrome for bottom-sheet screens (Settings, Scenes, drill-downs).
 * Same header: × close top-right, large title, optional subtitle/back.
 */
export function SettingsSheetScreen({
  title,
  subtitle,
  onClose,
  children,
  closeTestID,
  closeAccessibilityLabel = "Close",
  onBack,
  backLabel,
}: SettingsSheetScreenProps) {
  return (
    <SettingsInsetGroupedLayout
      title={title}
      subtitle={subtitle}
      onDone={onClose}
      variant="bottomSheet"
      doneTestID={closeTestID}
      doneAccessibilityLabel={closeAccessibilityLabel}
      onBack={onBack}
      backLabel={backLabel}
    >
      {children}
    </SettingsInsetGroupedLayout>
  );
}

type SettingsBottomSheetProps = Omit<SettingsSheetScreenProps, "onClose"> & {
  onClose?: () => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
};

/**
 * Modal screen shell — Settings + Scenes bottom sheets.
 * Same: grouped background, drag indicator, 90% height, × close header via SettingsSheetScreen.
 */
const SettingsBottomSheet = forwardRef<
  SettingsBottomSheetHandle,
  SettingsBottomSheetProps
>(
  (
    {
      title,
      subtitle,
      onClose,
      children,
      closeTestID,
      closeAccessibilityLabel,
      onBack,
      backLabel,
      onChange,
      onDismiss,
    },
    ref,
  ) => {
    const sheetRef = useRef<BaseBottomSheetHandle>(null);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
    }));

    const handleClose = useCallback(() => {
      sheetRef.current?.close();
    }, []);

    const close = onClose ?? handleClose;

    return (
      <BaseBottomSheet
        ref={sheetRef}
        headerless
        snapPoints={["90%"]}
        onChange={onChange}
        onDismiss={onDismiss}
      >
        <SettingsSheetScreen
          title={title}
          subtitle={subtitle}
          onClose={close}
          closeTestID={closeTestID}
          closeAccessibilityLabel={closeAccessibilityLabel}
          onBack={onBack}
          backLabel={backLabel}
        >
          {children}
        </SettingsSheetScreen>
      </BaseBottomSheet>
    );
  },
);

SettingsBottomSheet.displayName = "SettingsBottomSheet";

/** Modal shell — Settings + Scenes. */
export { SettingsBottomSheet as ModalScreen };
/** Modal header + scroll body (centered title, × close). */
export { SettingsSheetScreen as ModalHeaderLayout };
export { SettingsSectionHeader } from "./SettingsInsetGrouped";
export {
  settingsPickerCard,
  settingsScreenPadding,
  settingsGroupRadius,
  settingsSectionSpacing,
  settingsSelectionIndicator,
} from "./settingsScreenTokens";
export { SettingsSelectionIndicator as SelectionIndicator } from "./SettingsOptionCard";

export default SettingsBottomSheet;
