import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';

const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters long')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from the current password')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

type ChangePasswordForm = Yup.InferType<typeof ChangePasswordSchema>;

export const ChangePasswordScreen: React.FC<ScreenProps<'ChangePassword'>> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleChangePassword = async ({ currentPassword, newPassword }: ChangePasswordForm) => {
    setIsSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not change password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Change Password" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Current Password"
              placeholder="Enter current password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoCapitalize="none"
              error={errors.currentPassword?.message}
              touched={Boolean(errors.currentPassword)}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="New Password"
              placeholder="Enter new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoCapitalize="none"
              error={errors.newPassword?.message}
              touched={Boolean(errors.newPassword)}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoCapitalize="none"
              error={errors.confirmPassword?.message}
              touched={Boolean(errors.confirmPassword)}
            />
          )}
        />

        <PrimaryButton
          title="Update Password"
          onPress={handleSubmit(handleChangePassword)}
          isLoading={isSubmitting}
          style={styles.updateBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  updateBtn: { marginTop: 30 },
});