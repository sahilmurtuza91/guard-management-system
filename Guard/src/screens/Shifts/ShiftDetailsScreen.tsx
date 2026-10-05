import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import { PrimaryButton } from '../../components/PrimaryButton';

import { LoadingState } from '../../components/LoadingState';

import { guardApi } from '../../api/endpoints';
import { Shift } from '../../redux/shiftSlice';

interface Props {
  navigation: any;
  route: any;
}

export const ShiftDetailsScreen = ({ navigation, route }: Props) => {
  const id = route.params?.shiftId || 'null';
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    guardApi
      .getShiftDetails(id)
      .then((res) => {
        const s = res.data.data.shift;
        setShift({
          id: s._id,
          date: new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeRange: `${s.startTime} - ${s.endTime}`,
          duration: s.shiftType || 'General Shift',
          locationName: s.site?.name || 'Site',
          locationAddress: s.site?.address || '',
          shiftType: s.shiftType || 'General Shift',
          status: s.status,
          reportingTime: s.reportingTime || s.startTime,
          breakTime: s.breakTime || '',
          supervisorName: s.supervisorName || '',
          supervisorPhone: s.supervisorPhone || '',
        });
      })
      .catch((error) => console.log('Shift details load error: ', error))
      .finally(() => setIsLoading(false));
  }, [id]);

  const getDirections = () => {
    if (!shift) {
      return;
    }
    navigation.navigate('DutyLocationMap', {
      shiftId: shift.id,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
        />
        <LoadingState message='Loading shift details...' />
      </SafeAreaView>
    );
  }

  if (!shift) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
        />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} pointerEvents="none">Shift Details</Text>
        </View>
        <View style={styles.scrollContent}>
          <Text style={styles.value}>Shift not found.</Text>
        </View>
      </SafeAreaView>
    );
  }
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          bg: COLORS.successLight,
          text: COLORS.success,
        };
      case 'Upcoming':
        return {
          bg: COLORS.infoLight,
          text: COLORS.info,
        };
      case 'Completed':
        return {
          bg: '#F1F5F9',
          text: COLORS.textSecondary,
        };
      case 'Cancelled':
        return {
          bg: COLORS.errorLight,
          text: COLORS.error,
        };
      default:
        return {
          bg: '#F1F5F9',
          text: COLORS.textSecondary,
        };
    }
  };
  const statusStyle = getStatusStyle(shift.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle} pointerEvents="none">
          Shift Details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCard}>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{shift.date}</Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusStyle.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: statusStyle.text,
                  },
                ]}
              >
                {shift.status}
              </Text>
            </View>
          </View>

          <Text style={styles.timeText}>{shift.timeRange}</Text>
          <Text style={styles.duration}>({shift.duration})</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="location"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{shift.locationName}</Text>
              <Text style={styles.subValue}>{shift.locationAddress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="briefcase"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Shift Type</Text>
              <Text style={styles.value}>{shift.shiftType}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="time"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Reporting Time</Text>
              <Text style={styles.value}>{shift.reportingTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="cafe"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Break Time</Text>
              <Text style={styles.value}>{shift.breakTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="person"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Supervisor</Text>
              <Text style={styles.value}>{shift.supervisorName}</Text>
              <Text style={styles.subValue}>{shift.supervisorPhone}</Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Get Directions"
          onPress={getDirections}
          style={styles.directionsButton}
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
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },

  topCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },

  dateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  timeText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  duration: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  details: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  infoText: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  subValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  directionsButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    marginBottom: 16,
  },
});