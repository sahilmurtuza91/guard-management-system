import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/them';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  fullScreen = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
      ]}
    >
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
      />

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },

  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  message: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
