import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';

const OtpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^[0-9]{4,6}$/, 'Enter a valid 4-6 digit OTP')
    .required('OTP is required'),
});

type OtpForm = Yup.InferType<typeof OtpSchema>;


export const OTPVerificationScreen: React.FC<ScreenProps<'OTPVerification'>> = ({ navigation, route }) => {
  const { userId, identifier } = route.params || {};
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const { 
    control, 
    handleSubmit, 
    formState: { errors } } = useForm<OtpForm>({
    resolver: yupResolver(OtpSchema),
    defaultValues: { otp: '' },
  });

  const handleVerifyOTP = async ({ otp }: OtpForm) => {
    if (!userId) {
      Alert.alert('Error', 'Session expired. Please restart the forgot password process.');
      navigation.navigate('ForgotPassword');
      return;
    }
    setIsVerifying(true);
    try {
      await authApi.verifyOtp(userId, otp);
      navigation.navigate('ResetPassword', { userId, otp });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (secondsLeft > 0) return;
    if (!identifier) {
      Alert.alert('OTP', 'Please restart the forgot password process to resend an OTP.');
      return;
    }
    setIsResending(true);
    try {
      await authApi.forgotPassword(identifier);
      setSecondsLeft(60);
      Alert.alert('OTP Resent', 'A new verification code has been sent to your phone.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not resend OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.highlightText}>{identifier || 'your registered contact'}</Text>
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Enter OTP Code"
                placeholder=" "
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.otp?.message}
                touched={Boolean(errors.otp)}
              />
            )}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>{secondsLeft > 0 ? 'Resend OTP in ' : 'Did not get the code?'}</Text>
            {secondsLeft > 0 && (
              <Text style={styles.timerText}>{`00:${String(secondsLeft).padStart(2, '0')}`}</Text>
            )}
          </View>

          <PrimaryButton
            title="Verify OTP"
            onPress={handleSubmit(handleVerifyOTP)}
            isLoading={isVerifying}
            style={styles.actionBtn}
          />

          <TouchableOpacity
            style={styles.resendActionBtn}
            onPress={handleResendOTP}
            disabled={secondsLeft > 0 || isResending}
            activeOpacity={0.7}
          >
            <Text style={styles.resendActionText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  highlightText: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  resendRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionBtn: {
    marginTop: 10,
  },
  resendActionBtn: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resendActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});