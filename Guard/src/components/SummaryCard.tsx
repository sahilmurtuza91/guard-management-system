import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

interface SummaryCardProps {
  iconName: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  iconName,
  iconColor,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '47%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitleText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});