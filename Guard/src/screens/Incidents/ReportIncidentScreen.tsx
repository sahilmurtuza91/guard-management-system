import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';

import {
  addNewIncident,
  IncidentItem,
  IncidentType,
  PriorityLevel,
} from '../../redux/incidentSlice';
import { mapBackendIncident } from './IncidentListScreen';
import { getCurrentGuardLocation } from '../../utils/locationService';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { guardApi } from '../../api/endpoints';

const incidentTypes: IncidentType[] = [
  'Theft',
  'Unauthorized Entry',
  'Fire',
  'Medical Emergency',
  'Property Damage',
  'Suspicious Activity',
  'Other',
];

const priorityOptions: PriorityLevel[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

const formSchema = Yup.object().shape({
  location: Yup.string()
    .required('Location is required'),

  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
});

interface ReportIncidentScreenProps {
  navigation: any;
}

export const ReportIncidentScreen: React.FC<ReportIncidentScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [incidentType, setIncidentType] = useState<IncidentType>('Unauthorized Entry');
  const [showTypeList, setShowTypeList] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const currentDateTime = new Date().toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      location: '',
      description: '',
    },
  });

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const location = await getCurrentGuardLocation();
      setValue('location', location.address, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      Alert.alert(
        'Location Error',
        'Failed to load your current location. Please try again.'
      );
    } finally {
      setLocating(false);
    }
  };

  const askCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };
  const selectImage = () => {
    Alert.alert(
      'Attach Photo Evidence',
      'Select a source to upload image:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.7,
                selectionLimit: 1,
              },
              response => {
                if (response.assets && response.assets.length > 0) {
                  setImageUri(response.assets[0].uri || null);
                }
              }
            );
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            const cameraPermission = await askCameraPermission();
            if (!cameraPermission) {
              Alert.alert(
                'Permission Required',
                'Please allow camera permission to take a photo.'
              );
              return;
            }
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.7,
                saveToPhotos: false,
                includeBase64: false,
              },
              response => {
                if (response.assets && response.assets.length > 0) {
                  setImageUri(response.assets[0].uri || null);
                }
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const submitReport = async (data: { location: string; description: string }) => {
    setSubmitting(true);

    try {
      const now = new Date();
      const formData = new FormData();
      formData.append('title', incidentType);
      formData.append('incidentType', incidentType);
      formData.append('priority', priority);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('dateTime', now.toISOString());

      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          name: `incident_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const response = await guardApi.createIncident(formData);
      const createdIncident = response.data.data.incident;
      dispatch(addNewIncident(mapBackendIncident(createdIncident)));

      setSubmitting(false);
      Alert.alert(
        'Success',
        `Incident report has been submitted successfully.`,
        [
          {
            text: 'View Incidents',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setSubmitting(false);
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert(
        'Submission Failed',
        message
      );
    }
  };

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

        <Text style={styles.headerTitle}>Report Incident</Text>
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
          <Text style={styles.fieldLabel}>Incident Type</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={[
                styles.dropdownHeader,
                showTypeList && styles.dropdownHeaderActive,
              ]}
              onPress={() => setShowTypeList(prev => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownSelectedText}>{incidentType}</Text>
              <Ionicons
                name={showTypeList ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            {showTypeList && (
              <View style={styles.dropdownMenu}>
                {incidentTypes.map(type => {
                  const isSelected = incidentType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.dropdownMenuItem,
                        isSelected && styles.dropdownMenuItemSelected,
                      ]}
                      onPress={() => {
                        setIncidentType(type);
                        setShowTypeList(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <Text style={styles.fieldLabel}>Priority Level</Text>
          <View style={styles.priorityRow}>
            {priorityOptions.map(option => {
              const isSelected = priority === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.priorityBtn,
                    isSelected && styles.selectedPriorityBtn,
                  ]}
                  onPress={() => setPriority(option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.priorityBtnText,
                      isSelected && styles.selectedPriorityText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.locationLabelRow}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TouchableOpacity
              style={styles.gpsLocationBtn}
              onPress={useCurrentLocation}
              disabled={locating}
              activeOpacity={0.7}
            >
              {locating ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Ionicons name="navigate" size={14} color="#2563EB" />
              )}
              <Text style={styles.gpsLocationText}>
                {locating ? 'Detecting...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Enter incident location"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.location?.message}
                touched={Boolean(errors.location)}
              />
            )}
          />
          <Text style={styles.fieldLabel}>Date & Time</Text>
          <View style={styles.dateTimeBox}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <Text style={styles.dateTimeText}>{currentDateTime}</Text>
          </View>

          <Text style={styles.fieldLabel}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Describe Incident in detail..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline={true}
                numberOfLines={4}
                error={errors.description?.message}
                touched={Boolean(errors.description)}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Photo Evidence Attachment</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageUri(null)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={COLORS.error}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={selectImage}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={26} color={COLORS.primary} />
              <Text style={styles.uploadText}>
                Capture Photo or Choose from Gallery
              </Text>
            </TouchableOpacity>
          )}
          <PrimaryButton
            title="Submit Incident Report"
            onPress={handleSubmit(submitReport)}
            isLoading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReportIncidentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  dropdownHeaderActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: COLORS.primary,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownMenuItemSelected: {
    backgroundColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPriorityBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  selectedPriorityText: {
    color: COLORS.white,
  },
  locationLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gpsLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  gpsLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  uploadBox: {
    height: 96,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 13,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
  },
});