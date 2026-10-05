import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import {
  AttendanceRecord,
  updateLiveTimerTick,
  getTodayDateKey,
  setHistory,
} from '../../redux/attendanceSlice';

import { guardApi } from '../../api/endpoints';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

const TABS = ['Day', 'Month', 'Year'] as const;
type TabType = (typeof TABS)[number];

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AttendanceHistoryScreen: React.FC<{ navigation: any }> = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState<TabType>('Month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    history,
    isCheckedIn,
    lastCheckInTimestamp,
    accumulatedSeconds,
  } = useSelector((state: RootState) => state.attendance);

  const mapBackendRecord = (
    attendance: any
  ): AttendanceRecord => ({
    id: attendance._id,
    dateKey: attendance.date,

    date: new Date(attendance.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),

    shiftName: attendance.shift?.shiftType
      ? `${attendance.shift.shiftType} (${attendance.shift.startTime} - ${attendance.shift.endTime})`
      : 'Shift',

    checkInTime: attendance.checkIn?.time
      ? new Date(attendance.checkIn.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '--',

    checkOutTime: attendance.checkOut?.time
      ? new Date(attendance.checkOut.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '--',

    workingHours: attendance.workingSeconds
      ? `${String(Math.floor(attendance.workingSeconds / 3600)).padStart(2, '0')}h ${String(
        Math.floor((attendance.workingSeconds % 3600) / 60)
      ).padStart(2, '0')}m`
      : '--',

    status: attendance.status,
    locationAddress: attendance.checkIn?.address || '',

    latitude: attendance.checkIn?.latitude,
    longitude: attendance.checkIn?.longitude,
  });

  const loadHistory = async (month?: string) => {
    try {
      const response = await guardApi.getAttendanceHistory(month);
      const mapped = (response.data.data.history || []).map(mapBackendRecord);
      dispatch(setHistory(mapped));
    } catch (error) {
      console.log("Attendance history load error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    loadHistory(selectedTab === 'Month' ? monthKey : undefined);
  }, [currentDate, selectedTab]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isCheckedIn) {
      timer = setInterval(() => {
        dispatch(updateLiveTimerTick());
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isCheckedIn, dispatch]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(updateLiveTimerTick());
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    loadHistory(selectedTab === 'Month' ? monthKey : undefined);
  };

  const goPrevious = () => {
    if (selectedTab === 'Day') {
      setCurrentDate(
        previousDate =>
          new Date(
            previousDate.getFullYear(),
            previousDate.getMonth(),
            previousDate.getDate() - 1,
          ),
      );
    } else if (selectedTab === 'Month') {
      setCurrentDate(
        previousDate =>
          new Date(
            previousDate.getFullYear(),
            previousDate.getMonth() - 1,
            1,
          ),
      );
    } else {
      setCurrentDate(
        previousDate =>
          new Date(
            previousDate.getFullYear() - 1,
            previousDate.getMonth(),
            1,
          ),
      );
    }
  };

  const goNext = () => {
    if (selectedTab === 'Day') {
      setCurrentDate(
        nextDate =>
          new Date(
            nextDate.getFullYear(),
            nextDate.getMonth(),
            nextDate.getDate() + 1,
          ),
      );
    } else if (selectedTab === 'Month') {
      setCurrentDate(
        nextDate =>
          new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            1,
          ),
      );
    } else {
      setCurrentDate(
        nextDate =>
          new Date(
            nextDate.getFullYear() + 1,
            nextDate.getMonth(),
            1,
          ),
      );
    }
  };

  const getStatusStyle = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return {
          bg: COLORS.successLight,
          text: COLORS.success,
        };

      case 'Late':
        return {
          bg: COLORS.warningLight,
          text: COLORS.warning,
        };

      case 'Absent':
      default:
        return {
          bg: COLORS.errorLight,
          text: COLORS.error,
        };
    }
  };

  const filteredRecords = history.filter(item => {
    if (!item.dateKey) {
      return true;
    }

    const [year, month, day] = item.dateKey.split('-').map(Number);
    if (selectedTab === 'Day') {
      return (
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth() + 1 &&
        day === currentDate.getDate()
      );
    }
    if (selectedTab === 'Year') {
      return year === currentDate.getFullYear();
    }
    return (
      year === currentDate.getFullYear() &&
      month === currentDate.getMonth() + 1
    );
  });

  const getDateLabel = () => {
    if (selectedTab === 'Day') {
      return currentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    if (selectedTab === 'Year') {
      return `${currentDate.getFullYear()}`;
    }

    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };
  const renderAttendance = ({ item }: { item: AttendanceRecord }) => {
    const statusStyle = getStatusStyle(item.status);

    let workingHours = item.workingHours;
    const isToday =
      item.dateKey === getTodayDateKey() ||
      item.date.startsWith('Today');

    if (isToday && isCheckedIn && lastCheckInTimestamp) {
      const currentSeconds = Math.max(
        0,
        Math.floor((Date.now() - lastCheckInTimestamp) / 1000),
      );

      const totalSeconds =
        (accumulatedSeconds || 0) + currentSeconds;

      const hours = Math.floor(totalSeconds / 3600);

      const minutes = Math.floor(
        (totalSeconds % 3600) / 60,
      );

      workingHours = `${String(hours).padStart(2, '0')}h ${String(
        minutes,
      ).padStart(2, '0')}m`;
    }

    return (
      <View style={styles.attendanceCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>
              {item.date}
            </Text>

            <Text style={styles.shiftText}>
              {item.shiftName}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusStyle.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusStyle.text,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>
              Check In:
            </Text>

            <Text style={styles.timeValue}>
              {item.checkInTime}
            </Text>
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>
              Check Out:
            </Text>

            <Text style={styles.timeValue}>
              {item.checkOutTime}
            </Text>
          </View>

          <View style={styles.hoursBox}>
            <Text
              style={[
                styles.hoursValue,
                item.status === 'Late' && {
                  color: COLORS.warning,
                },
              ]}
            >
              {workingHours}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          Attendance
        </Text>

        <View style={styles.tabContainer}>
          {TABS.map(tab => {
            const isSelected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  isSelected && styles.activeTabButton,
                ]}
                onPress={() => setSelectedTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.dateBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.arrowButton}
          onPress={goPrevious}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.dateLabel}>
          {getDateLabel()}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.arrowButton}
          onPress={goNext}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.id}
        renderItem={renderAttendance}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={44}
              color={COLORS.textMuted}
            />

            <Text style={styles.emptyTitle}>
              No Records Found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AttendanceHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  attendanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  shiftText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hoursBox: {
    alignItems: 'flex-end',
  },
  hoursValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
}); 