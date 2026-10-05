import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/them';
import { RootState } from '../../app/store';
import { DashboardHeader } from '../../components/DashboardHeader';
import { ActiveRequestCard } from '../../components/ActiveRequestCard';
import { LoadingState } from '../../components/LoadingState';

import { requestApi, userApi } from '../../api/endpoints';
import { setRequests, GuardRequestItem } from '../../redux/requestSlice';

interface DashboardScreenProps {
  navigation: any;
}

const mapBAckendRequest = (r: any): GuardRequestItem => ({
  id: r._id,
  serviceType: r.serviceType,
  purpose: r.purpose || '',
  shiftType: r.shiftType,
  duration: `${r.durationHours || 8} Hours`,
  date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  timeSlot: `${r.startTime} - ${r.endTime}`,
  guardsCount: r.guardsCount,
  status: r.status,
  location: r.location?.address || '',
  assignedGuard: r.assignedGuards?.[0]?.guard
    ? {
      id: r.assignedGuards[0].guard._id,
      name: r.assignedGuards[0].guard.user?.name || '',
      phone: r.assignedGuards[0].guard.user?.phone || '',
      photo: r.assignedGuards[0].guard.user?.avatarUrl || '',
      experienceYears: r.assignedGuards[0].guard.experienceYears || 0,
      idProofVerified: r.assignedGuards[0].guard.isVerified || false,
    }
    : undefined,
})

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state as any).auth?.user);
  const requests = useSelector((state: RootState) => (state as any).requests?.requests || []);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    requestApi
      .getMyRequests()
      .then((res) => dispatch(setRequests((res.data.data.requests || []).map(mapBAckendRequest))))
      .catch((error) => console.log("Dashboard load error: ", error))
      .finally(() => setIsLoading(false));

    userApi
      .getNotifications()
      .then((res) => {
        const list = res.data.data.notifications || [];
        setHasUnread(list.some((n: any) => !n.isRead));
      })
      .catch((error) => console.log('Notifications check error: ', error));
  }, [dispatch]);

  const activeRequest = requests.find(
    (r: any) =>
      r.status === 'Under Review' ||
      r.status === 'Guard Assigned' ||
      r.status === 'Active' ||
      r.status === 'Submitted'
  ) || null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        {...(Platform.OS === 'android' ? { backgroundColor: '#0B1936' } : {})}
      />

      <DashboardHeader
        name={user?.name || 'Guest'}
        avatarUrl={user?.avatarUrl}
        onNotificationPress={() => navigation.navigate('NotificationsTab')}
        hasUnreadNotifications={hasUnread}
      />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <LoadingState message="Loading your dashboard..." fullScreen={false} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.hireBanner}
            onPress={() => navigation.navigate('GuardCategory')}
            activeOpacity={0.88}
          >
            <View style={styles.hireLeft}>
              <Text style={styles.hireTitle}>Hire a Guard</Text>
              <Text style={styles.hireSub}>
                Book verified security guards for your safety.
              </Text>
            </View>
            <View style={styles.hireArrow}>
              <Ionicons name="arrow-forward" size={20} color="#0B1936" />
            </View>
          </TouchableOpacity>

          <ActiveRequestCard
            request={activeRequest}
            onPress={() =>
              navigation.navigate('RequestDetails', { requestId: activeRequest?.id })
            }
          />

          <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
              <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Verified Security Standards</Text>
              <Text style={styles.infoDesc}>
                All deployed guards undergo thorough background checks, ID verification, and professional training.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1936',
    paddingTop: 5,
  },

  loadingWrap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: '100%',
  },
  hireBanner: {
    backgroundColor: '#0F2042',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  hireLeft: {
    flex: 1,
    paddingRight: 10,
  },
  hireTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  hireSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  hireArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  infoIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2042',
  },
  infoDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
});