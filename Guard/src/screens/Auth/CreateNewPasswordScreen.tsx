import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';

const CreatePasswordSchema = Yup.object().shape({
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

interface CreateNewPasswordScreenProps {
  navigation: any;
  route: any;
}

export const CreateNewPasswordScreen: React.FC<CreateNewPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId, otp } = route.params || {};
  const [isResetting, setIsResetting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CreatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onResetSubmit = async (data: { password: string }) => {

    if (!userId || !otp) {
      Alert.alert('Session Expired', 'Please restart the forgot-password flow.');
      navigation.navigate('ForgotPassword');
      return;
    }

    setIsResetting(true);
    try {
      await authApi.resetPassword(userId, otp, data.password);
      setIsResetting(false);
      Alert.alert(
        'Password Changed',
        'Your password has been reset successfully.',
        [
          {
            text: 'Go to Login',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              }),
          },
        ]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Otp invalid or expired. please try again';
      Alert.alert('Reset Failed', message);
    } finally {
      setIsResetting(false);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={44} color="#3B82F6" />
          </View>
        </View>

        <Text style={styles.title}>Create New Password</Text>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>New Password</Text>
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

          <Text style={styles.inputLabel}>Confirm Password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Re-enter password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword={true}
                error={errors.confirmPassword?.message}
                touched={Boolean(errors.confirmPassword)}
              />
            )}
          />
          <PrimaryButton
            title="Reset Password"
            onPress={handleSubmit(onResetSubmit)}
            isLoading={isResetting}
            style={styles.resetBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateNewPasswordScreen;

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  formSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  checklistContainer: {
    marginVertical: 14,
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
  },
  checkTextActive: {
    color: COLORS.success,
  },
  checkTextInactive: {
    color: COLORS.textMuted,
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 18,
    height: 52,
    borderRadius: 12,
  },
});