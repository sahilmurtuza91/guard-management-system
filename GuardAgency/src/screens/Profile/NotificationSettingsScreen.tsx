import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, Switch, Alert, TouchableOpacity, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';

const SETTINGS_CONFIG = [
  { id: 'newRequests', icon: 'document-text-outline', title: 'New Guard Requests', sub: 'Receive alerts when a new request comes from the User App' },
  { id: 'checkInOut', icon: 'time-outline', title: 'Check-In / Check-Out', sub: 'Alerts when a guard checks in or checks out of duty' },
  { id: 'incidents', icon: 'warning-outline', title: 'Incident Reports', sub: 'Instant notification whenever a guard reports an incident' },
  { id: 'criticalOnly', icon: 'alert-circle-outline', title: 'Critical Incidents Only (SMS)', sub: 'SMS alerts sent only for Critical priority incidents' },
];

export const NotificationSettingsScreen: React.FC<any> = ({ navigation }) => {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    newRequests: true,
    checkInOut: true,
    incidents: true,
    criticalOnly: true,
  });

  const toggle = (id: string) => setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    Alert.alert('Saved', 'Notification preferences updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inlineCard}>
          {SETTINGS_CONFIG.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon as any} size={18} color={COLORS.primary || '#2563EB'} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.sub}>{item.sub}</Text>
                </View>
                <Switch
                  value={settings[item.id]}
                  onValueChange={() => toggle(item.id)}
                  trackColor={{ false: COLORS.border || '#E5E7EB', true: '#BFDBFE' }}
                  thumbColor={settings[item.id] ? COLORS.primary || '#2563EB' : COLORS.textMuted || '#6B7280'}
                />
              </View>
              {index < SETTINGS_CONFIG.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <PrimaryButton title="Save Preferences" onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

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
    overflow: 'hidden',
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accentLight || '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary || '#111827' },
  sub: { fontSize: 11, color: COLORS.textSecondary || '#4B5563', marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.borderLight || '#F3F4F6', marginLeft: 16 },
  saveBtn: { marginTop: 16 },
});