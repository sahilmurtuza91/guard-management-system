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
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';

import { requestApi } from '../../api/endpoints';

interface RequestSummary {
  serviceType: string;
  dateTimeText: string;
  address: string;
  shiftText: string;
}

export const AssignmentReviewScreen: React.FC<ScreenProps<'AssignmentReview'>> = ({ route, navigation }) => {
  const { requestId, selectedGuards, selectedGuardDetails } = route.params;
  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      requestApi
        .getRequestDetails(requestId)
        .then((res) => {
          const r = res.data.data.request;
          setSummary({
            serviceType: r.serviceType || 'Guard Request',
            dateTimeText: new Date(r.date).toDateString(),
            address: r.location?.address || '',
            shiftText: `${r.startTime} - ${r.endTime} (${r.durationHours || 8} Hours)`,
          });
        })
        .catch((error) => console.log('Request summary load error: ', error));
    }, [requestId])
  );

  const handleConfirmAssignment = async () => {
    setIsSubmitting(true);
    try {
      const res = await requestApi.assignGuards(requestId, selectedGuards);
      const assignedCount = res.data.data.assignedCount;
      navigation.navigate('AssignmentSuccess', { requestId, assignedCount });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not assign guards. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Review & Confirm</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Selected Guards ({selectedGuards.length})</Text>
        </View>

        <View style={styles.guardCard}>
          {(selectedGuardDetails || []).map((guard, index) => (
            <View key={guard.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.guardRow}>
                <View style={styles.avatarBox}>
                  <Ionicons name="person" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guardName}>{guard.name}</Text>
                  <Text style={styles.guardSub}>{guard.detail}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Request Details</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryId}>{summary?.serviceType || 'Guard Request'}</Text>
          <Text style={styles.summaryText}>{summary?.dateTimeText || 'Loading...'}</Text>
          <Text style={styles.summaryLocation}>📍 {summary?.address || ''}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shift Timing</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.shiftRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.shiftText}>{summary?.shiftText || 'Loading...'}</Text>
          </View>
        </View>

        <PrimaryButton 
          title={isSubmitting ? 'Assigning...' : 'Confirm Assignment'} 
          onPress={handleConfirmAssignment} 
          isLoading={isSubmitting}
          style={styles.confirmBtn} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignmentReviewScreen;

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
  sectionHeader: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  guardCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  guardSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  summaryId: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryLocation: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shiftText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  confirmBtn: {
    marginTop: 24,
  },
});