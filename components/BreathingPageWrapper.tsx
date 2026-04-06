import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from './Theme';

interface BreathingPageWrapperProps {
  children: React.ReactNode[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export default function BreathingPageWrapper({ 
  children, 
  initialPage = 1,
  onPageChange 
}: BreathingPageWrapperProps) {
  const { tokens } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const screenWidth = Dimensions.get('window').width;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / screenWidth);
    if (page !== currentPage) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.sceneBackground,
    },
    scrollView: {
      flex: 1,
    },
    page: {
      width: screenWidth,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {children.map((child, index) => (
          <View key={index} style={styles.page}>
            {child}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
