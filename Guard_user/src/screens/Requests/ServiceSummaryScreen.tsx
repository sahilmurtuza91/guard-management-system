import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useRequestLabel } from '../../hooks/useRequestLabel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';

interface SummaryData {
  guardName: string;
  guardAvatar: string;
  serviceType: string;
  site: string;
  date: string;
  duration: string;
  incidentsReported: number;
}

export const ServiceSummaryScreen: React.FC<ScreenProps<'ServiceSummary'>> = ({
  navigation,
  route,
}) => {
  const { requestId } = route.params;
  const requestLabel = useRequestLabel(requestId);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const request = res.data.data.request;
        const assignedGuard = request.assignedGuards?.[0]?.guard;
        setSummary({
          guardName: assignedGuard?.user?.name || 'Guard',
          guardAvatar: assignedGuard?.user?.avatarUrl || '',
          serviceType: request.serviceType || '',
          site: request.location?.address || '',
          date: request.date ? new Date(request.date).toDateString() : '',
          duration: request.durationHours ? `${request.durationHours}h` : '—',
          incidentsReported: request.incidentsReported || 0,
        });
      })
      .catch((error) => console.log('Service summary load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  if (isLoading || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Service Summary" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading summary..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Service Summary" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.completeBanner}>
          <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
          <Text style={styles.completeTitle}>Service Completed</Text>
          <Text style={styles.completeSubtitle}>{requestLabel}</Text>
        </View>

        <View style={[styles.card, styles.guardCard]}>
          <View style={styles.guardRow}>
            {summary.guardAvatar ? (
              <Image source={{ uri: resolveAssetUrl(summary.guardAvatar) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={22} color={COLORS.white} />
              </View>
            )}
            <View>
              <Text style={styles.guardName}>{summary.guardName}</Text>
              <Text style={styles.guardType}>{summary.serviceType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SummaryRow icon="location-outline" label="Site" value={summary.site} />
          <View style={styles.divider} />
          <SummaryRow icon="calendar-outline" label="Date" value={summary.date} />
          <View style={styles.divider} />
          <SummaryRow icon="time-outline" label="Total Duty Duration" value={summary.duration} />
          <View style={styles.divider} />
          <SummaryRow
            icon="warning-outline"
            label="Incidents Reported"
            value={String(summary.incidentsReported)}
          />
        </View>

        <PrimaryButton
          title="Rate & Review Service"
          onPress={() => navigation.navigate('RateReview', { requestId })}
          style={styles.rateBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={COLORS.primary} />
    <View style={styles.rowTextWrap}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

export default ServiceSummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40
  },
  completeBanner: {
    alignItems: 'center',
    marginBottom: 24
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 12
  },
  completeSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  guardCard: {
    marginBottom: 16
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  guardType: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 4
  },
  rowTextWrap: {
    flex: 1
  },
  rowLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12
  },
  rateBtn: {
    marginTop: 24
  },
});