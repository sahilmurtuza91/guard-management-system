import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';

interface IssueOptionCardProps {
  title: string;
  desc: string;
  isSelected: boolean;
  onPress: () => void;
}

export const IssueOptionCard: React.FC<IssueOptionCardProps> = ({
  title,
  desc,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.activeCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, isSelected && styles.activeIconBox]}>
        <Ionicons
          name="alert-circle-outline"
          size={22}
          color={isSelected ? COLORS.white : COLORS.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.cardTitle, isSelected && styles.activeCardTitle]}>
          {title}
        </Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <View style={[styles.radioCircle, isSelected && styles.activeRadio]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

export default IssueOptionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accentLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeIconBox: { backgroundColor: COLORS.primary },
  textWrap: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  activeCardTitle: { color: COLORS.primary },
  cardDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadio: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
});