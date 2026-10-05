import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';
import { findNonSerializableValue } from '@reduxjs/toolkit';

const SignUpSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number')
    .required('Mobile number is required'),
  email: Yup.string().email('Invalid email address'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const SignUpScreen: React.FC<ScreenProps<'SignUp'>> = ({ navigation }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SignUpSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async(formData: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    password: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.signup({
        name: formData.fullName,
        phone: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
      });
      const { userId } = response.data.data;

      navigation.navigate("OtpVerification", {
        target: `+91 ${formData.mobileNumber}`,
        userId,
        mode: 'signup',
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert("Signup failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter full name"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  touched={Boolean(errors.fullName)}
                />
              )}
            />

            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter 10-digit mobile number"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.mobileNumber?.message}
                  touched={Boolean(errors.mobileNumber)}
                />
              )}
            />

            <Text style={styles.label}>Email (Optional)</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter your email"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  touched={Boolean(errors.email)}
                />
              )}
            />

            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Create password"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword={true}
                  error={errors.password?.message}
                  touched={Boolean(errors.password)}
                />
              )}
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(prev => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={agreedToTerms ? 'checkbox' : 'square-outline'}
                size={20}
                color={agreedToTerms ? COLORS.primary : '#94A3B8'}
              />
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              disabled={!agreedToTerms}
              style={styles.signupBtn}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: '700',
  },
  signupBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});