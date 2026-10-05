import React, { useEffect, useState } from 'react';
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
import { LoadingState } from '../../components/LoadingState';

import { guardManagementApi, clientSiteApi, operationsApi } from '../../api/endpoints';

const CreateShiftSchema = Yup.object({
  siteId: Yup.string()
    .required('Please select a site'),
  guardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Please select at least one guard')
    .required('Please select at least one guard'),
  date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
    .required('Shift date is required'),
  startTime: Yup.string()
    .required('Start time is required'),
  endTime: Yup.string()
    .required('End time is required'),
  shiftType: Yup.string()
    .required('Shift type is required'),
});

type FormValues = Yup.InferType<typeof CreateShiftSchema>;

interface SelectItem {
  id: string;
  label: string;
  sub: string;
}

export const CreateShiftScreen: React.FC<ScreenProps<'CreateShift'>> = ({ navigation }) => {
  const [guards, setGuards] = useState<SelectItem[]>([]);
  const [sites, setSites] = useState<SelectItem[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isGuardDropdownOpen, setIsGuardDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(CreateShiftSchema),
    defaultValues: {
      siteId: '',
      guardIds: [],
      date: '',
      startTime: '',
      endTime: '',
      shiftType: 'General Shift',
    },
  });

  const selectedSiteId = watch('siteId');
  const selectedGuardIds = watch('guardIds') || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [guardsRes, siteRes] = await Promise.all([
          guardManagementApi.getGuards({ status: "Active" }),
          clientSiteApi.getSites(),
        ]);
        const guardList = guardsRes.data.data.guards || [];
        const siteList = siteRes.data.data.sites || [];
        setGuards(
          guardList.map((guard: any) => ({
            id: guard._id,
            label: guard.user?.name || 'Guard',
            sub: guard.experienceYears
              ? `${guard.experienceYears} yrs experience`
              : 'Active guard',
          })),
        );
        setSites(
          siteList.map((site: any) => ({
            id: site._id,
            label: site.name,
            sub: site.address || '',
          })),
        );
      } catch (error) {
        console.log("Create shift data load error: ", error);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    loadData();
  }, [])

  const toggleGuardSelection = (guardId: string) => {
    let updatedGuards: string[];
    if (selectedGuardIds.includes(guardId)) {
      updatedGuards = selectedGuardIds.filter((id) => id !== guardId);
    } else {
      updatedGuards = [...selectedGuardIds, guardId];
    }
    setValue('guardIds', updatedGuards, { shouldValidate: true });
  };

  const onSubmit = async (formData: FormValues) => {
    setIsSaving(true);
    try {
      await operationsApi.createShift({
        guardIds: formData.guardIds,
        siteId: formData.siteId,
        date: formData.date.trim(),
        startTime: formData.startTime.trim(),
        endTime: formData.endTime.trim(),
        shiftType: formData.shiftType.trim(),
      });
      Alert.alert('Success', 'Shift created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not create shift. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedSiteLabel = () => {
    const foundSite = sites.find(site => site.id === selectedSiteId);

    return foundSite ? foundSite.label : 'Select Site';
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
        <Text style={styles.headerTitle}>Create Shift</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoadingOptions ? (
        <LoadingState message="Loading guards and sites..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>

            <Text style={styles.label}>Select Site</Text>
            <TouchableOpacity
              style={[styles.dropdownHeader, isSiteDropdownOpen && styles.dropdownHeaderActive]}
              onPress={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownHeaderText, !selectedSiteId && styles.placeholderText]}>
                {getSelectedSiteLabel()}
              </Text>
              <Ionicons
                name={isSiteDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {isSiteDropdownOpen && (
              <View style={styles.dropdownBody}>
                {sites.length === 0 ? (
                  <Text style={styles.emptyHint}>No sites found. Add a site first.</Text>
                ) : (
                  sites.map((site) => (
                    <TouchableOpacity
                      key={site.id}
                      style={[styles.pickCard, selectedSiteId === site.id && styles.pickCardActive]}
                      onPress={() => {
                        setValue('siteId', site.id, { shouldValidate: true });
                        setIsSiteDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickLabel}>{site.label}</Text>
                        {!!site.sub && <Text style={styles.pickSub}>{site.sub}</Text>}
                      </View>
                      {selectedSiteId === site.id && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
            {errors.siteId?.message && (
              <Text style={styles.errorText}>{errors.siteId.message}</Text>
            )}

            <Text style={[styles.label, { marginTop: 14 }]}>Select Guard(s)</Text>
            <TouchableOpacity
              style={[styles.dropdownHeader, isGuardDropdownOpen && styles.dropdownHeaderActive]}
              onPress={() => setIsGuardDropdownOpen(!isGuardDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownHeaderText, selectedGuardIds.length === 0 && styles.placeholderText]}>
                {selectedGuardIds.length > 0
                  ? `${selectedGuardIds.length} Guard(s) Selected`
                  : 'Select Guards'}
              </Text>
              <Ionicons
                name={isGuardDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {isGuardDropdownOpen && (
              <View style={styles.dropdownBody}>
                {guards.length === 0 ? (
                  <Text style={styles.emptyHint}>No active guards found. Add a guard first.</Text>
                ) : (
                  guards.map((guard) => {
                    const isSelected = selectedGuardIds.includes(guard.id);
                    return (
                      <TouchableOpacity
                        key={guard.id}
                        style={[styles.pickCard, isSelected && styles.pickCardActive]}
                        onPress={() => toggleGuardSelection(guard.id)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pickLabel}>{guard.label}</Text>
                          {!!guard.sub && <Text style={styles.pickSub}>{guard.sub}</Text>}
                        </View>
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
            {errors.guardIds?.message && (
              <Text style={styles.errorText}>{errors.guardIds.message}</Text>
            )}

            <Text style={[styles.label, { marginTop: 14 }]}>Shift Date</Text>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.date?.message}
                  touched={Boolean(errors.date)}
                />
              )}
            />

            <Text style={styles.label}>Start Time</Text>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="e.g. 09:00 AM"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.startTime?.message}
                  touched={Boolean(errors.startTime)}
                />
              )}
            />

            <Text style={styles.label}>End Time</Text>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="e.g. 05:00 PM"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.endTime?.message}
                  touched={Boolean(errors.endTime)}
                />
              )}
            />

            <Text style={styles.label}>Shift Type</Text>
            <Controller
              control={control}
              name="shiftType"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="e.g. General Shift"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.shiftType?.message}
                  touched={Boolean(errors.shiftType)}
                />
              )}
            />

            <PrimaryButton
              title="Create Shift"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSaving}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CreateShiftScreen;

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
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownHeaderActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dropdownBody: {
    marginTop: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  pickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  pickCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  pickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pickSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    padding: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  submitBtn: {
    marginTop: 24,
  },
});