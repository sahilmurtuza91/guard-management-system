import React, { useEffect, useState } from 'react';
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
import { Shift, setShifts } from '../../redux/shiftSlice';

import { guardApi } from '../../api/endpoints';
import { LoadingState } from '../../components/LoadingState';
import { findNonSerializableValue } from '@reduxjs/toolkit';

const TABS = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
type TabType = (typeof TABS)[number];

const mapBackendShift = (s: any): Shift => ({
  id: s._id,
  date: new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  timeRange: `${s.startTime} - ${s.endTime}`,
  duration: s.shiftType || 'General Shift',
  locationName: s.site?.name || 'Site',
  locationAddress: s.site?.address || '',
  shiftType: s.shiftType || 'General Shift',
  status: s.status,
  reportingTime: s.reportingTime || s.startTime,
  breakTime: s.breakTime || '',
  supervisorName: s.supervisorName || '',
  supervisorPhone: s.supervisorPhone || '',
});

export const MyShiftsScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState<TabType>('Active');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsloading] = useState(true);

  const shifts = useSelector((state: RootState) => state.shifts.shifts);

  const filteredShifts = shifts.filter(
    shift => shift.status === selectedTab
  );

  const loadShifts = async () => {
    try {
      const response = await guardApi.getShifts();
      const mapped = (response.data.data.shifts || []).map(mapBackendShift);
      dispatch(setShifts(mapped));
    } catch (error) {
      console.log('Shift laod error: ', error);
    } finally {
      setIsloading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadShifts();
  };

  const getStatusStyle = (status: Shift['status']) => {
    switch (status) {
      case 'Active':
        return {
          bg: COLORS.successLight,
          text: COLORS.success,
        };

      case 'Upcoming':
        return {
          bg: COLORS.infoLight,
          text: COLORS.info,
        };

      case 'Completed':
        return {
          bg: '#F1F5F9',
          text: COLORS.textSecondary,
        };

      case 'Cancelled':
        return {
          bg: COLORS.errorLight,
          text: COLORS.error,
        };
    }
  };

  const renderShift = ({ item }: { item: Shift }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.shiftCard}
        onPress={() =>
          navigation.navigate('ShiftDetails', {
            shiftId: item.id,
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateRow}>
            <View style={styles.calendarIconBg}>
              <Ionicons
                name="calendar"
                size={16}
                color={statusStyle.text}
              />
            </View>

            <View>
              <Text style={styles.dateText}>{item.date}</Text>

              <Text style={styles.timeRangeText}>
                {item.timeRange}
              </Text>
            </View>
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

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.locationTitle}>
              {item.locationName}
            </Text>

            <Text style={styles.shiftTypeText}>
              {item.shiftType}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Shifts</Text>

        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                selectedTab === tab && styles.activeTabBtn,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingState message='Loading your shifts...' />
      ) : (
        <FlatList
          data={filteredShifts}
          keyExtractor={item => item.id}
          renderItem={renderShift}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={COLORS.textMuted}
              />

              <Text style={styles.emptyTitle}>
                No {selectedTab} Shifts
              </Text>

              <Text style={styles.emptySubtitle}>
                You do not have any shifts scheduled in this category.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyShiftsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
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
    paddingVertical: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  shiftCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  calendarIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  timeRangeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  shiftTypeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});