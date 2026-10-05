import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';

interface ActiveRequestCardProps {
  request: {
    serviceType: string;
    date: string;
    timeSlot: string;
    status: string;
    location: string;
  } | null;
  onPress: () => void;
}

export const ActiveRequestCard: React.FC<ActiveRequestCardProps> = ({
  request,
  onPress,
}) => {
  if (!request) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Active Request</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.reqId}>{request.serviceType || 'Guard Request'}</Text>
            <Text style={styles.reqDate}>
              {request.date} • {request.timeSlot}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.locationMeta}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.locationText} numberOfLines={1}>
              {request.location}
            </Text>
          </View>
          <Text style={styles.detailsLink}>View Details</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2042',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reqId: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F2042',
  },
  reqDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});