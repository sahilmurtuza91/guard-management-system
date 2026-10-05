import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, Alert, TouchableOpacity, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { LoadingState } from '../../components/LoadingState';

import { agencyApi } from '../../api/endpoints';

const REPORT_TITLES: Record<string, string> = {
  rep1: 'Monthly Attendance Report',
  rep2: 'Incident Summary Report',
  rep3: 'Shift Completion Report',
  rep4: 'Guard Performance Report',
};

export const ReportDetailsScreen: React.FC<any> = ({ navigation, route }) => {
  const { reportId } = route.params || { reportId: 'rep1' };

  const [rows, setRows] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    agencyApi
      .getReports()
      .then((res) => {
        const { shifts, incidents } = res.data.data;
        const pct = (part: number, whole: number) => (whole ? ` (${Math.round((part / whole) * 100)}%)` : '');
        setRows([
          { label: 'Total Shifts Scheduled', value: String(shifts.total) },
          { label: 'Shifts Completed', value: `${shifts.completed}${pct(shifts.completed, shifts.total)}` },
          { label: 'Shifts Cancelled', value: `${shifts.cancelled}${pct(shifts.cancelled, shifts.total)}` },
          { label: 'Total Incidents', value: String(incidents.total) },
          { label: 'Incidents Resolved', value: `${incidents.resolved}${pct(incidents.resolved, incidents.total)}` },
        ]);
      })
      .catch((error) => console.log('Report load error: ', error))
      .finally(() => setIsLoading(false));
  }, [reportId]);

  const handleExport = (format: 'PDF' | 'CSV') => {
    Alert.alert('Export Unavailable', `${format} export feature is currently unavailable on the server.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{REPORT_TITLES[reportId] || 'Report Details'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState message="Loading report..." />
        ) : (
          <View style={styles.inlineCard}>
            {rows.map((row, index) => (
              <View key={row.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
                {index < rows.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Export</Text>
        <View style={styles.exportRow}>
          <View style={{ flex: 1 }}>
            <OutlineButton title="Export as CSV" onPress={() => handleExport('CSV')} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Export as PDF" onPress={() => handleExport('PDF')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportDetailsScreen;

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
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 12, color: COLORS.textSecondary || '#4B5563', fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary || '#111827' },
  divider: { height: 1, backgroundColor: COLORS.borderLight || '#F3F4F6' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted || '#6B7280', marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  exportRow: { flexDirection: 'row', gap: 12 },
});