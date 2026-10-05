import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';
import { IncidentStatus } from '../redux/incidentSlice';

interface IncidentItemCardProps {
  title: string;
  location: string;
  time: string;
  status: IncidentStatus | string;
  onPress: () => void;
}

export const IncidentItemCard: React.FC<IncidentItemCardProps> = ({
  title,
  location,
  time,
  status,
  onPress,
}) => {
  const getStatusBadge = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Resolved':
        return { bg: COLORS.successLight, text: COLORS.success };
      case 'Under Review':
        return { bg: COLORS.warningLight, text: COLORS.warning };
      case 'Rejected':
        return { bg: '#F1F5F9', text: COLORS.textSecondary };
      case 'Reported':
      default:
        return { bg: COLORS.errorLight, text: COLORS.error };
    }
  };

  const badge = getStatusBadge(status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {location}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

export default IncidentItemCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
});