import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';

interface CategoryCardProps {
  title: string;
  desc: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  desc,
  icon,
  iconColor,
  iconBg,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});