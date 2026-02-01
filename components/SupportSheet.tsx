import { useApp } from '@/contexts/themeContext';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { useTheme } from './Theme';

export type SupportSheetHandle = {
  open: () => void;
  close: () => void;
};

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
  customHeader?: {
    title: string;
    subtitle?: string;
  };
}

// Peace Stones images with their filenames
const PEACE_STONES_IMAGES = [
  { source: require('../assets/images/BackGrounds/PeaceStones/8b5ab95f17ebce31ce33d4477b0a2394.jpg'), filename: '8b5ab95f17ebce31ce33d4477b0a2394.jpg' },
  { source: require('../assets/images/BackGrounds/PeaceStones/bda498c860d011ed38fe8877fe894261.jpg'), filename: 'bda498c860d011ed38fe8877fe894261.jpg' },
  { source: require('../assets/images/BackGrounds/PeaceStones/ebee70bef4e53a0035348e1d01263c5f.jpg'), filename: 'ebee70bef4e53a0035348e1d01263c5f.jpg' },
  { source: require('../assets/images/BackGrounds/PeaceStones/forstjpg.jpg'), filename: 'forstjpg.jpg' },
];

const SupportSheet = forwardRef<SupportSheetHandle, SupportSheetProps>(
  ({ onChange, onDismiss, customHeader }, ref) => {
    const { tokens } = useTheme();
    const { backgroundImage, setBackgroundImage } = useApp();
    const modalRef = useRef<BottomSheetModal>(null);
    const [selectedOption, setSelectedOption] = useState<'peace-stones' | 'zen' | 'avatar' | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setSelectedOption(null); // Reset selection when opening
        modalRef.current?.present();
      },
      close: () => modalRef.current?.dismiss(),
    }));

    // Reset selection when sheet is dismissed
    const handleDismiss = () => {
      setSelectedOption(null);
      onDismiss?.();
    };

    const handleYouTubePress = () => {
      Linking.openURL('https://www.youtube.com/watch?v=8WPaO819-_g');
    };

    const handlePrivacyPolicyPress = () => {
      Linking.openURL('https://michael-d-abraham.github.io/brethbro-privacy/privacy.html');
    };

    const Separator = () => (
      <View style={{ height: 1, backgroundColor: tokens.textOnAccent, opacity: 0.2, marginVertical: 16 }} />
    );

    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={['80%']}
        index={0}
        enablePanDownToClose
        enableOverDrag={false}
        enableDynamicSizing={false}
        onChange={onChange}
        onDismiss={handleDismiss}
        backgroundStyle={{ backgroundColor: tokens.sceneBackground }}
        handleIndicatorStyle={{ backgroundColor: tokens.textOnAccent }}
      >
        <BottomSheetScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
          {customHeader ? (
            // Custom content with 3 stacked buttons
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              {/* Header */}
              <View style={{ marginBottom: 40, alignItems: 'center' }}>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 28, 
                  fontWeight: '700',
                  marginBottom: 8
                }}>
                  {customHeader.title}
                </Text>
                {customHeader.subtitle && (
                  <Text style={{ 
                    color: tokens.textOnAccent, 
                    fontSize: 16,
                    textAlign: 'center',
                    opacity: 0.8
                  }}>
                    {customHeader.subtitle}
                  </Text>
                )}
              </View>

              {/* Stacked Buttons */}
              <View style={{ width: '100%', alignItems: 'center', gap: 16 }}>
                <Pressable
                  style={{
                    backgroundColor: tokens.accentMuted,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 32,
                    width: '80%',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: tokens.borderSubtle,
                  }}
                  onPress={() => {
                    setSelectedOption(selectedOption === 'peace-stones' ? null : 'peace-stones');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 18, 
                      fontWeight: '600' 
                    }}>
                      Peace Stones
                    </Text>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 16,
                      opacity: 0.7
                    }}>
                      {selectedOption === 'peace-stones' ? '⌃' : '⌄'}
                    </Text>
                  </View>
                </Pressable>

                {/* Peace Stones Dropdown */}
                {selectedOption === 'peace-stones' && (
                  <View style={{
                    width: '80%',
                    backgroundColor: tokens.accentMuted,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: tokens.borderSubtle,
                    marginTop: -8,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      justifyContent: 'center',
                    }}>
                      {PEACE_STONES_IMAGES.map((image, index) => {
                        const isSelected = backgroundImage === image.filename;
                        return (
                          <Pressable
                            key={index}
                            style={{
                              width: '45%',
                              aspectRatio: 1,
                              borderRadius: 12,
                              overflow: 'hidden',
                              borderWidth: isSelected ? 3 : 1,
                              borderColor: isSelected ? tokens.accentPrimary : tokens.borderSubtle,
                              position: 'relative',
                            }}
                            onPress={async () => {
                              const newValue = isSelected ? null : image.filename;
                              await setBackgroundImage(newValue);
                            }}
                          >
                            <Image
                              source={image.source}
                              style={{
                                width: '100%',
                                height: '100%',
                              }}
                              resizeMode="cover"
                            />
                            {isSelected && (
                              <View style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: tokens.accentPrimary,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                                <Text style={{
                                  color: tokens.textOnAccent,
                                  fontSize: 16,
                                  fontWeight: '700',
                                }}>
                                  ✓
                                </Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                <Pressable
                  style={{
                    backgroundColor: tokens.accentMuted,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 32,
                    width: '80%',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: tokens.borderSubtle,
                  }}
                  onPress={() => {
                    setSelectedOption(selectedOption === 'zen' ? null : 'zen');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 18, 
                      fontWeight: '600' 
                    }}>
                      Zen
                    </Text>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 16,
                      opacity: 0.7
                    }}>
                      {selectedOption === 'zen' ? '⌃' : '⌄'}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: tokens.accentMuted,
                    borderRadius: 16,
                    paddingVertical: 20,
                    paddingHorizontal: 32,
                    width: '80%',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: tokens.borderSubtle,
                  }}
                  onPress={() => {
                    setSelectedOption(selectedOption === 'avatar' ? null : 'avatar');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 18, 
                      fontWeight: '600' 
                    }}>
                      Avatar
                    </Text>
                    <Text style={{ 
                      color: tokens.textOnAccent, 
                      fontSize: 16,
                      opacity: 0.7
                    }}>
                      {selectedOption === 'avatar' ? '⌃' : '⌄'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          ) : (
            // Default Support content
            <>
              {/* Header */}
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 28, 
                  fontWeight: '700',
                  marginBottom: 8
                }}>
                  Support
                </Text>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 16,
                  textAlign: 'center',
                  opacity: 0.8
                }}>
                  Breath through your nose homie
                </Text>
              </View>

              {/* About Section */}
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: 12,
                letterSpacing: 1
              }}>
                ABOUT BREATH
              </Text>
              <View style={{ 
                backgroundColor: tokens.surface, 
                borderRadius: 12, 
                padding: 16,
                marginBottom: 20
              }}>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 14, 
                  lineHeight: 22 
                }}>
                  Breathing is cool. All the cool kids do it. 
                </Text>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  marginTop: 12,
                  opacity: 0.7
                }}>
                  Version 1.0.1
                </Text>
              </View>

              <Separator />

              {/* Contact Section */}
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: 12,
                letterSpacing: 1
              }}>
                GET IN TOUCH
              </Text>
              <Pressable
                style={{
                  backgroundColor: tokens.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 20
                }}
                onPress={handleYouTubePress}
              >
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 16, 
                  fontWeight: '600' 
                }}>
                  📧 Email Support
                </Text>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  marginTop: 4,
                  opacity: 0.8
                }}>
                  hello@breathbro.app
                </Text>
              </Pressable>

              <Separator />

              {/* Feedback Section */}
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: 12,
                letterSpacing: 1
              }}>
                WE'D LOVE YOUR FEEDBACK
              </Text>
              <Pressable
                style={{
                  backgroundColor: tokens.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 20
                }}
                onPress={handleYouTubePress}
              >
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 16, 
                  fontWeight: '600' 
                }}>
                  Send Feedback
                </Text>
                <Text style={{ 
                  color: tokens.textOnAccent, 
                  fontSize: 12, 
                  marginTop: 4,
                  opacity: 0.8,
                  textAlign: 'center'
                }}>
                  Help us improve by sharing your thoughts
                </Text>
              </Pressable>

              <Separator />

              {/* Legal Section */}
              <Text style={{ 
                color: tokens.textOnAccent, 
                fontSize: 18, 
                fontWeight: '700',
                marginBottom: 12,
                letterSpacing: 1
              }}>
                LEGAL
              </Text>
              <View style={{ gap: 12, marginBottom: 20 }}>
                <Pressable
                  style={{
                    backgroundColor: tokens.surface,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={handlePrivacyPolicyPress}
                >
                  <Text style={{ color: tokens.textOnAccent, fontSize: 16 }}>
                    Privacy Policy
                  </Text>
                  <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>
                    →
                  </Text>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: tokens.surface,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={handleYouTubePress}
                >
                  <Text style={{ color: tokens.textOnAccent, fontSize: 16 }}>
                    Terms of Service
                  </Text>
                  <Text style={{ color: tokens.textOnAccent, fontSize: 18 }}>
                    →
                  </Text>
                </Pressable>
              </View>

              <View style={{ height: 40 }} />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

SupportSheet.displayName = 'SupportSheet';

export default SupportSheet;

