import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useTheme } from './Theme';

export type SupportSheetHandle = {
  open: () => void;
  close: () => void;
};

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const SupportSheet = forwardRef<SupportSheetHandle, SupportSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.present();
      },
      close: () => modalRef.current?.dismiss(),
    }));

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
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: tokens.sceneBackground }}
        handleIndicatorStyle={{ backgroundColor: tokens.textOnAccent }}
      >
        <BottomSheetScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
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
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

SupportSheet.displayName = 'SupportSheet';

export default SupportSheet;
