import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import { updateUserProfile } from '../../redux/authSlice';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';

import { guardApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { LoadingState } from '../../components/LoadingState';

const EditProfileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Full name is required'),
  phone: Yup.string()
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  emergencyContact: Yup.string()
    .required('Emergency contact is required'),
  address: Yup.string()
    .required('Address is required'),
});

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EditProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      emergencyContact: '',
      address: '',
    },
  });

  React.useEffect(() => {
    guardApi
      .getProfile()
      .then((res) => {
        const { guard } = res.data.data;
        reset({
          name: user?.name ?? '',
          phone: user?.phone ?? '',
          email: user?.email ?? '',
          emergencyContact: guard?.emergencyContact ?? '',
          address: guard?.address ?? '',
        });
      })
      .catch((err) => console.log('Profile fetch error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePickAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (
          response.assets &&
          response.assets.length > 0 &&
          response.assets[0].uri
        ) {
          setAvatarUri(response.assets[0].uri);
        }
      }
    );
  };

  const onSubmit = async (formData: {
    name: string;
    phone: string;
    email: string;
    emergencyContact: string;
    address: string;
  }) => {
    setIsSaving(true);
    try {
      const pickedNewPhoto = !!avatarUri && avatarUri !== user?.avatarUrl;

      if (pickedNewPhoto) {
        const body = new FormData();
        body.append('name', formData.name);
        body.append('email', formData.email);
        body.append('phone', formData.phone);
        body.append('address', formData.address);
        body.append('emergencyContact', formData.emergencyContact);
        body.append('avatar', {
          uri: avatarUri,
          name: `avatar_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        await guardApi.updateProfile(body);
      } else {
        await guardApi.updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
        });
      }

      dispatch(
        updateUserProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatarUrl: avatarUri,
        })
      );

      Alert.alert(
        'Profile Updated',
        'Your profile details have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Profile update failed. Please try again.';
      Alert.alert('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Edit Profile
        </Text>
        <View style={styles.placeholderBox} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: resolveAssetUrl(avatarUri) }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.changeAvatarBtn}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="camera"
                  size={16}
                  color={COLORS.white}
                />
              </TouchableOpacity>

            </View>

          </View>
          <Text style={styles.fieldLabel}>
            Full Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                touched={Boolean(errors.name)}
              />
            )}
          />
          <Text style={styles.fieldLabel}>
            Phone Number
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.phone?.message}
                touched={Boolean(errors.phone)}
              />
            )}
          />
          <Text style={styles.fieldLabel}>
            Email Address
          </Text>
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
          <Text style={styles.fieldLabel}>
            Emergency Contact
          </Text>
          <Controller
            control={control}
            name="emergencyContact"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Emergency contact phone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.emergencyContact?.message}
                touched={Boolean(errors.emergencyContact)}
              />
            )}
          />
          <Text style={styles.fieldLabel}>
            Residential Address
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter residential address"
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
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSaving}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default EditProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  placeholderBox: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    marginTop: 10,
  },
});