import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  iconName,
  iconSize = 18,
  iconColor = COLORS.white,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (disabled || isLoading) && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <View style={styles.contentRow}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={styles.iconStyle}
            />
          )}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});