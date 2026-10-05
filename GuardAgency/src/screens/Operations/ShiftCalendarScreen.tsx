import React, { useCallback, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';

import { operationsApi } from '../../api/endpoints';

interface ShiftUI {
  id: string;
  title: string;
  time: string;
  guard: string;
  date: string | null;
  siteName: string;
  shiftType: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const today = new Date();

export const ShiftCalendarScreen: React.FC<ScreenProps<'ShiftCalendar'>> = ({ navigation }) => {
  const [shifts, setShifts] = useState<ShiftUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [viewedMonth, setViewedMonth] = useState(today.getMonth());
  const [viewedYear, setViewedYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchShifts = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    operationsApi
      .getShifts()
      .then((res) => {
        const list = res.data.data.shifts || [];
        setShifts(
          list.map((s: any) => ({
            id: s._id,
            title: `${s.site?.name || 'Site'} • ${s.shiftType || 'Shift'}`,
            time: `${s.startTime || ''} - ${s.endTime || ''}`,
            guard: s.guard?.user?.name || 'Unassigned',
            date: s.date || null,
            siteName: s.site?.name || 'Site Name',
            shiftType: s.shiftType || 'Standard',
          }))
        );
      })
      .catch((error) => console.log('Calendar shifts load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShifts();
    }, [fetchShifts])
  );

  const goToPrevMonth = () => {
    setSelectedDay(null);
    if (viewedMonth === 0) {
      setViewedMonth(11);
      setViewedYear((y) => y - 1);
    } else {
      setViewedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setSelectedDay(null);
    if (viewedMonth === 11) {
      setViewedMonth(0);
      setViewedYear((y) => y + 1);
    } else {
      setViewedMonth((m) => m + 1);
    }
  };

  const daysInMonth = useMemo(() => {
    return new Date(viewedYear, viewedMonth + 1, 0).getDate();
  }, [viewedYear, viewedMonth]);

  const startOffset = useMemo(() => {
    const firstDayIndex = new Date(viewedYear, viewedMonth, 1).getDay();
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  }, [viewedYear, viewedMonth]);

  const isCurrentMonthView = viewedMonth === today.getMonth() && viewedYear === today.getFullYear();

  const shiftsMapByDay = useMemo(() => {
    const map: { [day: number]: number } = {};
    shifts.forEach((s) => {
      if (!s.date) return;
      const d = new Date(s.date);
      if (d.getMonth() === viewedMonth && d.getFullYear() === viewedYear) {
        const dayNum = d.getDate();
        map[dayNum] = (map[dayNum] || 0) + 1;
      }
    });
    return map;
  }, [shifts, viewedMonth, viewedYear]);

  const visibleShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (!s.date) return true;
      const d = new Date(s.date);
      const matchesMonth = d.getMonth() === viewedMonth && d.getFullYear() === viewedYear;
      if (!matchesMonth) return false;
      if (selectedDay !== null) {
        return d.getDate() === selectedDay;
      }
      return true;
    });
  }, [shifts, viewedMonth, viewedYear, selectedDay]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Shift Calendar</Text>
          <Text style={styles.headerSub}>Manage & assign guard shifts</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateShift' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchShifts(true)} />}
      >
        <View style={styles.calendarCard}>
          <View style={styles.calMonthRow}>
            <TouchableOpacity style={styles.navBtn} onPress={goToPrevMonth} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.calMonthText}>{`${MONTH_NAMES[viewedMonth]} ${viewedYear}`}</Text>

            <TouchableOpacity style={styles.navBtn} onPress={goToNextMonth} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayGrid}>
            {WEEK_DAYS.map((dayName) => (
              <Text key={dayName} style={styles.weekdayText}>{dayName}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {[...Array(startOffset)].map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyDayCell} />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const isToday = isCurrentMonthView && dayNum === today.getDate();
              const isSelected = selectedDay === dayNum;
              const hasShiftsCount = shiftsMapByDay[dayNum] || 0;

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedDayCell,
                  ]}
                  onPress={() => setSelectedDay(isSelected ? null : dayNum)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      isToday && styles.todayCellText,
                      isSelected && styles.selectedDayCellText,
                    ]}
                  >
                    {dayNum}
                  </Text>

                  {hasShiftsCount > 0 && (
                    <View
                      style={[
                        styles.shiftIndicatorDot,
                        isSelected && { backgroundColor: COLORS.white },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDay !== null 
              ? `Shifts for ${MONTH_NAMES[viewedMonth]} ${selectedDay}`
              : `Shifts in ${MONTH_NAMES[viewedMonth]} ${viewedYear}`
            }
          </Text>
          {selectedDay !== null && (
            <TouchableOpacity onPress={() => setSelectedDay(null)}>
              <Text style={styles.clearFilterText}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <LoadingState message="Loading shifts..." />
        ) : visibleShifts.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Ionicons name="calendar-clear-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyMonthText}>
              No shifts scheduled for {selectedDay ? `${MONTH_NAMES[viewedMonth]} ${selectedDay}` : `${MONTH_NAMES[viewedMonth]} ${viewedYear}`}.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {visibleShifts.map((shift) => (
              <TouchableOpacity 
                key={shift.id} 
                style={styles.shiftCard}
                onPress={() => navigation.navigate('ShiftDetails', { shiftId: shift.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.siteInfoRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.siteNameText} numberOfLines={1}>
                      {shift.siteName}
                    </Text>
                  </View>
                  <View style={styles.shiftTypeTag}>
                    <Text style={styles.shiftTypeText}>{shift.shiftType}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.timeBox}>
                    <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.timeText}>{shift.time}</Text>
                  </View>

                  <View style={styles.guardContainer}>
                    <View style={styles.guardAvatar}>
                      <Ionicons name="person" size={12} color={COLORS.primary} />
                    </View>
                    <Text style={styles.guardNameText} numberOfLines={1}>
                      {shift.guard}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  calMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calMonthText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 38,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
    marginVertical: 2,
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
  },
  dayCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  todayCellText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  selectedDayCellText: {
    color: COLORS.white,
    fontWeight: '900',
  },
  shiftIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyStateBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyMonthText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  /* IMPROVED SHIFT LIST CARD STYLES */
  listContainer: {
    gap: 12,
  },
  shiftCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  siteInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  siteNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  shiftTypeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shiftTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  guardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  guardAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    maxWidth: 110,
  },
});