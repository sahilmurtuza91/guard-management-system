import React from 'react';
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

const SignupSchema = Yup.object({
  agencyName: Yup.string()
    .trim()
    .required('Agency name is required'),
  adminName: Yup.string()
    .trim()
    .required('Admin name is required'),
  email: Yup.string()
    .trim()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .trim()
    .matches(/^[+]?[0-9]{10,13}$/, 'Enter a valid mobile number')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

type SignupForm = Yup.InferType<typeof SignupSchema>;

export const SignupScreen: React.FC<ScreenProps<'Signup'>> = ({ navigation }) => {
  const { 
    control, 
    handleSubmit, 
    formState: { errors } } = useForm<SignupForm>({
    resolver: yupResolver(SignupSchema),
    defaultValues: { agencyName: '', adminName: '', email: '', phone: '', password: '' },
  });

  const handleSignup = (_data: SignupForm) => {
    Alert.alert('Success', 'Agency account created successfully!', [
      { text: 'Login Now', onPress: () => navigation.navigate('Login') },
    ]);
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
          <Text style={styles.title}>Agency Registration</Text>
          <Text style={styles.subtitle}>Create your security agency admin account.</Text>
        </View>

        <View style={styles.formContainer}>
          <Controller
              control={control}
              name="agencyName"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Agency Name"
                      placeholder="e.g. Secure Shield Security Pvt Ltd"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.agencyName?.message}
                      touched={Boolean(errors.agencyName)}
                  />
              )}
          />

          <Controller
              control={control}
              name="adminName"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Admin Full Name"
                      placeholder="e.g. Rahul Sharma"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.adminName?.message}
                      touched={Boolean(errors.adminName)}
                  />
              )}
          />

          <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Email Address"
                      placeholder="admin@secureshield.com"
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

          <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Mobile Number"
                      placeholder="+91 98765 43210"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      error={errors.phone?.message}
                      touched={Boolean(errors.phone)}
                  />
              )}
          />
          <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Password"
                      placeholder="Create password"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      isPassword
                      autoCapitalize="none"
                      error={errors.password?.message}
                      touched={Boolean(errors.password)}
                  />
              )}
          />

          <PrimaryButton 
            title="Register Agency" 
            onPress={handleSubmit(handleSignup)} 
            style={styles.actionBtn} 
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginSubText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  inputWrapper: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  actionBtn: {
    marginTop: 24,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loginLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});