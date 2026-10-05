import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { Linking } from 'react-native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';

interface RequestDetail {
  status: string;
  dateTime: string;
  guardsInfo: string;
  address: string;
  contactPerson: string;
  contactNumber?: string;
  serviceType: string;
  hasAssignedGuard: boolean;
  isDutyActive: boolean;
  isTerminal: boolean;
}

const GUARD_ASSIGNED_STATUSES = ['Guard Assigned', 'Confirmed', 'Active', 'Completed'];
const TERMINAL_STATUSES = ['Completed', 'Rejected', 'Cancelled by User', 'Cancelled by Agency', 'Expired'];
const STATUS_BANNER_STYLE: Record<string, { bg: string; border: string; label: string; value: string }> = {
  'Completed': { bg: '#DCFCE7', border: '#BBF7D0', label: '#15803D', value: '#16A34A' },
  'Rejected': { bg: '#FEE2E2', border: '#FCA5A5', label: '#991B1B', value: '#DC2626' },
  'Cancelled by User': { bg: '#FEE2E2', border: '#FCA5A5', label: '#991B1B', value: '#DC2626' },
  'Cancelled by Agency': { bg: '#FEE2E2', border: '#FCA5A5', label: '#991B1B', value: '#DC2626' },
  'Expired': { bg: '#FEE2E2', border: '#FCA5A5', label: '#991B1B', value: '#DC2626' },
  'Active': { bg: '#EFF6FF', border: '#BFDBFE', label: '#1D4ED8', value: '#2563EB' },
  'Guard Assigned': { bg: '#EFF6FF', border: '#BFDBFE', label: '#1D4ED8', value: '#2563EB' },
  'Confirmed': { bg: '#EFF6FF', border: '#BFDBFE', label: '#1D4ED8', value: '#2563EB' },
};
const DEFAULT_BANNER_STYLE = { bg: '#FEF3C7', border: '#FDE68A', label: '#92400E', value: '#D97706' };

export const RequestDetailsScreen: React.FC<ScreenProps<'RequestDetails'>> = ({
  navigation,
  route,
}) => {
  const requestId = route.params?.requestId;
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetails = useCallback(() => {
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const r = res.data.data.request;
        const dateStr = r.date ? new Date(r.date).toDateString() : '';
        setDetail({
          status: r.status,
          dateTime: `${dateStr}, ${r.startTime || ''} - ${r.endTime || ''}`,
          guardsInfo: `${r.guardsCount || 1} Guard${(r.guardsCount || 1) > 1 ? 's' : ''}${r.durationHours ? ` • ${r.durationHours} Hours Shift` : ''}`,
          address: r.location?.address || '',
          contactPerson: `${r.contactPerson || ''}${r.contactNumber ? ` (${r.contactNumber})` : ''}`,
          serviceType: r.serviceType || '',
          hasAssignedGuard: GUARD_ASSIGNED_STATUSES.includes(r.status) && !!r.assignedGuards?.length,
          isDutyActive: r.status === 'Active',
          isTerminal: TERMINAL_STATUSES.includes(r.status),
        });
      })
      .catch((error) => console.log('Request details load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const handleModify = () => {
    navigation.navigate('ModifyRequest', { requestId });
  };

  const handleCancel = () => {
    navigation.navigate('CancelRequest', { requestId });
  };

  const handleViewGuard = () => {
    navigation.navigate('AssignedGuardDetails', { requestId });
  };

  const handleTrackDuty = () => {
    navigation.navigate('ActiveDutyTracking', { requestId });
  };

  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Request Details" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading request..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title={detail.serviceType || 'Request Details'} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[
          styles.statusBanner,
          {
            backgroundColor: (STATUS_BANNER_STYLE[detail.status] || DEFAULT_BANNER_STYLE).bg,
            borderColor: (STATUS_BANNER_STYLE[detail.status] || DEFAULT_BANNER_STYLE).border,
          },
        ]}>
          <View>
            <Text style={[styles.bannerTitle, { color: (STATUS_BANNER_STYLE[detail.status] || DEFAULT_BANNER_STYLE).label }]}>Request Status</Text>
            <Text style={[styles.bannerStatus, { color: (STATUS_BANNER_STYLE[detail.status] || DEFAULT_BANNER_STYLE).value }]}>{detail.status}</Text>
          </View>
          <TouchableOpacity
            style={styles.timelineBtn}
            onPress={() => navigation.navigate('RequestStatusTimeline', { requestId })}
            activeOpacity={0.8}
          >
            <Text style={styles.timelineBtnText}>View Status Timeline</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Date & Time</Text>
              <Text style={styles.rowValue}>{detail.dateTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="people-outline" size={18} color={COLORS.primary} />
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Guards Required</Text>
              <Text style={styles.rowValue}>{detail.guardsInfo}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Location</Text>
              <Text style={styles.rowValue}>{detail.address}</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.address)}`)
                }
              >
                <Text style={styles.mapLinkText}>View on Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Contact Person</Text>
              <Text style={styles.rowValue}>{detail.contactPerson}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Service Type</Text>
              <Text style={styles.rowValue}>{detail.serviceType}</Text>
            </View>
          </View>
        </View>

        {detail.hasAssignedGuard && (
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={handleViewGuard} activeOpacity={0.8}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkRowText}>View Assigned Guard</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            {detail.isDutyActive && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.linkRow} onPress={handleTrackDuty} activeOpacity={0.8}>
                  <Ionicons name="navigate-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.linkRowText}>Track Active Duty</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </>
            )}
            {detail.status === 'Completed' && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => navigation.navigate('ServiceSummary', { requestId })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.linkRowText}>View Service Summary</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={styles.actionRow}>
          {!detail.isTerminal && (
            <>
              <TouchableOpacity style={styles.modifyBtn} onPress={handleModify} activeOpacity={0.8}>
                <Text style={styles.modifyBtnText}>Modify Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel Request</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bannerTitle: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  bannerStatus: { fontSize: 16, fontWeight: '900', color: '#D97706', marginTop: 2 },
  timelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  timelineBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  mapLinkText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  linkRowText: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  actionRow: { flexDirection: 'row', gap: 12 },
  modifyBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modifyBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '800', color: '#DC2626' },
});