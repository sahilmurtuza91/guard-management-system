import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';

import { storage } from '../../utils/storage';
import { authApi } from '../../api/endpoints';
import { setCredentials } from '../../redux/agencySlice';
import { connectSocket } from '../../services/socket';

export const SplashScreen: React.FC<ScreenProps<'Splash'>> = ({ navigation }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const checkInitialAuth = async () => {
      const token = await storage.getToken();

      if (!token) {
        timer = setTimeout(() => navigation.replace('Login'), 2500);
        return;
      }

      try {
        const response = await authApi.getMe();
        const user = response.data.data.user;
        dispatch(setCredentials({ token, user }));
        connectSocket(token, (user as any)?.agency);
        timer = setTimeout(() => navigation.replace('MainTabs'), 2500);
      } catch (error) {
        await storage.clear();
        timer = setTimeout(() => navigation.replace('Login'), 2500);
      }
    };

    checkInitialAuth();
    return () => clearTimeout(timer);
  }, [navigation, dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={56} color={COLORS.white} />
        </View>
        <Text style={styles.appName}>SECURE</Text>
        <Text style={styles.appSubtitle}>Agency Portal</Text>
        <Text style={styles.tagline}>Safe Today, Secure Tomorrow</Text>
      </View>
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.white} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});