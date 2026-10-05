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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { authApi } from '../../api/endpoints';

const ForgotPasswordSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or Mobile number is required'),
});

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async(data: { identifier: string }) => {
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
      const message = error?.response?.data?.message || "Account doesn't exist related to this phone or email";
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Forgot Password</Text>

        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="mail-open" size={54} color="#3B82F6" />
          </View>
        </View>

        <Text style={styles.description}>
          Enter your registered email or mobile number. We'll send you OTP to reset your password.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Email or Mobile Number</Text>
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter email or mobile number"
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
            title="Send OTP"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
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
  actionBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 10,
  },
});