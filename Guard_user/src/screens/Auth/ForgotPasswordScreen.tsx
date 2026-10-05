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

const ForgotPasswordSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or Mobile number is required'),
});

export const ForgotPasswordScreen: React.FC<ScreenProps<'ForgotPassword'>> = ({
  navigation,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async (data: { identifier: string }) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(data.identifier);
      const { userId } = response.data.data;
      navigation.navigate("OtpVerification", {
        target: data.identifier,
        userId,
        mode: 'reset',
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Account doesn't exist with this email or password";
      Alert.alert("Error", message);
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
          <View style={styles.illustrationWrapper}>
            <View style={styles.illustrationCircle}>
              <Ionicons name="mail-open-outline" size={48} color="#3B82F6" />
            </View>
          </View>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.description}>
            Enter your registered mobile number or email to receive reset password link.
          </Text>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Mobile Number / Email</Text>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter registered mobile or email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  error={errors.identifier?.message}
                  touched={Boolean(errors.identifier)}
                />
              )}
            />

            <PrimaryButton
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              style={styles.actionBtn}
            />

            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    paddingBottom: 28,
    alignItems: 'center',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustrationCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  formSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 10,
  },
  backToLoginBtn: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backToLoginText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});