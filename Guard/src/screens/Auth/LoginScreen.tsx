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
import { useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { setCredentials } from '../../redux/authSlice';

import { authApi } from '../../api/endpoints';
import { storage } from '../../utils/storage';
import { connectSocket } from '../../services/socket';

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const PhoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmailForm,
  } = useForm({
    resolver: yupResolver(EmailSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
    reset: resetPhoneForm,
  } = useForm({
    resolver: yupResolver(PhoneSchema),
    defaultValues: { phone: '', password: '' },
  });

  const toggleAuthMode = () => {
    if (activeTab === 'email') {
      resetEmailForm();
      setActiveTab('phone');
    } else {
      resetPhoneForm();
      setActiveTab('email');
    }
  };

  const onFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const identifier = activeTab === 'email' ? formData.email : formData.phone;
      const response = await authApi.login(identifier, formData.password);
      
      const loginData = response.data?.data || response.data;
      const { token, user } = loginData;

      if (!token || !user) {
        Alert.alert('Login Error', 'Invalid response from server.');
        return;
      }

      if (user.role && user.role.toLowerCase() !== 'guard') {
        Alert.alert('Access Denied', 'This account is not authorized for the Guard app.');
        return;
      }

      await storage.setToken(token);
      await storage.setUser(user);
      dispatch(setCredentials({ token, user }));
      
      try {
        connectSocket(token);
      } catch (socketError) {
        console.warn('Socket connection deferred:', socketError);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', message);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue your duty</Text>
        </View>

        <View style={styles.formSection}>
          {activeTab === 'email' ? (
            <View>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Controller
                control={emailControl}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={emailErrors.email?.message}
                    touched={Boolean(emailErrors.email)}
                  />
                )}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <Controller
                control={emailControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isPassword={true}
                    error={emailErrors.password?.message}
                    touched={Boolean(emailErrors.password)}
                  />
                )}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <Controller
                control={phoneControl}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Enter mobile number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    error={phoneErrors.phone?.message}
                    touched={Boolean(phoneErrors.phone)}
                  />
                )}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <Controller
                control={phoneControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isPassword={true}
                    error={phoneErrors.password?.message}
                    touched={Boolean(phoneErrors.password)}
                  />
                )}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Login"
            onPress={
              activeTab === 'email'
                ? handleEmailSubmit(onFormSubmit)
                : handlePhoneSubmit(onFormSubmit)
            }
            isLoading={isSubmitting}
            style={styles.loginBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={toggleAuthMode}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'email' ? 'call-outline' : 'mail-outline'}
              size={18}
              color={COLORS.primary}
              style={styles.switchIcon}
            />
            <Text style={styles.switchModeText}>
              {activeTab === 'email' ? 'Login with Phone' : 'Login with Email'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Need account access? </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Guard Account Support',
                'Guard IDs and credentials are provided by your security supervisor.'
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.signUpLink}>Contact Admin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 22,
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },
  switchModeBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  switchIcon: {
    marginRight: 8,
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});