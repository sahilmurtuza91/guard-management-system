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
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { userApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { updateClientProfile } from '../../redux/authSlice';
import { FullScreenImageViewer } from '../../components/FullScreenImageViewer';

const EditProfileSchema = Yup.object().shape({
  fullName: Yup.string().trim().min(2, 'Name is too short').required('Full name is required'),
  email: Yup.string().trim().email('Invalid email address').required('Email is required'),
  phone: Yup.string(),
});

type EditProfileForm = Yup.InferType<typeof EditProfileSchema>;

export const EditProfileScreen: React.FC<ScreenProps<'EditProfile'>> = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state as any).auth?.user);
  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileForm>({
    resolver: yupResolver(EditProfileSchema),
    defaultValues: { fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const handlePickAvatar = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      (response) => {
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setAvatarUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleUpdate = async ({ fullName, email }: EditProfileForm) => {
    setIsSaving(true);
    try {
      const pickedNewPhoto = !!avatarUri && avatarUri !== user?.avatarUrl;
      let updatedUser;
      if (pickedNewPhoto) {
        const body = new FormData();
        body.append('name', fullName);
        body.append('email', email);
        body.append('avatar', {
          uri: avatarUri,
          name: `avatar_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        const response = await userApi.updateProfile(body);
        updatedUser = response.data.data.user;
      } else {
        const response = await userApi.updateProfile({ name: fullName, email });
        updatedUser = response.data.data.user;
      }
      dispatch(updateClientProfile(updatedUser));

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not update profile. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Edit Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => (avatarUri ? setIsImageViewerVisible(true) : handlePickAvatar())}
          >
            {avatarUri ? (
              <Image source={{ uri: resolveAssetUrl(avatarUri) }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarBox}>
                <Ionicons name="person" size={40} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraIconBox} onPress={handlePickAvatar} activeOpacity={0.8}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Full Name"
              placeholder="Enter your full name"
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
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Email Address"
              placeholder="Enter your email address"
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
              label="Phone Number"
              placeholder="Enter phone number"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              editable={false}
              error={errors.phone?.message}
              touched={Boolean(errors.phone)}
            />
          )}
        />
        <Text style={styles.helperNote}>Phone number can't be changed here. Contact support to update it.</Text>

        <PrimaryButton title="Save Changes" onPress={handleSubmit(handleUpdate)} isLoading={isSaving} style={styles.saveBtn} />
      </ScrollView>

      <FullScreenImageViewer
        visible={isImageViewerVisible}
        imageUri={resolveAssetUrl(avatarUri || undefined)}
        onClose={() => setIsImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  cameraIconBox: {
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
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  helperNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  saveBtn: { marginTop: 30 },
});