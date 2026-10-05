import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';

export const AssignmentSuccessScreen: React.FC<ScreenProps<'AssignmentSuccess'>> = ({ route, navigation }) => {
  const { requestId, assignedCount } = route.params || { requestId: '' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.content}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark" size={44} color="#16A34A" />
        </View>

        <Text style={styles.title}>Assignment Successful!</Text>

        <Text style={styles.subtitle}>
          {assignedCount ? `${assignedCount} guard${assignedCount === 1 ? '' : 's'} have` : 'Guards have'} been assigned for this request.
        </Text>

        <View style={styles.reqBadgeCard}>
          <Text style={styles.reqBadgeLabel}>Guards Assigned</Text>
          <Text style={styles.reqBadgeValue}>{assignedCount || 0}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Back to Dashboard" 
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })} 
        />
      </View>
    </SafeAreaView>
  );
};

export default AssignmentSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    marginTop: 6,
    textAlign: 'center',
  },
  reqBadgeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 24,
    alignItems: 'center',
  },
  reqBadgeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  reqBadgeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  footer: {
    width: '100%',
    paddingBottom: 10,
  },
});