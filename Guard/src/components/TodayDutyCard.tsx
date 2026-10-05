import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface TodayDutyCardProps {
  isCheckedIn: boolean;
  activeCheckInTime: string | null;
  shiftTiming?: string;
  locationName: string;
  locationAddress: string;
  isLoading?: boolean;
  onDutyToggle: () => void;
  onLocationPress?: () => void;
}

export const TodayDutyCard: React.FC<TodayDutyCardProps> = ({
  isCheckedIn,
  activeCheckInTime,
  shiftTiming = 'No shift scheduled',
  locationName,
  locationAddress,
  isLoading = false,
  onDutyToggle,
  onLocationPress,
}) => {
  return (
    <View style={styles.dutyCard}>
      <View style={styles.dutyCardHeader}>
        <View>
          <Text style={styles.dutySectionTitle}>TODAY'S DUTY</Text>
          <View style={styles.activeRow}>
            <View
              style={[
                styles.activeDot,
                {
                  backgroundColor: isCheckedIn ? COLORS.success : COLORS.error,
                },
              ]}
            />
            <Text
              style={[
                styles.activeLabel,
                {
                  color: isCheckedIn ? COLORS.success : COLORS.error,
                },
              ]}
            >
              {isCheckedIn ? 'Active Duty' : 'Off Duty'}
            </Text>
          </View>
        </View>

        <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
      </View>

      <View style={styles.timeBadgeRow}>
        <View style={styles.timingInfo}>
          <Ionicons name="time-outline" size={16} color={COLORS.textPrimary} />
          <Text style={styles.shiftTimeText}>{shiftTiming}</Text>
        </View>

        {isCheckedIn && (
          <View style={styles.checkedInBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.checkedInText}>
              Checked In {activeCheckInTime || '--:--'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.locationSection}
        onPress={onLocationPress}
        activeOpacity={onLocationPress ? 0.7 : 1}
      >
        <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
        <View style={styles.locationTextWrapper}>
          <Text style={styles.locationTitle}>{locationName}</Text>
          <Text style={styles.locationSub}>{locationAddress}</Text>
        </View>
        {onLocationPress && (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>

      <PrimaryButton
        title={isCheckedIn ? 'CHECK OUT' : 'CHECK IN'}
        iconName={isCheckedIn ? 'checkbox-outline' : 'log-in-outline'}
        isLoading={isLoading}
        onPress={onDutyToggle}
        style={[
          styles.actionBtn,
          { backgroundColor: isCheckedIn ? '#16A34A' : COLORS.primary },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dutyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    elevation: 2,
  },
  dutyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dutySectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  timingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  checkedInText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
  },
  locationCapturedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  capturedText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});