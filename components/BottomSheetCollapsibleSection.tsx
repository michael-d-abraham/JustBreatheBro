import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from './Theme';

interface BottomSheetCollapsibleSectionProps {
  title: string;
  content: string | React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  /** Called when the section title row is pressed, before expand/collapse toggles. */
  onTitlePress?: () => void;
}

export default function BottomSheetCollapsibleSection({ 
  title, 
  content, 
  expanded, 
  onToggle,
  onTitlePress,
}: BottomSheetCollapsibleSectionProps) {
  const { tokens } = useTheme();

  return (
    <>
      <Pressable 
        onPress={() => {
          onTitlePress?.();
          onToggle();
        }} 
        style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingVertical: 12 
        }}
      >
        <Text style={{ 
          color: tokens.bottomSheetText, 
          fontSize: 20, 
          fontWeight: '700', 
          letterSpacing: 1 
        }}>
          {title}
        </Text>
        <Text style={{ 
          color: tokens.bottomSheetText, 
          fontSize: 20, 
          fontWeight: '300' 
        }}>
          {expanded ? '⌃' : '⌄'}
        </Text>
      </Pressable>
      {expanded && (
        <View style={{ marginBottom: 8 }}>
          {typeof content === 'string' ? (
            <Text style={{ 
              color: tokens.bottomSheetText, 
              fontSize: 15, 
              lineHeight: 22, 
              opacity: 0.85, 
            }}>
              {content}
            </Text>
          ) : (
            content
          )}
        </View>
      )}
    </>
  );
}
