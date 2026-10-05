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

type SiteMapGeofenceScreenProps = {
  route: {
    params?: {
      siteId?: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: object) => void;
  };
};

const GeofenceSchema = Yup.object({
  radius: Yup.number()
    .typeError('Enter radius in meters')
    .min(50, 'Minimum 50 meters')
    .required('Radius is required'),

  lat: Yup.number()
    .typeError('Enter a valid latitude')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .required('Latitude is required'),

  lng: Yup.number()
    .typeError('Enter a valid longitude')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .required('Longitude is required'),
});

type GeofenceForm = Yup.InferType<typeof GeofenceSchema>;

export const SiteMapGeofenceScreen: React.FC<
  SiteMapGeofenceScreenProps
> = ({ route, navigation }) => {
  const siteId = route.params?.siteId || '';

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GeofenceForm>({
    resolver: yupResolver(GeofenceSchema) as any,
    defaultValues: {
      radius: '' as any,
      lat: '' as any,
      lng: '' as any,
    },
  });

  const radius = watch('radius');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSiteDetails = async () => {
      if (!siteId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await clientSiteApi.getSiteDetails(siteId);
        const site = response.data.data.site;

        reset({
          radius: site.geofenceRadiusMeters ?? ('' as any),
          lat: site.latitude ?? ('' as any),
          lng: site.longitude ?? ('' as any),
        });
      } catch (error) {
        console.log('Site load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteDetails();
  }, [siteId, reset]);

  const handleSaveGeofence = async (data: GeofenceForm) => {
    setIsSaving(true);

    try {
      await clientSiteApi.updateGeofence(siteId!, {
        geofenceRadiusMeters: Number(data.radius),
        latitude: Number(data.lat),
        longitude: Number(data.lng),
      });

      Alert.alert(
        'Success',
        'Site map and geofence settings updated successfully!',
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
        'Could not update geofence. Please try again.';

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

        <LoadingState message="Loading site..." />
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

        <Text style={styles.headerTitle}>
          Site Map & Geofence
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapMockBox}>
          <Ionicons
            name="map-outline"
            size={40}
            color={COLORS.primary}
          />

          <Text style={styles.mapMockText}>
            Interactive Geofence Map View
          </Text>

          <Text style={styles.mapMockSub}>
            Radius boundary: {radius} meters
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="radius"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Geofence Radius (meters)"
                placeholder="e.g. 200"
                value={
                  value === undefined || value === null
                    ? ''
                    : String(value)
                }
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.radius?.message}
                touched={Boolean(errors.radius)}
              />
            )}
          />

          <Controller
            control={control}
            name="lat"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Latitude"
                placeholder="Site latitude"
                value={
                  value === undefined || value === null
                    ? ''
                    : String(value)
                }
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.lat?.message}
                touched={Boolean(errors.lat)}
              />
            )}
          />

          <Controller
            control={control}
            name="lng"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Longitude"
                placeholder="Site longitude"
                value={
                  value === undefined || value === null
                    ? ''
                    : String(value)
                }
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.lng?.message}
                touched={Boolean(errors.lng)}
              />
            )}
          />

          <PrimaryButton
            title="Save Geofence Settings"
            onPress={handleSubmit(handleSaveGeofence)}
            isLoading={isSaving}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SiteMapGeofenceScreen;

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

  mapMockBox: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  mapMockText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 8,
  },

  mapMockSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  formContainer: {
    width: '100%',
  },

  submitBtn: {
    marginTop: 20,
  },
});