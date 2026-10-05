import React, { useEffect, useState } from 'react';
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
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';

import { clientSiteApi } from '../../api/endpoints';

const SiteSchema = Yup.object({
  siteName: Yup.string()
    .trim()
    .required('Site name is required'),
  location: Yup.string()
    .trim()
    .required('Address is required'),
  latitude: Yup.number()
    .typeError('Enter a valid latitude')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .required('Latitude is required'),
  longitude: Yup.number()
    .typeError('Enter a valid longitude')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .required('Longitude is required'),
  geofenceRadius: Yup.number()
    .typeError('Enter radius in meters')
    .min(50, 'Minimum 50 meters')
    .required('Radius is required'),
});

type SiteForm = Yup.InferType<typeof SiteSchema>;

type Props = {
  navigation: any;
  route: any;
};

export const AddEditSiteScreen: React.FC<Props> = ({ navigation, route }) => {
  const siteId = route.params?.siteId;
  const isEditMode = !!siteId;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset, formState: { errors } } = useForm<SiteForm>({
      resolver: yupResolver(SiteSchema),
      defaultValues: {
        siteName: '',
        location: '',
        latitude: '' as any,
        longitude: '' as any,
        geofenceRadius: 500
      },
    });

  useEffect(() => {
    if (!isEditMode) return;

    const loadSite = async () => {
      try {
        const response = await clientSiteApi.getSiteDetails(siteId!);
        const site = response.data.data.site;

        reset({
          siteName: site.name || '',
          location: site.address || '',
          latitude: site.latitude ?? ('' as any),
          longitude: site.longitude ?? ('' as any),
          geofenceRadius: site.geofenceRadiusMeters ?? 500,
        });
      } catch (error) {
        console.log('Site load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSite();
  }, [isEditMode, siteId, reset]);

  const handleSaveSite = async (data: SiteForm) => {
    setIsSaving(true);
    try {
      const payload = {
        name: data.siteName.trim(),
        address: data.location.trim(),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        geofenceRadiusMeters: Number(data.geofenceRadius) || 200,
      };

      if (isEditMode) {
        await clientSiteApi.updateSite(siteId!, payload);
      } else {
        await clientSiteApi.addSite(payload);
      }
      Alert.alert('Success', 'Site details saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not save site. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading site..." />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Add / Edit Site</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="siteName"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Site Name"
                placeholder="e.g. City Mall Block B"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.siteName?.message}
                touched={Boolean(errors.siteName)}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Location / Address"
                placeholder="e.g. Mohali, Punjab"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.location?.message}
                touched={Boolean(errors.location)}
              />
            )}
          />

          <Controller
            control={control}
            name="latitude"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Latitude"
                placeholder="e.g. 30.7056"
                value={value === undefined || value === null ? '' : String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.latitude?.message}
                touched={Boolean(errors.latitude)}
              />
            )}
          />

          <Controller
            control={control}
            name="longitude"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Longitude"
                placeholder="e.g. 76.7179"
                value={value === undefined || value === null ? '' : String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.longitude?.message}
                touched={Boolean(errors.longitude)}
              />
            )}
          />

          <Controller
            control={control}
            name="geofenceRadius"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Geofence Radius (meters)"
                placeholder="500"
                value={value === undefined || value === null ? '' : String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.geofenceRadius?.message}
                touched={Boolean(errors.geofenceRadius)}
              />
            )}
          />

          <PrimaryButton
            title="Save Site"
            onPress={handleSubmit(handleSaveSite)}
            isLoading={isSaving}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEditSiteScreen;

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
  submitBtn: {
    marginTop: 24,
  },
});