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
import { LoadingState } from '../../components/LoadingState';

import { guardManagementApi } from '../../api/endpoints';

interface ShiftUI {
  id: string;
  title: string;
  status: string;
}

export const ShiftHistoryScreen: React.FC<ScreenProps<'ShiftHistory'>> = ({ navigation, route }) => {
  const { guardId } = route.params;
  const [shifts, setShifts] = useState<ShiftUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShifts = useCallback(async () => {
    try {
      const res = await guardManagementApi.getShiftHistory(guardId);
      const shiftsList = res.data.data.shifts || [];

      setShifts(
        shiftsList.map((shift: any) => ({
          id: shift._id,
          title: `${shift.site?.name || 'Site'} • ${shift.date ? new Date(shift.date).toDateString() : ''} • ${shift.startTime || ''} - ${shift.endTime || ''}`,
          status: shift.status,
        })),
      );
    } catch (error) {
      console.log('Shift history load error: ', error);
    } finally {
      setIsLoading(false);
    }
  }, [guardId]);

  useFocusEffect(
    useCallback(() => {
      loadShifts();
    }, [loadShifts])
  );
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
        <Text style={styles.headerTitle}>Shift History</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState message="Loading shift history..." />
        ) : (
          <View style={styles.listContainer}>
            {shifts.map((item) => (
              <View key={item.id} style={styles.shiftCard}>
                <View style={styles.shiftLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shiftTitle}>{item.title}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftHistoryScreen;

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
  listContainer: {
    gap: 12,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
});