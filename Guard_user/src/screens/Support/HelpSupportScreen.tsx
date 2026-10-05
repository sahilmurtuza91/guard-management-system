import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';

const FAQS = [
  {
    q: 'How long does it take to get a guard assigned after hiring?',
    a: 'Normally the agency assigns a guard within 30 minutes to 2 hours. If it is urgent, contact the agency directly by call.',
  },
  {
    q: 'Can I change the assigned guard?',
    a: 'Yes, use "Request Guard Replacement" from the Request Details screen. The request goes to the agency with an urgent flag.',
  },
  {
    q: 'How is payment handled?',
    a: 'Payment is settled directly with the agency. An invoice is sent after the service is confirmed.',
  },
  {
    q: 'What should I do in an emergency?',
    a: 'Use the "Emergency / SOS" button on the Active Duty Tracking screen. An alert with your location is sent to the agency immediately.',
  },
];

export const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Help & Support" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:9999900000')} activeOpacity={0.75}>
            <Ionicons name="call" size={22} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:contact@secureshield.com')}
            activeOpacity={0.75}
          >
            <Ionicons name="mail" size={22} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQS.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={item.q}
              style={styles.faqCard}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </View>
              {isExpanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
            </TouchableOpacity>
          );
        })}

        <PrimaryButton
          title="Raise a Service Issue"
          onPress={() => navigation.navigate('RaiseService')}
          style={styles.raiseBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: 24, paddingBottom: 40 },
  contactRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.accentLight,
  },
  contactLabel: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    padding: 20,
  },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginRight: 8 },
  faqAnswer: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, lineHeight: 18 },
  raiseBtn: { marginTop: 20 },
});