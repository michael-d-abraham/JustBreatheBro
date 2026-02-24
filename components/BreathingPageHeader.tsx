import React, { RefObject, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SupportSheetHandle } from './SupportSheet';
import { useWallpaperForeground } from './Theme';

interface BreathingPageHeaderProps {
  supportSheetRef: RefObject<SupportSheetHandle | null>;
  onSupportPress: () => void;
  onCirclePress?: () => void;
  onInfoLibraryPress?: () => void;
}

export default function BreathingPageHeader({ 
  supportSheetRef,
  onSupportPress,
  onCirclePress,
  onInfoLibraryPress,
}: BreathingPageHeaderProps) {
  const wallpaperFg = useWallpaperForeground();
  const insets = useSafeAreaInsets();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const styles = StyleSheet.create({
    circleIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: wallpaperFg,
      backgroundColor: 'transparent',
    },
    heartIcon: {
      fontSize: 32,
      color: wallpaperFg,
    },
    dropdown: {
      position: 'absolute',
      top: insets.top + 48,
      right: 16,
      minWidth: 120,
      zIndex: 20,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    dropdownItemLast: {
    },
    dropdownItemText: {
      color: wallpaperFg,
      fontSize: 16,
      fontWeight: '500',
    },
  });

  const handleHeartPress = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemPress = (item: 'Love' | 'Benefits' | 'Support') => {
    setIsDropdownOpen(false);
    if (item === 'Support') {
      onSupportPress();
    } else if (item === 'Benefits' && onInfoLibraryPress) {
      onInfoLibraryPress();
    }
    // Love can be handled later if needed
  };

  return (
    <>
      {/* Backdrop to close dropdown when tapping outside */}
      {isDropdownOpen && (
        <Pressable
          onPress={() => setIsDropdownOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 15,
          }}
        />
      )}

      {/* Circle Button - Top Left */}
      <Pressable 
        onPress={onCirclePress || onSupportPress} 
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          padding: 8,
          zIndex: 10,
        }}
      >
        <View style={styles.circleIcon} />
      </Pressable>

      {/* Heart Button - Top Right */}
      <Pressable 
        onPress={handleHeartPress} 
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: 16,
          padding: 8,
          zIndex: 10,
        }}
      >
        <Text style={styles.heartIcon}>♡</Text>
      </Pressable>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <View style={styles.dropdown}>
          <Pressable 
            onPress={() => handleMenuItemPress('Love')}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownItemText}>Love</Text>
          </Pressable>
          <Pressable 
            onPress={() => handleMenuItemPress('Benefits')}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownItemText}>Benefits</Text>
          </Pressable>
          <Pressable 
            onPress={() => handleMenuItemPress('Support')}
            style={[styles.dropdownItem, styles.dropdownItemLast]}
          >
            <Text style={styles.dropdownItemText}>Support</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
