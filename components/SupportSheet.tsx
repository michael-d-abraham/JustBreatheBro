import React, { forwardRef, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import BaseBottomSheet, { BaseBottomSheetHandle } from './BaseBottomSheet';
import BottomSheetCollapsibleSection from './BottomSheetCollapsibleSection';
import BottomSheetDivider from './BottomSheetDivider';
import BottomSheetRow from './BottomSheetRow';
import { useTheme } from './Theme';

export type SupportSheetHandle = BaseBottomSheetHandle;

interface SupportSheetProps {
  onChange?: (index: number) => void;
  onDismiss?: () => void;
}

const SupportSheet = forwardRef<SupportSheetHandle, SupportSheetProps>(
  ({ onChange, onDismiss }, ref) => {
    const { tokens } = useTheme();
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [getInTouchExpanded, setGetInTouchExpanded] = useState(false);
    const [feedbackExpanded, setFeedbackExpanded] = useState(false);
    const [supportTipExpanded, setSupportTipExpanded] = useState(false);
    const [legalExpanded, setLegalExpanded] = useState(false);

    const SUPPORT_VIDEO_URL = 'https://www.youtube.com/watch?v=8WPaO819-_g';

    const handleSupportVideoPress = () => {
      Linking.openURL(SUPPORT_VIDEO_URL);
    };

    const handlePrivacyPolicyPress = () => {
      Linking.openURL('https://michael-d-abraham.github.io/brethbro-privacy/privacy.html');
    };

    const handleTermsPress = () => {
      Linking.openURL('https://www.youtube.com/watch?v=8WPaO819-_g');
    };

    const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/michaeldabraham';

    const handleBuyMeACoffeePress = () => {
      Linking.openURL(BUY_ME_A_COFFEE_URL);
    };

    return (
      <BaseBottomSheet
        ref={ref}
        title="Support"
        subtitle="Breath through your nose homie"
        onChange={onChange}
        onDismiss={onDismiss}
      >
        {/* About Section */}
        <BottomSheetCollapsibleSection
          title="ABOUT BREATH"
          expanded={aboutExpanded}
          onToggle={() => setAboutExpanded(!aboutExpanded)}
          content={
            <View>
              <Text style={{ 
                color: tokens.bottomSheetText, 
                fontSize: 14, 
                lineHeight: 22,
                marginBottom: 8
              }}>
                Breathing is cool. All the cool kids do it.
              </Text>
              <Text style={{ 
                color: tokens.bottomSheetSecondaryText, 
                fontSize: 12,
                opacity: 0.7,
              }}>
                Version 1.0.1
              </Text>
            </View>
          }
        />

        <BottomSheetDivider />

        {/* Get In Touch Section */}
        <BottomSheetCollapsibleSection
          title="GET IN TOUCH"
          expanded={getInTouchExpanded}
          onToggle={() => setGetInTouchExpanded(!getInTouchExpanded)}
          onTitlePress={handleSupportVideoPress}
          content={
            <BottomSheetRow
              title="📧 Email Support"
              subtitle="hello@breathbro.app"
              onPress={handleSupportVideoPress}
            />
          }
        />

        <BottomSheetDivider />

        {/* Feedback Section */}
        <BottomSheetCollapsibleSection
          title="WE'D LOVE YOUR FEEDBACK"
          expanded={feedbackExpanded}
          onToggle={() => setFeedbackExpanded(!feedbackExpanded)}
          onTitlePress={handleSupportVideoPress}
          content={
            <BottomSheetRow
              title="Send Feedback"
              subtitle="Help us improve by sharing your thoughts"
              onPress={handleSupportVideoPress}
            />
          }
        />

        <BottomSheetDivider />

        {/* Tip / support */}
        <BottomSheetCollapsibleSection
          title="SUPPORT"
          expanded={supportTipExpanded}
          onToggle={() => setSupportTipExpanded(!supportTipExpanded)}
          content={
            <BottomSheetRow
              title="☕ Buy me a coffee"
              subtitle="buymeacoffee.com/michaeldabraham"
              onPress={handleBuyMeACoffeePress}
            />
          }
        />

        <BottomSheetDivider />

        {/* Legal Section */}
        <BottomSheetCollapsibleSection
          title="LEGAL"
          expanded={legalExpanded}
          onToggle={() => setLegalExpanded(!legalExpanded)}
          content={
            <View>
              <BottomSheetRow
                title="Privacy Policy"
                onPress={handlePrivacyPolicyPress}
              />
              <BottomSheetRow
                title="Terms of Service"
                onPress={handleTermsPress}
              />
            </View>
          }
        />
      </BaseBottomSheet>
    );
  }
);

SupportSheet.displayName = 'SupportSheet';

export default SupportSheet;
