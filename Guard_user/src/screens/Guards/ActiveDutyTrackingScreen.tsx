import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';
import { onGuardLocationUpdate, removeGuardLocationListener } from '../../services/socket';
import { getAddressFromCoordinates } from '../../utils/locationService';

interface TrackingInfo {
  dutyTime: string;
  siteAddress: string;
  checkInDone: boolean;
  checkInTime: string | null;
  checkOutDone: boolean;
  checkOutTime: string | null;
  hasShift: boolean;
  guardProfileId: string | null;
}

interface LiveLocation {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt: number;
}

const formatTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

const formatSecondsAgo = (updatedAt: number) => {
  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
};

export const ActiveDutyTrackingScreen: React.FC<
  ScreenProps<'ActiveDutyTracking'>
> = ({ navigation, route }) => {
  const requestId = route.params?.requestId;
  const [info, setInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [, forceTick] = useState(0);
  const guardProfileIdRef = useRef<string | null>(null);
  const hasLiveLocationRef = useRef(false);

  const loadTracking = useCallback((isRefresh = false) => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }
    if (isRefresh) setIsRefreshing(true);
    requestApi
      .getRequestTracking(requestId)
      .then((res) => {
        const data = res.data.data;
        guardProfileIdRef.current = data.guard?.id || null;
        setInfo({
          dutyTime: data.shift ? `${data.shift.startTime} - ${data.shift.endTime}` : 'Not scheduled yet',
          siteAddress: data.site?.address || '',
          checkInDone: !!data.attendance?.checkIn?.time,
          checkInTime: formatTime(data.attendance?.checkIn?.time),
          checkOutDone: !!data.attendance?.checkOut?.time,
          checkOutTime: formatTime(data.attendance?.checkOut?.time),
          hasShift: !!data.shift,
          guardProfileId: data.guard?.id || null,
        });
        if (data.guard?.lastKnownLocation?.latitude && !hasLiveLocationRef.current) {
          const lkl = data.guard.lastKnownLocation;
          setLiveLocation({
            latitude: lkl.latitude,
            longitude: lkl.longitude,
            address: data.site?.address || '',
            updatedAt: lkl.updatedAt ? new Date(lkl.updatedAt).getTime() : Date.now(),
          });
        }
      })
      .catch((error) => console.log('Tracking load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      loadTracking();
    }, [loadTracking])
  );

  useEffect(() => {
    const handleLiveUpdate = async (payload: any) => {
      if (!payload?.guardProfileId || payload.guardProfileId !== guardProfileIdRef.current) return;
      let address = '';
      try {
        const result = await getAddressFromCoordinates(payload.latitude, payload.longitude);
        address = result.address;
      } catch (error) {
        console.log('Live location reverse-geocode error: ', error);
      }
      setLiveLocation({
        latitude: payload.latitude,
        longitude: payload.longitude,
        address,
        updatedAt: Date.now(),
      });
      hasLiveLocationRef.current = true;
    };

    onGuardLocationUpdate(handleLiveUpdate);
    return () => removeGuardLocationListener();
  }, []);

  useEffect(() => {
    const tickInterval = setInterval(() => forceTick((t) => t + 1), 5000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleOpenLiveLocationInMaps = () => {
    if (!liveLocation) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${liveLocation.latitude},${liveLocation.longitude}`);
  };

  const handleSOS = () => {
    navigation.navigate('SOS', { requestId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Active Duty Tracking" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading duty status..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Active Duty Tracking"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTracking(true)} />}
      >
        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {info?.checkInDone && !info?.checkOutDone ? 'Guard is on duty' : 'Awaiting guard check-in'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.mapCard}
          onPress={handleOpenLiveLocationInMaps}
          activeOpacity={liveLocation ? 0.8 : 1}
          disabled={!liveLocation}
        >
          <Ionicons name="navigate-circle-outline" size={40} color={COLORS.primary} />
          <Text style={styles.mapCardText}>
            {liveLocation ? 'Guard\'s Live Location' : 'Duty Site'}
          </Text>
          <Text style={styles.mapCardSubText}>
            {liveLocation?.address || info?.siteAddress || 'Site not assigned yet'}
          </Text>
          {liveLocation && (
            <View style={styles.liveMetaRow}>
              <Text style={styles.liveMetaText}>Updated {formatSecondsAgo(liveLocation.updatedAt)}</Text>
              <Text style={styles.liveMapLink}>Open in Maps</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Duty Time</Text>
            <Text style={styles.rowValue}>{info?.dutyTime}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check In</Text>
            <View style={info?.checkInDone ? styles.statusBadgeGreen : styles.statusBadgeYellow}>
              <Text style={info?.checkInDone ? styles.badgeTextGreen : styles.badgeTextYellow}>
                {info?.checkInDone ? 'Checked In' : 'Pending'}
              </Text>
            </View>
          </View>
          {info?.checkInTime && <Text style={styles.timeSubText}>{info.checkInTime}</Text>}

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check Out</Text>
            <View style={info?.checkOutDone ? styles.statusBadgeGreen : styles.statusBadgeYellow}>
              <Text style={info?.checkOutDone ? styles.badgeTextGreen : styles.badgeTextYellow}>
                {info?.checkOutDone ? 'Checked Out' : 'Pending'}
              </Text>
            </View>
          </View>
          {info?.checkOutTime && <Text style={styles.timeSubText}>{info.checkOutTime}</Text>}
        </View>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOS}
          activeOpacity={0.8}
        >
          <Ionicons name="warning-outline" size={20} color={COLORS.white} />
          <Text style={styles.sosButtonText}>Emergency / SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActiveDutyTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  liveText: { fontSize: 13, fontWeight: '800', color: '#166534' },
  mapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    padding: 16,
  },
  mapCardText: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginTop: 8 },
  mapCardSubText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  liveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  liveMetaText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  liveMapLink: { fontSize: 12, color: COLORS.primary, fontWeight: '800' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextGreen: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  statusBadgeYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextYellow: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  timeSubText: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  sosButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosButtonText: { fontSize: 14, fontWeight: '900', color: COLORS.white },
});
