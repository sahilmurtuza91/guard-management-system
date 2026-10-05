import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';

interface NotificationCardProps {
  title: string;
  message: string;
  time: string;
  isUnread?: boolean;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  time,
  isUnread = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.unreadCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.contentWrap}>
        <View style={styles.topRow}>
          <Text style={styles.titleText}>{title}</Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});