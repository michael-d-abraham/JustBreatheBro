/**
 * Bottom Sheet Tokens - Strictly typed color tokens for bottom sheets.
 *
 * These tokens are INDEPENDENT from app theme colors and automatically
 * adapt to app mode (light/dark) since they are derived from the palette
 * inside ThemeProvider.
 *
 * NEVER use `tokens.sceneBackground`, `tokens.surface`, `tokens.accentPrimary`,
 * `tokens.accentMuted`, `tokens.textOnAccent`, or `tokens.borderSubtle`
 * inside bottom sheet components. Use only these four tokens.
 *
 * @see BaseBottomSheet.tsx for usage contract
 */
export type BottomSheetTokens = {
  /** Background color - palette surface */
  bottomSheetBg: any;
  /** Primary text color - palette textPrimary */
  bottomSheetText: any;
  /** Secondary/description text color - palette textSecondary */
  bottomSheetSecondaryText: any;
  /** Divider and handle indicator color - palette borderSubtle */
  bottomSheetSeparator: any;
};
