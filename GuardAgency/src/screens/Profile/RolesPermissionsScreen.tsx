import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';

const PERMISSIONS_MATRIX = [
  { action: 'View Requests / Guards / Shifts', admin: true, manager: true, supervisor: true },
  { action: 'Assign Guards to Requests', admin: true, manager: true, supervisor: false },
  { action: 'Add / Edit Guards', admin: true, manager: true, supervisor: false },
  { action: 'Create / Cancel Shifts', admin: true, manager: true, supervisor: false },
  { action: 'Review Incidents', admin: true, manager: true, supervisor: true },
  { action: 'Manage Team Members', admin: true, manager: false, supervisor: false },
  { action: 'Edit Agency Profile', admin: true, manager: false, supervisor: false },
];

const PermissionDot: React.FC<{ allowed: boolean }> = ({ allowed }) => (
  <Ionicons
    name={allowed ? 'checkmark-circle' : 'close-circle'}
    size={18}
    color={allowed ? (COLORS.success || '#10B981') : (COLORS.textMuted || '#6B7280')}
  />
);

export const RolesPermissionsScreen: React.FC<any> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roles & Permissions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.note}>
          These three roles can log in to the Agency App — their respective access levels are detailed below.
        </Text>

        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { flex: 2, textAlign: 'left' }]}>Action</Text>
          <Text style={styles.headerCell}>Admin</Text>
          <Text style={styles.headerCell}>Manager</Text>
          <Text style={styles.headerCell}>Supervisor</Text>
        </View>

        <View style={styles.inlineCardNoPadding}>
          {PERMISSIONS_MATRIX.map((row, index) => (
            <View key={row.action}>
              <View style={styles.dataRow}>
                <Text style={[styles.actionText, { flex: 2 }]}>{row.action}</Text>
                <View style={styles.cell}>
                  <PermissionDot allowed={row.admin} />
                </View>
                <View style={styles.cell}>
                  <PermissionDot allowed={row.manager} />
                </View>
                <View style={styles.cell}>
                  <PermissionDot allowed={row.supervisor} />
                </View>
              </View>
              {index < PERMISSIONS_MATRIX.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RolesPermissionsScreen;

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
  note: { fontSize: 12, color: COLORS.textSecondary || '#4B5563', lineHeight: 18, marginBottom: 16 },
  headerRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  headerCell: { flex: 1, fontSize: 10, fontWeight: '800', color: COLORS.textMuted || '#6B7280', textAlign: 'center', textTransform: 'uppercase' },

  // Direct Card UI (noPadding style)
  inlineCardNoPadding: {
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

  dataRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  actionText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary || '#111827' },
  cell: { flex: 1, alignItems: 'center' },
  divider: { height: 1, backgroundColor: COLORS.borderLight || '#F3F4F6', marginLeft: 12 },
});