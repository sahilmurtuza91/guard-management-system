import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';

import { requestApi } from '../../api/endpoints';

interface AssignedGuardUI {
  name: string;
  phone: string;
}

interface RequestDetail {
  status: string;
  dateTimeText: string;
  serviceType: string;
  requirementsSub: string;
  specialRequirements: string;
  clientName: string;
  clientPhone: string;
  additionalInstructions: string;
  assignedGuards: AssignedGuardUI[];
}

const REVIEW_STATUSES = ['Submitted', 'Under Review', 'Clarification Required'];
const ASSIGNED_STATUSES = ['Guard Assigned', 'Confirmed', 'Active', 'Completed'];
const CLOSED_STATUSES = ['Rejected', 'Cancelled by User', 'Cancelled by Agency', 'Expired'];

const ASSIGN_ONLY_STATUSES = ['Accepted', 'Replacement Requested'];

export const RequestDetailsScreen: React.FC<ScreenProps<'RequestDetails'>> = ({ route, navigation }) => {
  const { requestId } = route.params || { requestId: '' };
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetail = useCallback(() => {
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const r = res.data.data.request;
        setDetail({
          status: r.status,
          dateTimeText: `${new Date(r.date).toDateString()} • ${r.startTime} - ${r.endTime}`,
          serviceType: r.serviceType,
          requirementsSub: `${r.location?.address || ''} • ${r.guardsCount || 1} Guards • ${r.durationHours || 8} Hours`,
          specialRequirements: r.specialRequirements || 'N/A',
          clientName: r.client?.name || 'Client',
          clientPhone: r.client?.phone || '',
          additionalInstructions: r.additionalInstructions || 'No additional instructions provided.',
          assignedGuards: (r.assignedGuards || [])
            .map((a: any) => ({ name: a.guard?.user?.name, phone: a.guard?.user?.phone }))
            .filter((g: AssignedGuardUI) => !!g.name),
        });
      })
      .catch((error) => console.log('Request details load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  const handleAssignGuards = () => {
    navigation.navigate('AssignGuards', { requestId });
  };

  const handleClarification = () => {
    navigation.navigate('ClarificationScreen', { requestId, mode: 'clarify' });
  };

  const handleReject = () => {
    navigation.navigate('ClarificationScreen', { requestId, mode: 'reject' });
  };

  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading request..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View>
            <Text style={styles.reqId}>{detail.serviceType || 'Guard Request'}</Text>
            <Text style={styles.reqDateTime}>{detail.dateTimeText}</Text>
          </View>
          <View style={[styles.statusBadge, CLOSED_STATUSES.includes(detail.status) && styles.statusBadgeClosed]}>
            <Text style={[styles.statusText, CLOSED_STATUSES.includes(detail.status) && styles.statusTextClosed]}>{detail.status}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Guard Requirements</Text>
          </View>
          <Text style={styles.valueText}>{detail.serviceType}</Text>
          <Text style={styles.subValueText}>{detail.requirementsSub}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Special Requirements</Text>
          </View>
          <Text style={styles.valueText}>{detail.specialRequirements}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Client Information</Text>
          </View>
          <Text style={styles.valueText}>{detail.clientName}</Text>
          <Text style={styles.subValueText}>{detail.clientPhone}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Additional Instructions</Text>
          </View>
          <Text style={styles.valueText}>{detail.additionalInstructions}</Text>
        </View>

        {REVIEW_STATUSES.includes(detail.status) && (
          <>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.clarifyBtn} onPress={handleClarification} activeOpacity={0.8}>
                <Text style={styles.clarifyText}>Clarification</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} activeOpacity={0.8}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton 
              title="Assign Guards" 
              onPress={handleAssignGuards} 
              style={styles.assignPrimaryBtn} 
            />
          </>
        )}

        {ASSIGNED_STATUSES.includes(detail.status) && (
          <View style={styles.assignedCard}>
            <View style={styles.assignedHeaderRow}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text style={styles.assignedHeaderText}>
                {detail.assignedGuards.length > 0
                  ? `${detail.assignedGuards.length} Guard${detail.assignedGuards.length === 1 ? '' : 's'} Assigned`
                  : 'Guard Assigned'}
              </Text>
            </View>
            {detail.assignedGuards.map((g, index) => (
              <View key={index} style={styles.assignedGuardRow}>
                <Ionicons name="person-circle-outline" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.assignedGuardName}>{g.name}</Text>
                  {!!g.phone && <Text style={styles.assignedGuardPhone}>{g.phone}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {ASSIGN_ONLY_STATUSES.includes(detail.status) && (
          <PrimaryButton 
            title={detail.status === 'Replacement Requested' ? 'Assign Replacement Guard' : 'Assign Guards'} 
            onPress={handleAssignGuards} 
            style={styles.assignPrimaryBtn} 
          />
        )}

        {CLOSED_STATUSES.includes(detail.status) && (
          <View style={styles.closedCard}>
            <Ionicons name="close-circle" size={20} color="#DC2626" />
            <Text style={styles.closedText}>This request is {detail.status.toLowerCase()} and no further action is needed.</Text>
          </View>
        )}
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
  topCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  reqId: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  reqDateTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subValueText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  clarifyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarifyText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rejectBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  assignPrimaryBtn: {
    marginTop: 12,
  },
  statusBadgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusTextClosed: {
    color: '#DC2626',
  },
  assignedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  assignedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  assignedHeaderText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#15803D',
  },
  assignedGuardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  assignedGuardName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  assignedGuardPhone: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  closedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
});