import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateClientProfile } from '../../redux/authSlice';

import { userApi } from '../../api/endpoints';
const CreateProfileSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9+ ]{10,15}$/, 'Valid mobile number required')
    .required('Mobile number is required'),
  address: Yup.string().required('Default address is required'),
});

export const CreateProfileScreen: React.FC<ScreenProps<'CreateProfile'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state as any).auth?.user);

  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CreateProfileSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.phone || '',
      address: user?.address || '',
    },
  });

  const handlePickAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setAvatarUri(response.assets[0].uri);
        }
      }
    );
  };

  const onSubmit = async (formData: {
    fullName: string;
    email: string;
    mobileNumber: string;
    address: string;
  }) => {
    setIsSaving(true);
    try {
      const pickedNewPhoto = !!avatarUri && avatarUri !== user?.avatarUrl;
      if (pickedNewPhoto) {
        const body = new FormData();
        body.append('name', formData.fullName);
        body.append('email', formData.email);
        body.append('avatar', {
          uri: avatarUri,
          name: `avatar_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        await userApi.updateProfile(body);
      } else {
        await userApi.updateProfile({
          name: formData.fullName,
          email: formData.email,
        });
      }
      await userApi.addAddress({
        label: 'Home',
        addressLine: formData.address,
        isDefault: true,
      });

      dispatch(
        updateClientProfile({
          name: formData.fullName,
          email: formData.email,
          phone: formData.mobileNumber,
          avatarUrl: avatarUri || undefined,
        })
      );

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      console.log("Create profile error: ", error);
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Profile</Text>
          <Text style={styles.subtitle}>Complete your profile to start hiring guards</Text>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarTouch}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={44} color="#94A3B8" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={handlePickAvatar}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.addPhotoLabel}>Add Photo</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  touched={Boolean(errors.fullName)}
                />
              )}
            />

            <Text style={styles.label}>Email</Text>
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

            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter mobile number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={errors.mobileNumber?.message}
                  touched={Boolean(errors.mobileNumber)}
                  editable={false}
                />
              )}
            />
            <Text style={styles.helperNote}>Verified at signup — contact support to change it.</Text>

            <Text style={styles.label}>Address</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="Enter your current address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline={true}
                  numberOfLines={3}
                  error={errors.address?.message}
                  touched={Boolean(errors.address)}
                />
              )}
            />

            <PrimaryButton
              title="Save & Continue"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSaving}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateProfileScreen;

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
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarTouch: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  addPhotoLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 8,
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
  helperNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 10,
  },
});