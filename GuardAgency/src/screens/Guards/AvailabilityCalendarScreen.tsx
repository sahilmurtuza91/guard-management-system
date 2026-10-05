import React, { useEffect, useState } from 'react';
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
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { guardManagementApi } from '../../api/endpoints';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

export const AvailabilityCalendarScreen: React.FC<ScreenProps<any>> = ({ navigation, route }) => {
  const guardId = route.params?.guardId;

  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const nextSeverDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    nextSeverDays.push(date);
  }

  useEffect(() => {
    const loadAvailabilityData = async () => {
      try {
        const response = await guardManagementApi.getAvailability(guardId);

        const dates: string[] = response.data.data.unavailableDates || [];
        const dateKeys = dates.map((date) => new Date(date).toISOString().slice(0, 10));
        setUnavailableDates(new Set(dateKeys));
      } catch (error) {
        console.log('Availability load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailabilityData();
  }, [guardId]);

  const toggleDateAvailability = (dateKey: string) => {
    setUnavailableDates((prev) => {
      const updatedDates = new Set(prev);
      if (updatedDates.has(dateKey)) {
        updatedDates.delete(dateKey);
      } else {
        updatedDates.add(dateKey);
      }
      return updatedDates;
    });
  };

  const handleUpdateAvailability = async () => {
    setIsSaving(true);

    try {
      await guardManagementApi.updateAvailability(guardId, {
        unavailableDates: Array.from(unavailableDates),
      });

      Alert.alert('Success', 'Availability updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Could not update availability. Please try again.';

      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Availability Calendar</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>Next 7 Days</Text>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: '#16A34A' },
                ]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: '#DC2626' },
                ]}
              />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <LoadingState message="Loading availability..." />
        ) : (
          <>
            <Text style={styles.tapHint}>
              Tap a day to mark it unavailable
            </Text>

            <View style={styles.daysGrid}>
              {nextSeverDays.map((date) => {
                const dateKey = getDateKey(date);
                const isUnavailable =
                  unavailableDates.has(dateKey);

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.dayCard,
                      isUnavailable && styles.selectedDayCard,
                    ]}
                    onPress={() =>
                      toggleDateAvailability(dateKey)
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        isUnavailable && styles.selectedText,
                      ]}
                    >
                      {DAY_NAMES[date.getDay()]}
                    </Text>

                    <Text
                      style={[
                        styles.dayNumber,
                        isUnavailable && styles.selectedText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>

                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: isUnavailable
                            ? '#DC2626'
                            : '#16A34A',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton
              title="Update Availability"
              onPress={handleUpdateAvailability}
              isLoading={isSaving}
              style={styles.submitBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvailabilityCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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

  monthHeader: {
    marginBottom: 20,
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  tapHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },

  dayCard: {
    width: '22%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  selectedDayCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  dayNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  selectedText: {
    color: COLORS.primary,
  },

  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  submitBtn: {
    marginTop: 10,
  },
});