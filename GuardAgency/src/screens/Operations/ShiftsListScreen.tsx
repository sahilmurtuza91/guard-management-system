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
  RefreshControl,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';

import { operationsApi } from '../../api/endpoints';

interface ShiftUI {
  id: string;
  title: string;
  time: string;
  guard: string;
  status: string;
}

const toShiftUI = (s: any): ShiftUI => ({
  id: s._id,
  title: `${s.site?.name || 'Site'} • ${s.shiftType || 'Shift'}`,
  time: `${s.startTime || ''} - ${s.endTime || ''}`,
  guard: s.guard?.user?.name || 'Unassigned',
  status: s.status,
});

export const ShiftsListScreen: React.FC<ScreenProps<any>> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shifts, setShifts] = useState<ShiftUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadShifts = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    operationsApi
      .getShifts()
      .then((res) => setShifts((res.data.data.shifts || []).map(toShiftUI)))
      .catch((error) => console.log('Shifts load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShifts();
    }, [loadShifts])
  );

  const filteredShifts = shifts.filter(
    (s) =>
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guard.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Text style={styles.headerTitle}>Shifts List</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateShift' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search shifts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading shifts..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadShifts(true)} />}
      >
        <View style={styles.listContainer}>
          {filteredShifts.map((shift) => (
            <TouchableOpacity 
              key={shift.id} 
              style={styles.shiftCard}
              onPress={() => navigation.navigate('ShiftDetails', { shiftId: shift.id })}
              activeOpacity={0.8}
            >
              <View style={styles.shiftLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftTitle}>{shift.title}</Text>
                  <Text style={styles.shiftTime}>{shift.time}</Text>
                  <Text style={styles.shiftGuard}>Guard: {shift.guard}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{shift.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ShiftsListScreen;

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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
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
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  shiftTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  shiftGuard: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
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