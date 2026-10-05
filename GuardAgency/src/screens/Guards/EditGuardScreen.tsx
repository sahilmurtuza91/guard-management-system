import React, { useState, useEffect } from 'react';
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
  TouchableOpacity,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { guardManagementApi } from '../../api/endpoints';

const EditGuardSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required('Full name is required')
    .min(2, 'Name is too short'),
  phoneNumber: Yup.string(),
  email: Yup.string()
    .trim()
    .email('Invalid email address'),
  experience: Yup.string().matches(
    /^[0-9]{0,2}$/,
    'Enter experience in years (0-99)',
  ),
});
type EditGuardForm = Yup.InferType<typeof EditGuardSchema>;

export const EditGuardScreen: React.FC<ScreenProps<'EditGuard'>> = ({ route, navigation }) => {
  const { guardId } = route.params;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditGuardForm>({
    resolver: yupResolver(EditGuardSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      experience: '',
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadGuard = async () => {
      try {
        const response = await guardManagementApi.getGuardProfile(guardId);
        const guard = response.data.data.guard;
        reset({
          fullName: guard.user?.name || '',
          phoneNumber: guard.user?.phone || '',
          email: guard.user?.email || '',
          experience: String(guard.experienceYears ?? ''),
        });
      } catch (error) {
        console.log('Guard load error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGuard();
  }, [guardId, reset]);

  const handleUpdateGuard = async (data: EditGuardForm) => {
    setIsSaving(true);
    try {
      await guardManagementApi.updateGuard(guardId, {
        name: data.fullName.trim(),
        email: (data.email || '').trim(),
        experienceYears: data.experience
          ? Number(data.experience)
          : undefined,
      });
      Alert.alert(
        'Success',
        'Guard details updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Could not update guard. Please try again.';

      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android'
            ? { backgroundColor: COLORS.white }
            : {})}
        />

        <LoadingState message="Loading guard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Guard</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Full Name"
                placeholder="Full Name"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                touched={Boolean(errors.fullName)}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Phone Number"
                placeholder="Phone Number"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                editable={false}
                error={errors.phoneNumber?.message}
                touched={Boolean(errors.phoneNumber)}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Email Address"
                placeholder="Email Address"
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
            name="experience"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Experience (Years)"
                placeholder="Experience"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.experience?.message}
                touched={Boolean(errors.experience)}
              />
            )}
          />

          <PrimaryButton
            title="Update Guard"
            onPress={handleSubmit(handleUpdateGuard)}
            isLoading={isSaving}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditGuardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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

  submitBtn: {
    marginTop: 24,
  },
});