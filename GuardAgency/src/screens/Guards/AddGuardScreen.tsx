import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DocumentUploadField } from '../../components/DocumentUploadField';
import { PickedImage } from '../../utils/imagePicker';

import { guardManagementApi } from '../../api/endpoints';

const AddGuardSchema = Yup.object({
  fullName: Yup.string()
    .trim().
    required('Full name is required'),
  phoneNumber: Yup.string()
    .trim()
    .matches(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  tempPassword: Yup.string()
    .required('Temporary password is required')
    .min(6, 'Password must be at least 6 characters'),
  experience: Yup.string()
    .required('Experience is required')
    .matches(/^[0-9]{1,2}$/, 'Enter experience in years (0-99)'),
});

type FormValues = Yup.InferType<typeof AddGuardSchema>;

const DOCUMENT_TYPES = ['ID Proof', 'Address Proof', 'Police Verification'];

export const AddGuardScreen: React.FC<ScreenProps<'AddGuard'>> = ({ navigation }) => {
  const [gender, setGender] = useState('Male');
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<Record<string, PickedImage | null>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(AddGuardSchema),
    defaultValues: { 
      fullName: '', 
      phoneNumber: '', 
      email: '', 
      tempPassword: '',
      experience: '' 
    },
  });

  const onSubmit = async (formData: FormValues) => {
    setIsSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.fullName.trim());
      body.append('phone', formData.phoneNumber.trim());
      body.append('email', formData.email.trim());
      body.append('password', formData.tempPassword.trim());
      body.append('gender', gender);
      body.append('experienceYears', String(Number(formData.experience) || 0));

      DOCUMENT_TYPES.forEach((documentType) => {
        const image = documents[documentType];
        if (image) {
          body.append('documents', { uri: image.uri, name: image.name, type: image.type } as any);
          body.append('docNames', documentType);
        }
      });

      const response = await guardManagementApi.addGuard(body);
      const guard = response.data.data.guard;
      Alert.alert('Guard Added', `Employee ID: ${guard.employeeId}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not add guard. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
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
        <Text style={styles.headerTitle}>Add Guard</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter guard full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                touched={Boolean(errors.fullName)}
              />
            )}
          />

          <Text style={styles.label}>Phone Number</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="+91 Phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.phoneNumber?.message}
                touched={Boolean(errors.phoneNumber)}
              />
            )}
          />

          <Text style={styles.label}>Email Address</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter email address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                touched={Boolean(errors.email)}
              />
            )}
          />

          <Text style={styles.label}>Temporary Password</Text>
          <Controller
            control={control}
            name="tempPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Set a temporary login password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                error={errors.tempPassword?.message}
                touched={Boolean(errors.tempPassword)}
              />
            )}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.genderChip, gender === item && styles.activeGenderChip]}
                onPress={() => setGender(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.genderText, gender === item && styles.activeGenderText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Experience (Years)</Text>
          <Controller
            control={control}
            name="experience"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="e.g. 3"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.experience?.message}
                touched={Boolean(errors.experience)}
              />
            )}
          />

         
          <Text style={[styles.label, { marginTop: 8 }]}>Upload Documents</Text>
          {DOCUMENT_TYPES.map((type) => (
            <DocumentUploadField
              key={type}
              label={type}
              value={documents[type] || null}
              onChange={(image) => setDocuments((prev) => ({ ...prev, [type]: image }))}
            />
          ))}

          <PrimaryButton 
            title="Save Guard" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={isSaving}
            style={styles.submitBtn} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddGuardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
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
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGenderChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeGenderText: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  submitBtn: {
    marginTop: 10,
  },
});