import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';

const FAQS = [
  {
    q: 'How do I add a new guard?',
    a: 'Go to the Guards tab -> tap "Add Guard" to create a new guard record. You can add documents and availability later.',
  },
  {
    q: 'Why does the request show "Under Review" after assigning a guard?',
    a: 'If the client requested modifications after assignment, the system automatically marks it under review until approved.',
  },
  {
    q: 'What should I do in case of a critical incident?',
    a: 'Open the Incident Details screen and tap "Escalate" - this will immediately notify senior management.',
  },
  {
    q: 'How do I control team member access permissions?',
    a: 'Go to Profile -> Roles & Permissions to view and manage access for each role (Admin/Manager/Supervisor).',
  },
];

export const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:9999900000')} activeOpacity={0.75}>
            <Ionicons name="call" size={22} color={COLORS.primary || '#2563EB'} />
            <Text style={styles.contactLabel}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:support@guardapp.com')}
            activeOpacity={0.75}
          >
            <Ionicons name="mail" size={22} color={COLORS.primary || '#2563EB'} />
            <Text style={styles.contactLabel}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQS.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={item.q}
              style={[styles.inlineCard, styles.faqCard]}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted || '#6B7280'} />
              </View>
              {isExpanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white || '#FFFFFF',
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary || '#111827' },

  scrollContent: { padding: 16, paddingBottom: 32 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: COLORS.accentLight || '#EFF6FF',
  },
  contactLabel: { fontSize: 12, fontWeight: '800', color: COLORS.primary || '#2563EB' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted || '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  
  inlineCard: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqCard: { marginBottom: 8, padding: 16 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary || '#111827', marginRight: 8 },
  faqAnswer: { fontSize: 12, color: COLORS.textSecondary || '#4B5563', marginTop: 8, lineHeight: 18 },
});