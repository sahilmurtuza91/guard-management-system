import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { storage } from '../../utils/storage';
import { setCredentials } from '../../redux/authSlice';
import { connectSocket } from '../../services/socket';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkInitialAuth = async () => {
      try {
        const userToken = await storage.getToken();
        const savedUser = await storage.getUser();

        if (userToken && savedUser) {
          dispatch(setCredentials({ token: userToken, user: savedUser }));
          connectSocket(userToken);
        }

        timeoutId = setTimeout(() => {
          if (userToken) {
            navigation.replace('Dashboard'); 
          } else {
            navigation.replace('LoginScreen');
          }
        }, 1800);
      } catch (error) {
        navigation.replace('LoginScreen');
      }
    };

    checkInitialAuth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigation, dispatch]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.logoWrapper}>
        <View style={styles.shieldOuter}>
          <Ionicons name="shield-checkmark" size={64} color={COLORS.white} />
        </View>

        <Text style={styles.titlePrimary}>SECURITY</Text>
        <Text style={styles.titleAccent}>GUARD</Text>
        <Text style={styles.subtitle}>Management System</Text>
      </View>

      <View style={styles.bottomSection}>
        <ActivityIndicator size="small" color="#60A5FA" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titlePrimary: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  titleAccent: {
    color: '#60A5FA',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: -4,
  },
  subtitle: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '500',
  },
});