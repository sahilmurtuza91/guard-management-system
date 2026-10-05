import React, { useEffect, useState } from 'react';
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
  PermissionsAndroid,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { agencyApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { ScreenProps } from '../../navigation/types';
import { useDispatch } from 'react-redux';
import { setAgencyDetails } from '../../redux/agencySlice';

const EditAgencyProfileSchema = Yup.object().shape({
  name: Yup.string().required('Agency name is required'),
  address: Yup.string().required('Address is required'),
  contactEmail: Yup.string().email('Invalid email address').required('Contact email is required'),
  contactPhone: Yup.string().required('Contact phone is required'),
});

type FormValues = Yup.InferType<typeof EditAgencyProfileSchema>;

export const EditAgencyProfileScreen: React.FC<ScreenProps<'EditAgencyProfile'>> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(EditAgencyProfileSchema),
    defaultValues: { name: '', address: '', contactEmail: '', contactPhone: '' },
  });

  useEffect(() => {
    agencyApi
      .getProfile()
      .then((res) => {
        const agency = res.data.data.agency;
        reset({
          name: agency.name || '',
          address: agency.address || '',
          contactEmail: agency.contactEmail || '',
          contactPhone: agency.contactPhone || '',
        });
        setOriginalLogoUrl(agency.logoUrl);
        setLogoUri(resolveAssetUrl(agency.logoUrl));
      })
      .catch((error) => console.log('Agency profile load error: ', error))
      .finally(() => setIsLoading(false));
  }, [reset]);

  const askCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };

  const handlePickLogo = () => {
    Alert.alert('Update Agency Logo', 'Select a source to upload image:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (response) => {
            if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
              setLogoUri(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const granted = await askCameraPermission();
          if (!granted) {
            Alert.alert('Permission Required', 'Please allow camera permission to take a photo.');
            return;
          }
          launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false }, (response) => {
            if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
              setLogoUri(response.assets[0].uri);
            }
          });
        },
      },
    ]);
  };

  const onSubmit = async (formData: FormValues) => {
    setIsSaving(true);
    try {
      let updatedAgency: any = null;
      const pickedNewLogo = !!logoUri && logoUri !== resolveAssetUrl(originalLogoUrl);
      if (pickedNewLogo) {
        const body = new FormData();
        body.append('name', formData.name);
        body.append('address', formData.address);
        body.append('contactEmail', formData.contactEmail);
        body.append('contactPhone', formData.contactPhone);
        body.append('logo', {
          uri: logoUri,
          name: `agency_logo_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        updatedAgency = (await agencyApi.updateProfile(body)).data.data.agency;
      } else {
        updatedAgency = (await agencyApi.updateProfile(formData)).data.data.agency;
      }
      if (updatedAgency) {
        dispatch(setAgencyDetails({ agencyName: updatedAgency.name || '', agencyLogoUrl: updatedAgency.logoUrl || '' }));
      }
      Alert.alert('Profile Updated', 'Agency profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not update profile. Please try again.';
      Alert.alert('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Agency Profile</Text>
        <View style={styles.placeholderBox} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={styles.flexOne}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="business" size={32} color={COLORS.primary} />
                </View>
              )}
              <TouchableOpacity style={styles.changeAvatarBtn} onPress={handlePickLogo} activeOpacity={0.8}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Agency Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter agency name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                touched={Boolean(errors.name)}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Address</Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter agency address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                error={errors.address?.message}
                touched={Boolean(errors.address)}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Contact Email</Text>
          <Controller
            control={control}
            name="contactEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter contact email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.contactEmail?.message}
                touched={Boolean(errors.contactEmail)}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Contact Phone</Text>
          <Controller
            control={control}
            name="contactPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter contact phone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.contactPhone?.message}
                touched={Boolean(errors.contactPhone)}
              />
            )}
          />

          <PrimaryButton title="Save Changes" onPress={handleSubmit(onSubmit)} isLoading={isSaving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditAgencyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flexOne: { flex: 1 },
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
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
  placeholderBox: { width: 38 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#BFDBFE',
  },
  avatarPlaceholder: {
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  saveBtn: { marginTop: 10 },
});
