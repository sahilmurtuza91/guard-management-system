import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useRequestLabel } from '../../hooks/useRequestLabel';

export const RequestSuccessScreen: React.FC<ScreenProps<'RequestSuccess'>> = ({
  navigation,
  route,
}) => {
  const requestId = route.params?.requestId;
  const requestLabel = useRequestLabel(requestId);

  const handleViewRequests = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MyRequests' }],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.successIconWrapper}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.title}>Request Submitted!</Text>
        <Text style={styles.subtitle}>
          Your request has been sent successfully.
        </Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Your Request</Text>
          <Text style={styles.idValue}>{requestLabel}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' • '}
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <PrimaryButton
          title="View My Requests"
          onPress={handleViewRequests}
          style={styles.primaryBtn}
        />

        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={handleBackToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={16} color={COLORS.primary} />
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RequestSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 30,
  },
  idCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  idLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  idValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  primaryBtn: {
    width: '100%',
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
});