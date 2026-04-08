import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './Theme';

/** Light frosted sheet: ~12% see-through over content behind. */
const BOTTOM_SHEET_BACKGROUND_ALPHA = 0.88;

function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const a = Math.min(255, Math.max(0, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, '0');
  return `#${clean}${a}`;
}

/**
 * Handle type for imperative control of BaseBottomSheet
 * @property {function} open - Opens the bottom sheet
 * @property {function} close - Closes the bottom sheet
 */
export type BaseBottomSheetHandle = {
  open: () => void;
  close: () => void;
};

/**
 * Props for BaseBottomSheet component
 * @property {string} title - Main title displayed at top of sheet
 * @property {string} [subtitle] - Optional subtitle below title
 * @property {string[]} [snapPoints] - Sheet height snapPoints (default: ['80%'])
 * @property {React.ReactNode} children - Content to display in sheet
 * @property {function} [onChange] - Callback when sheet index changes
 * @property {function} [onDismiss] - Callback when sheet is dismissed
 */
interface BaseBottomSheetProps {
  title: string;
  subtitle?: string;
  snapPoints?: string[];
  children: React.ReactNode;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

/**
 * BaseBottomSheet - Unified bottom sheet component for the entire app
 * 
 * **IMPORTANT: This is the ONLY component that should directly instantiate BottomSheetModal**
 * 
 * COLOR TOKEN CONTRACT:
 * This component uses ONLY the following tokens from Theme.tsx:
 * - tokens.bottomSheetBg: Base sheet fill (palette surface), blended to ~88% opacity for slight see-through
 * - tokens.bottomSheetText: Primary text color (PlatformColor('label'))
 * - tokens.bottomSheetSeparator: Handle indicator color (PlatformColor('separator'))
 * 
 * These tokens are:
 * - Independent from app theme colors (grounded/calm/uplifting)
 * - Automatically adapt to system light/dark mode
 * - Respect manual appearance override (Settings > Appearance Mode)
 * 
 * CHILD COMPONENTS:
 * All child components should also use ONLY bottomSheet* tokens:
 * - tokens.bottomSheetBg
 * - tokens.bottomSheetText
 * - tokens.bottomSheetSecondaryText
 * - tokens.bottomSheetSeparator
 * 
 * DO NOT USE in bottom sheets:
 * - tokens.sceneBackground, tokens.surface, tokens.accentPrimary, etc.
 * - Raw hex colors for UI elements (feature preview colors are acceptable)
 * 
 * @example
 * ```tsx
 * <BaseBottomSheet
 *   ref={sheetRef}
 *   title="Settings"
 *   subtitle="Configure your preferences"
 *   onChange={handleChange}
 *   onDismiss={handleDismiss}
 * >
 *   <BottomSheetSectionTitle>Audio</BottomSheetSectionTitle>
 *   <BottomSheetToggleButton {...props} />
 * </BaseBottomSheet>
 * ```
 */
const BaseBottomSheet = forwardRef<BaseBottomSheetHandle, BaseBottomSheetProps>(
  ({ title, subtitle, snapPoints, children, onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const modalRef = useRef<BottomSheetModal>(null);

    const sheetBackgroundColor = useMemo(() => {
      const bg = tokens.bottomSheetBg;
      if (typeof bg === 'string' && /^#[0-9A-Fa-f]{6}$/.test(bg)) {
        return hexWithAlpha(bg, BOTTOM_SHEET_BACKGROUND_ALPHA);
      }
      return bg;
    }, [tokens.bottomSheetBg]);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.present(),
      close: () => modalRef.current?.dismiss(),
    }));

    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={snapPoints || ['80%']}
        index={0}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        onChange={onChange}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: sheetBackgroundColor }}
        handleIndicatorStyle={{ backgroundColor: tokens.bottomSheetSeparator }}
      >
        <BottomSheetScrollView 
          style={{ flex: 1, paddingHorizontal: 20 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={{ 
            color: tokens.bottomSheetText, 
            fontSize: 28, 
            fontWeight: '700', 
            marginBottom: subtitle ? 8 : 24, 
            textAlign: 'center' 
          }}>
            {title}
          </Text>

          {/* Subtitle (optional) */}
          {subtitle && (
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 16, 
              textAlign: 'center', 
              opacity: 0.8,
              marginBottom: 24
            }}>
              {subtitle}
            </Text>
          )}

          {/* Content */}
          {children}

          {/* Bottom safe area padding */}
          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

BaseBottomSheet.displayName = 'BaseBottomSheet';

export default BaseBottomSheet;
