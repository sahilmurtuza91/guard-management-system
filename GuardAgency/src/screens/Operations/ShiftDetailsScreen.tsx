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

import { operationsApi } from '../../api/endpoints';

interface ShiftDetail {
  title: string;
  dateText: string;
  status: string;
  guardName: string;
  timing: string;
  location: string;
}

export const ShiftDetailsScreen: React.FC<ScreenProps<'ShiftDetails'>> = ({ route, navigation }) => {
  const { shiftId } = route.params;
  const [shift, setShift] = useState<ShiftDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      operationsApi
        .getShiftDetails(shiftId)
        .then((res) => {
          const s = res.data.data.shift;
          setShift({
            title: `${s.site?.name || 'Site'} • ${s.shiftType || 'Shift'}`,
            dateText: s.date ? new Date(s.date).toDateString() : '',
            status: s.status || 'Scheduled',
            guardName: s.guard?.user?.name || 'Unassigned',
            timing: `${s.startTime || ''} - ${s.endTime || ''}`,
            location: s.site?.address || 'No location provided',
          });
        })
        .catch((error) => console.log('Shift details load error: ', error))
        .finally(() => setIsLoading(false));
    }, [shiftId])
  );

  const handleCancelShift = () => {
    navigation.navigate('EditCancelShift' as any, { shiftId });
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('active') || s.includes('ongoing') || s.includes('scheduled')) {
      return { bg: '#DCFCE7', text: '#15803D' };
    }
    if (s.includes('completed') || s.includes('done')) {
      return { bg: '#EFF6FF', text: '#1D4ED8' };
    }
    return { bg: '#FEF2F2', text: '#DC2626' };
  };

  if (isLoading || !shift) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading shift details..." />
      </SafeAreaView>
    );
  }

  const statusColors = getStatusStyle(shift.status);

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
          <Ionicons name="arrow-back" size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Details</Text>
        <Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <Text style={styles.shiftId}>{shift.dateText}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {shift.status}
              </Text>
            </View>
          </View>
          <Text style={styles.shiftTitle}>{shift.title}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SHIFT INFORMATION</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={16} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Assigned Guard</Text>
              <Text style={styles.infoValue}>{shift.guardName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Timing</Text>
              <Text style={styles.infoValue}>{shift.timing}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0, alignItems: 'flex-start' }]}>
            <View style={[styles.iconContainer, { marginTop: 2 }]}>
              <Ionicons name="location-outline" size={16} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{shift.location}</Text>
            </View>
          </View>
        </View>

        <PrimaryButton 
          title="Edit / Cancel Shift" 
          onPress={handleCancelShift} 
          style={styles.cancelBtn} 
          textStyle={{ color: '#DC2626', fontWeight: '600', fontSize: 14 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftDetailsScreen;

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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shiftId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  shiftTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 18,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
  },
});