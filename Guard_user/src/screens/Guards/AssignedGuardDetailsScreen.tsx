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
  Linking,
  Platform,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';

import { requestApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';

interface GuardDetail {
  name: string;
  avatarUrl?: string;
  phone: string;
  experienceYears: number;
  isVerified: boolean;
  reportingTime: string;
}

export const AssignedGuardDetailsScreen: React.FC<
  ScreenProps<'AssignedGuardDetails'>
> = ({ navigation, route }) => {
  const requestId = route.params?.requestId;
  const [guard, setGuard] = useState<GuardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGuard = useCallback(() => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }
    requestApi
      .getRequestTracking(requestId)
      .then((res) => {
        const data = res.data.data;
        if (!data?.guard) {
          setGuard(null);
          return;
        }
        const reportingTime = data.shift
          ? `${new Date(data.shift.date).toDateString()}, ${data.shift.startTime}`
          : 'Not scheduled yet';
        setGuard({
          name: data.guard.name || 'Guard',
          avatarUrl: data.guard.avatarUrl,
          phone: data.guard.phone || '',
          experienceYears: data.guard.experienceYears || 0,
          isVerified: data.guard.isVerified || false,
          reportingTime,
        });
      })
      .catch((error) => console.log('Assigned guard load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      loadGuard();
    }, [loadGuard])
  );

  const handleMessageGuard = () => {
    if (guard?.phone) {
      Linking.openURL(`tel:${guard.phone}`);
    } else {
      Alert.alert('Unavailable', 'The guard contact number is not available right now.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Assigned Guard Details" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading guard details..." />
      </SafeAreaView>
    );
  }

  if (!guard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Assigned Guard Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Ionicons name="person-remove-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No guard assigned to this request yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Assigned Guard Details"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {guard.avatarUrl ? (
            <Image source={{ uri: resolveAssetUrl(guard.avatarUrl) }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.guardName}>{guard.name}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Experience</Text>
            <Text style={styles.rowValue}>{guard.experienceYears} Years</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone Number</Text>
            <Text style={styles.rowValue}>{guard.phone || 'Not shared'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>ID Proof</Text>
            {guard.isVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <Text style={styles.rowValue}>Pending Verification</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Reporting Time</Text>
            <Text style={styles.rowValue}>{guard.reportingTime}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Message Guard"
          onPress={handleMessageGuard}
          style={styles.messageBtn}
        />
        {/* FIX: U25 Request Replacement was a registered screen but never reachable from anywhere in the app */}
        <TouchableOpacity
          style={styles.replacementBtn}
          onPress={() => navigation.navigate('RequestReplacement', { requestId })}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color="#C2410C" />
          <Text style={styles.replacementBtnText}>Request Guard Replacement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignedGuardDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', fontWeight: '600' },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  guardName: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
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
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  messageBtn: { marginTop: 10 },
  replacementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  replacementBtnText: { fontSize: 13, fontWeight: '800', color: '#C2410C' },
});
