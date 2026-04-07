import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from './Theme';

interface BackButtonProps {
  onPress: () => void;
  /** Optional layout override (e.g. align in a header row). */
  style?: StyleProp<ViewStyle>;
}

/** App-wide back control: chevron, matches Scenes / breathing navigation affordances. */
export default function BackButton({ onPress, style }: BackButtonProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }, style]}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Ionicons name="chevron-back" size={28} color={tokens.textOnAccent} />
    </Pressable>
  );
}
