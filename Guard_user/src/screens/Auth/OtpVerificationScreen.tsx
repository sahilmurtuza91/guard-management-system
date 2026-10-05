import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';

import { useDispatch } from 'react-redux';
import { setClientLogin } from '../../redux/authSlice';
import { authApi } from '../../api/endpoints';
import { storage } from '../../utils/storage';

export const OtpVerificationScreen: React.FC<ScreenProps<'OtpVerification'>> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();
  const { target = '', userId, mode = 'signup' } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = [
    useRef<React.ElementRef<typeof TextInput>>(null),
    useRef<React.ElementRef<typeof TextInput>>(null),
    useRef<React.ElementRef<typeof TextInput>>(null),
    useRef<React.ElementRef<typeof TextInput>>(null),
    useRef<React.ElementRef<typeof TextInput>>(null),
    useRef<React.ElementRef<typeof TextInput>>(null),
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (seconds > 0) {
      interval = setInterval(() => setSeconds(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds]);

  useEffect(() => {
    const timer = setTimeout(() => inputRefs[0].current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDigitChange = (text: string, index: number) => {
    const cleanDigit = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);

    if (cleanDigit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setSeconds(45);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs[0].current?.focus();
    try {
      if (mode === 'reset') {
        await authApi.forgotPassword(target);
      }
      Alert.alert('OTP Resent', `A new 6-digit verification code was sent to ${target}`);
    } catch {
      Alert.alert('Error', "OTP can't be sent.");
    }
  };

  const handleVerify = async() => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    try{
      if(mode === 'signup'){
        const response = await authApi.verifyOtp(userId!, fullCode);
        const {token, user} = response.data.data;
        await storage.setToken(token);
        await storage.setUser(user);
        dispatch(setClientLogin({user, token}));
        navigation.replace("CreateProfile");
      } else if(mode === "reset"){
        navigation.replace('ResetPassword', {
          target, userId, otp: fullCode
        });
      } else{
        navigation.replace("MainTabs");
      }
    } catch(error:any){
      const message = error?.response?.data?.message || "Otp invalid or expired";
      Alert.alert("Verificaion failed", message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
        <Text style={styles.targetNumber}>{target}</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.otpBox,
                Boolean(digit) && styles.otpBoxFilled,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={text => handleDigitChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <View style={styles.timerWrapper}>
          <Text style={styles.timerLabel}>Resend OTP in </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendBtnText}>Resend Now</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerCount}>
              00:{seconds < 10 ? `0${seconds}` : seconds}
            </Text>
          )}
        </View>

        <PrimaryButton
          title="Verify OTP"
          onPress={handleVerify}
          isLoading={isVerifying}
          disabled={otp.some(d => !d)}
          style={styles.verifyBtn}
        />
      </View>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 12,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  targetNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    marginBottom: 32,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  timerCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
  },
});