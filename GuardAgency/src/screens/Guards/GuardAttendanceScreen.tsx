import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';
import { guardManagementApi } from '../../api/endpoints';

interface LogUI {
  id: string;
  date: string;
  status: string;
}

const formatTime = (iso?: string) => {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const GuardAttendanceScreen: React.FC<ScreenProps<'GuardAttendance'>> = ({ navigation, route }) => {
  const { guardId } = route.params;

  const [logs, setLogs] = useState<LogUI[]>([]);
  const [counts, setCounts] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const response = await guardManagementApi.getAttendance(guardId);
        const records = response.data.data.attendance || [];
        const attendanceLogs = records.map((record: any) => ({
          id: record._id,
          date: `${record.date} • ${formatTime(
            record.checkIn?.time,
          )} - ${formatTime(record.checkOut?.time)}`,
          status: record.status,
        }));
        setLogs(attendanceLogs);
        setCounts({
          present: records.filter(
            (record: any) =>
              record.status === 'Present' ||record.status === 'Completed',
          ).length,
          absent: records.filter(
            (record: any) => record.status === 'Absent',
          ).length,
          late: records.filter(
            (record: any) => record.status === 'Late',
          ).length,
        });
      } catch (error) {
        console.log('Attendance load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendance();
  }, [guardId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Guard Attendance</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingState message="Loading attendance..." />
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: '#DCFCE7',
                    borderColor: '#BBF7D0',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.metricNumber,
                    { color: '#15803D' },
                  ]}
                >
                  {counts.present}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: '#166534' },
                  ]}
                >
                  Present
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: '#FEE2E2',
                    borderColor: '#FECACA',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.metricNumber,
                    { color: '#DC2626' },
                  ]}
                >
                  {counts.absent}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: '#991B1B' },
                  ]}
                >
                  Absent
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: '#FEF3C7',
                    borderColor: '#FDE68A',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.metricNumber,
                    { color: '#B45309' },
                  ]}
                >
                  {counts.late}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: '#92400E' },
                  ]}
                >
                  Late
                </Text>
              </View>
            </View>

            <View style={styles.listContainer}>
              {logs.map((item) => {
                const isPresent =
                  item.status === 'Present' ||
                  item.status === 'Completed';

                return (
                  <View
                    key={item.id}
                    style={styles.logCard}
                  >
                    <View style={styles.logLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={COLORS.primary}
                      />

                      <Text style={styles.logDate}>
                        {item.date}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isPresent
                          ? styles.presentBadge
                          : styles.absentBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isPresent
                            ? styles.presentText
                            : styles.absentText,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuardAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },

  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
  },

  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  listContainer: {
    gap: 12,
  },

  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },

  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  logDate: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  presentBadge: {
    backgroundColor: '#DCFCE7',
  },

  absentBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  presentText: {
    color: '#15803D',
  },

  absentText: {
    color: '#DC2626',
  },
});