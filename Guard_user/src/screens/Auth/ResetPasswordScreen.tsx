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

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .matches(/[0-9]/, 'Must contain at least 1 number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least 1 special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const ResetPasswordScreen: React.FC<ScreenProps<'ResetPassword'>> = ({
  navigation,
  route,
}) => {
  const { userId, otp } = route.params || {};
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const pwd = watch('password') || '';

  const validationRules = [
    { label: 'At least 8 characters', valid: pwd.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(pwd) },
    { label: 'One number', valid: /[0-9]/.test(pwd) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const onSubmit = async (data: { password: string }) => {
    if (!userId || !otp) {
      Alert.alert("Session Expired", "Please restart the forgot-password flow");
      navigation.navigate("ForgotPassword");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(userId, otp, data.password);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been changed successfully. Please login with your new password.',
        [
          {
            text: 'Login Now',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
          },
        ]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || "Otp is invalid or expired";
      Alert.alert("Reset Failed", message);
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

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={40} color="#3B82F6" />
            </View>
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a strong and secure new password for your account
          </Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>New Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword={true}
                  error={errors.password?.message}
                  touched={Boolean(errors.password)}
                />
              )}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Re-enter new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword={true}
                  error={errors.confirmPassword?.message}
                  touched={Boolean(errors.confirmPassword)}
                />
              )}
            />

            <View style={styles.checklistCard}>
              {validationRules.map((rule, index) => (
                <View key={index} style={styles.checkItem}>
                  <Ionicons
                    name={rule.valid ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={rule.valid ? '#16A34A' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.checkText,
                      rule.valid && styles.checkTextActive,
                    ]}
                  >
                    {rule.label}
                  </Text>
                </View>
              ))}
            </View>

            <PrimaryButton
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              style={styles.resetBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flexOne: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
    paddingHorizontal: 10,
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
  checklistCard: {
    marginVertical: 10,
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  checkTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 18,
  },
});