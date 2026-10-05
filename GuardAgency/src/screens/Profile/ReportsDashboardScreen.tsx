import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { LoadingState } from '../../components/LoadingState';
import { useFocusEffect } from '@react-navigation/native';

import { agencyApi } from '../../api/endpoints';

const now = new Date();
const MONTH_PERIOD = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const QUARTER_PERIOD = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;

const REPORTS = [
  { id: 'rep1', title: 'Monthly Attendance Report', period: MONTH_PERIOD, icon: 'calendar-outline' },
  { id: 'rep2', title: 'Incident Summary Report', period: MONTH_PERIOD, icon: 'warning-outline' },
  { id: 'rep3', title: 'Shift Completion Report', period: QUARTER_PERIOD, icon: 'checkmark-done-outline' },
  { id: 'rep4', title: 'Guard Performance Report', period: MONTH_PERIOD, icon: 'stats-chart-outline' },
];

export const ReportsDashboardScreen: React.FC<any> = ({ navigation }) => {
  const [stats, setStats] = useState({ totalShifts: 0, completedShifts: 0, cancelledShifts: 0, incidentsResolved: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      agencyApi
        .getReports()
        .then((res) => {
          const { shifts, incidents } = res.data.data;
          setStats({
            totalShifts: shifts.total,
            completedShifts: shifts.completed,
            cancelledShifts: shifts.cancelled,
            incidentsResolved: incidents.resolved,
          });
        })
        .catch((error) => console.log('Reports load error: ', error))
        .finally(() => setIsLoading(false));
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState message="Loading reports..." />
        ) : (
          <View style={styles.statsGrid}>
            <StatBox label="Total Shifts" value={stats.totalShifts} color={COLORS.info || '#3B82F6'} />
            <StatBox label="Completed" value={stats.completedShifts} color={COLORS.success || '#10B981'} />
            <StatBox label="Cancelled" value={stats.cancelledShifts} color={COLORS.error || '#EF4444'} />
            <StatBox label="Incidents Resolved" value={stats.incidentsResolved} color={COLORS.warning || '#F59E0B'} />
          </View>
        )}

        <Text style={styles.sectionLabel}>Available Reports</Text>
        {REPORTS.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={[styles.inlineCard, styles.reportCard]}
            onPress={() => navigation.navigate('ReportDetails', { reportId: report.id })}
            activeOpacity={0.8}
          >
            <View style={styles.reportRow}>
              <View style={styles.reportIconWrap}>
                <Ionicons name={report.icon as any} size={20} color={COLORS.primary || '#2563EB'} />
              </View>
              <View style={styles.reportTextWrap}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportPeriod}>{report.period}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted || '#6B7280'} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default ReportsDashboardScreen;

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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statBox: {
    width: '47%',
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.background || '#F9FAFB',
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary || '#4B5563', fontWeight: '600', marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted || '#6B7280', marginBottom: 12, textTransform: 'uppercase' },

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
  reportCard: { marginBottom: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight || '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTextWrap: { flex: 1 },
  reportTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary || '#111827' },
  reportPeriod: { fontSize: 11, color: COLORS.textMuted || '#6B7280', marginTop: 2 },
});