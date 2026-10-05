import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import {
  checkInDuty,
  checkOutDuty,
  updateLiveTimerTick,
  loadAttendance,
} from '../../redux/attendanceSlice';
import { getCurrentGuardLocation } from '../../utils/locationService';
import { guardApi } from '../../api/endpoints';
import { LoadingState } from '../../components/LoadingState';
import { emitGuardLocation } from '../../services/socket';
import { setNotifications } from '../../redux/notificationSlice';

import { DashboardHeader } from '../../components/DashboardHeader';
import { TodayDutyCard } from '../../components/TodayDutyCard';
import { SummaryCard } from '../../components/SummaryCard';
import { IncidentItemCard } from '../../components/IncidentItemCard';

interface DashboardScreenProps {
  navigation: any;
}

const formatWorkingHours = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(
    2,
    '0'
  )}m`;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  const {
    isCheckedIn,
    lastCheckInTimestamp,
    activeCheckInTime,
    activeLocation,
    todayStatus,
    accumulatedSeconds,
    activeShiftId,
  } = useSelector((state: RootState) => state.attendance);

  const user = useSelector((state: RootState) => state.auth.user);

  const unreadCount = useSelector((state: RootState) =>
    state.notifications.notifications.filter(
      notification => !notification.isRead
    ).length
  );

  const incidents = useSelector((state: RootState) => state.incidents.incidents);
  const latestIncident = incidents[0];

  const [formattedWorkingHours, setFormattedWorkingHours] = useState('00h 00m');
  const [isDutyLoading, setIsDutyLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const response = await guardApi.getDashboard();
        const data = response.data.data;
        if (!isMounted) return;

        setDashboardData(data);
        guardApi
          .getNotifications(true)
          .then((res) =>
            dispatch(
              setNotifications(
                (res.data.data.notifications || []).map((n: any) => ({
                  id: n._id,
                  title: n.title,
                  message: n.message,
                  timestamp: new Date(n.createdAt).toLocaleString(),
                  isRead: n.isRead,
                  category: n.category === 'Requests' ? 'General' : n.category,
                  targetScreen: n.targetScreen,
                  targetParams: n.targetParams,
                }))
              )
            )
          )
          .catch((error) => console.log('Notification load error:', error));

        dispatch(
          loadAttendance({
            isCheckedIn: data.checkInStatus === 'Checked In',
            checkInTimestamp: data.todayCheckInTime ? new Date(data.todayCheckInTime).getTime() : null,
            workingSeconds: data.todayWorkingSeconds || 0,
            todayStatus: data.todayStatus || undefined,
            shiftId: data.todayShift?._id || null,
          })
        );
      } catch (error) {
        console.log('Dashboard load error:', error);
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };
    loadDashboard();
    const unsubscribeFocus = navigation.addListener('focus', loadDashboard);
    return () => {
      isMounted = false;
      unsubscribeFocus();
    };
  }, [dispatch, navigation]);

  useEffect(() => {
    const updateTimeDisplay = () => {
      let totalSeconds = accumulatedSeconds || 0;

      if (isCheckedIn && lastCheckInTimestamp) {
        const sessionSeconds = Math.max(
          0,
          Math.floor((Date.now() - lastCheckInTimestamp) / 1000)
        );
        totalSeconds += sessionSeconds;
      }

      setFormattedWorkingHours(formatWorkingHours(totalSeconds));
    };

    updateTimeDisplay();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isCheckedIn) {
      intervalId = setInterval(() => {
        updateTimeDisplay();
        dispatch(updateLiveTimerTick());
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCheckedIn, lastCheckInTimestamp, accumulatedSeconds, dispatch]);

  useEffect(() => {
    if (!isCheckedIn || !activeShiftId) {
      return;
    }

    const pingLocation = async () => {
      try {
        const currentLocation = await getCurrentGuardLocation();
        const response = await guardApi.locationPing({
          shiftId: activeShiftId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.address,
        });
        if (response.data.data?.autoCheckedOut) {
          dispatch(checkOutDuty({ location: currentLocation }));
          Alert.alert(
            'Automatically Checked Out',
            'You were outside the site location for more than 2 minutes, so you have been automatically checked out.'
          );
        }
      } catch (error) {
        console.log('Location ping error:', error);
      }
    };

    const pingIntervalId = setInterval(pingLocation, 30000);
    return () => clearInterval(pingIntervalId);
  }, [isCheckedIn, activeShiftId, dispatch]);

  useEffect(() => {
    if (!isCheckedIn || !dashboardData?.todayShift) return;

    const shift = dashboardData.todayShift;

    const sendPing = async () => {
      try {
        const loc = await getCurrentGuardLocation();

        emitGuardLocation({
          guardProfileId: shift.guard,
          agencyId: shift.agency,
          clientId: shift.client || null,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      } catch (error) {
        console.log('Location ping error: ', error);
      }
    };

    sendPing();

    const pingInterval = setInterval(sendPing, 30000);

    return () => clearInterval(pingInterval);
  }, [isCheckedIn, dashboardData]);

  const handleDutyToggle = async () => {
    if (!activeShiftId) {
      Alert.alert('No Active Shift', 'You do not have any Active or upcoming shift. Please conatct to Agency.');
      return;
    }
    setIsDutyLoading(true);
    try {
      const currentLocation = await getCurrentGuardLocation();

      if (isCheckedIn) {
        const checkOutResponse = await guardApi.checkOut({
          shiftId: activeShiftId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.address,
        });
        // Updated: backend ka accumulated working time use karte hain
        dispatch(
          checkOutDuty({
            location: currentLocation,
            workingSeconds: checkOutResponse.data.data?.attendance?.workingSeconds,
          })
        );
      } else {
        const response = await guardApi.checkIn({
          shiftId: activeShiftId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.address,
        });
        const savedAttendance = response.data.data?.attendance;
        dispatch(
          checkInDuty({
            location: currentLocation,
            shiftId: activeShiftId,
            shiftName: dashboardData?.todayShift?.shiftType,
            status: savedAttendance?.status,
            checkInTimestamp: savedAttendance?.checkIn?.time ? new Date(savedAttendance.checkIn.time).getTime() : undefined,
            workingSeconds: savedAttendance?.workingSeconds,
          })
        );
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Location can't fetched. check your your GPS permission";
      Alert.alert('Check-In/Out Failed', message);
    } finally {
      setIsDutyLoading(false);
    }
  };

  const locationName =
    activeLocation?.city ||
    dashboardData?.todayShift?.site?.name ||
    'No site assigned';

  const locationAddress =
    activeLocation?.address ||
    dashboardData?.todayShift?.site?.address ||
    'Waiting for shift assignment';

  const shiftTiming = dashboardData?.todayShift
    ? `${dashboardData.todayShift.startTime} - ${dashboardData.todayShift.endTime}`
    : 'No shift scheduled today';

  const pendingTasksCount = dashboardData?.pendingTasks ?? 0;

  // Updated: hardcoded '01' hataya, backend count use hota hai
  const assignedShiftCount = String(dashboardData?.assignedShiftCount ?? 0).padStart(2, '0');

  const summaryMetrics = [
    {
      id: 'attendance',
      iconName: 'person',
      iconColor:
        todayStatus === 'Present'
          ? COLORS.success
          : todayStatus === 'Late'
            ? COLORS.warning
            : todayStatus === 'Absent'
              ? COLORS.error
              : COLORS.textMuted,
      title: todayStatus,
      subtitle: 'Attendance',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      id: 'working_hours',
      iconName: 'time',
      iconColor: '#3B82F6',
      title: formattedWorkingHours,
      subtitle: 'Working Hours',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      id: 'assigned_shift',
      iconName: 'calendar',
      iconColor: '#8B5CF6',
      title: assignedShiftCount,
      subtitle: 'Assigned Shift',
      onPress: () => navigation.navigate('Shifts'),
    },
    {
      id: 'pending_tasks',
      iconName: 'document-text',
      iconColor: '#F59E0B',
      title: String(pendingTasksCount).padStart(2, '0'),
      subtitle: 'Pending Tasks',
      onPress: () => navigation.navigate('Shifts'),
    },
  ];

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />

      <DashboardHeader
        name={user?.name || dashboardData?.guard?.name || 'Guard'}
        avatarUrl={user?.avatarUrl}
        unreadCount={unreadCount}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      {isPageLoading ? (
        <View style={styles.loadingWrapper}>
          <LoadingState message="Loading your dashboard..." fullScreen={false} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TodayDutyCard
            isCheckedIn={isCheckedIn}
            activeCheckInTime={activeCheckInTime}
            shiftTiming={shiftTiming}
            locationName={locationName}
            locationAddress={locationAddress}
            isLoading={isDutyLoading}
            onDutyToggle={handleDutyToggle}
            onLocationPress={() =>
              navigation.navigate('DutyLocationMap', { shiftId: activeShiftId || undefined })
            }
          />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            {summaryMetrics.map(item => (
              <View key={item.id} style={styles.gridItem}>
                <SummaryCard
                  iconName={item.iconName}
                  iconColor={item.iconColor}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                />
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Incidents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Incidents')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {latestIncident && (
            <IncidentItemCard
              title={latestIncident.title || latestIncident.incidentType}
              location={latestIncident.location}
              time={`${latestIncident.date}, ${latestIncident.time}`}
              status={latestIncident.status}
              onPress={() =>
                navigation.navigate('IncidentDetails', {
                  incidentId: latestIncident.id,
                })
              }
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: '#0F2042',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    minHeight: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 12,
  },
  gridItem: {
    width: '48%',
  },
});