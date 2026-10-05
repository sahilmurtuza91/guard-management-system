import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import Geolocation from 'react-native-geolocation-service';
import { userApi, requestApi } from '../../api/endpoints';

export const SOSScreen: React.FC<ScreenProps<'SOS'>> = ({ navigation, route }) => {
  const requestId = route.params?.requestId;
  const [sosSent, setSosSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [agencyContact, setAgencyContact] = useState<{ name: string; contactPhone: string } | null>(null);

  useEffect(() => {
    if (!requestId) return;
    requestApi
      .getRequestTracking(requestId)
      .then((res) => setAgencyContact(res.data.data.agency || null))
      .catch((error) => console.log('SOS agency contact load error: ', error));
  }, [requestId]);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> =>
    new Promise(async (resolve, reject) => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          reject(new Error('Location permission denied'));
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });

  const handleSOS = () => {
    Alert.alert(
      'Confirm Emergency Alert',
      'Isse aapki live location ke saath ek urgent alert Agency ko bheja jayega. Continue karein?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Send SOS',
          style: 'destructive',
          onPress: async () => {
            setIsSending(true);
            try {
              const { latitude, longitude } = await getCurrentLocation();
              await userApi.triggerSOS({ requestId, latitude, longitude });
              setSosSent(true);
            } catch (error: any) {
              Alert.alert('SOS Failed', error?.response?.data?.message || error?.message || 'Location ya alert bhejne me dikkat aayi. Please try again.');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Emergency SOS" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        {sosSent ? (
          <View style={styles.sentState}>
            <View style={styles.sentIconWrap}>
              <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
            </View>
            <Text style={styles.sentTitle}>Alert Sent!</Text>
            <Text style={styles.sentSubtitle}>
              Aapki location ke saath emergency alert Agency ko bhej diya gaya hai. Woh jald hi contact karenge.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={handleSOS}
              activeOpacity={0.85}
              disabled={isSending}
            >
              <Ionicons name="alert" size={48} color={COLORS.white} />
              <Text style={styles.sosButtonText}>{isSending ? 'Sending...' : 'SOS'}</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Emergency situation me is button ko dabao - aapki location turant Agency ko bhej di jayegi.
            </Text>
          </>
        )}

        <View style={styles.quickDialSection}>
          <Text style={styles.quickDialTitle}>Quick Dial</Text>

          <TouchableOpacity style={styles.dialRow} onPress={() => Linking.openURL('tel:100')} activeOpacity={0.7}>
            <View style={[styles.dialIconWrap, { backgroundColor: COLORS.errorLight }]}>
              <Ionicons name="shield" size={20} color={COLORS.error} />
            </View>
            <View style={styles.dialTextWrap}>
              <Text style={styles.dialLabel}>Police</Text>
              <Text style={styles.dialNumber}>100</Text>
            </View>
            <Ionicons name="call" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dialRow}
            onPress={() => agencyContact?.contactPhone && Linking.openURL(`tel:${agencyContact.contactPhone}`)}
            activeOpacity={0.7}
            disabled={!agencyContact?.contactPhone}
          >
            <View style={[styles.dialIconWrap, { backgroundColor: COLORS.accentLight }]}>
              <Ionicons name="headset" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.dialTextWrap}>
              <Text style={styles.dialLabel}>{agencyContact?.name || 'Agency Helpline'}</Text>
              <Text style={styles.dialNumber}>
                {agencyContact?.contactPhone || 'Not available for this request'}
              </Text>
            </View>
            <Ionicons name="call" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SOSScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.error,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sosButtonText: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  sentState: { alignItems: 'center', marginBottom: 24 },
  sentIconWrap: { marginBottom: 16 },
  sentTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  sentSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  quickDialSection: { width: '100%', marginTop: 40 },
  quickDialTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  dialIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dialTextWrap: { flex: 1 },
  dialLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  dialNumber: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});