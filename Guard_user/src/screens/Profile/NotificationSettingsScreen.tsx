import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { userApi } from '../../api/endpoints';

export const NotificationSettingsScreen: React.FC<ScreenProps<'NotificationSettings'>> = ({
  navigation,
}) => {
  const [pushNotif, setPushNotif] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [guardUpdates, setGuardUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    userApi
      .getProfile()
      .then((res) => {
        const prefs = res.data.data.profile?.notificationPrefs;
        if (prefs) {
          setPushNotif(prefs.pushEnabled ?? true);
          setSmsAlerts(prefs.smsAlerts ?? true);
          setEmailUpdates(prefs.emailUpdates ?? false);
          setGuardUpdates(prefs.guardUpdates ?? true);
        }
      })
      .catch((error) => console.log('Notification prefs load error: ', error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userApi.updateProfile({
        notificationPrefs: {
          pushEnabled: pushNotif,
          smsAlerts,
          emailUpdates,
          guardUpdates,
        },
      });
      Alert.alert('Success', 'Notification preferences updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not save preferences. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Notification Settings" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading preferences..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Notification Settings" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Manage Alerts & Notifications</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSub}>Receive push alerts for request status changes</Text>
              </View>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
              trackColor={{ false: COLORS.border, true: '#BFDBFE' }}
              thumbColor={pushNotif ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconBox}>
                <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>SMS Alerts</Text>
                <Text style={styles.settingSub}>Get SMS updates regarding guard assignments</Text>
              </View>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: COLORS.border, true: '#BFDBFE' }}
              thumbColor={smsAlerts ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Email Updates</Text>
                <Text style={styles.settingSub}>Receive promotional offers and monthly reports</Text>
              </View>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: COLORS.border, true: '#BFDBFE' }}
              thumbColor={emailUpdates ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconBox}>
                <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Guard Tracking Alerts</Text>
                <Text style={styles.settingSub}>Notify when guards check-in/check-out for duty</Text>
              </View>
            </View>
            <Switch
              value={guardUpdates}
              onValueChange={setGuardUpdates}
              trackColor={{ false: COLORS.border, true: '#BFDBFE' }}
              thumbColor={guardUpdates ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>

        <PrimaryButton title="Save Preferences" onPress={handleSave} isLoading={isSaving} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 16 },
  settingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  settingSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  saveBtn: { marginTop: 10 },
});
