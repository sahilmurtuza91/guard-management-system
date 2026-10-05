import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateHireDraft } from '../../redux/hireGuardSlice';
import { useHireOptions } from '../../hooks/useHireOptions';
import { LoadingState } from '../../components/LoadingState';

const ServiceDetailsSchema = Yup.object().shape({
  purpose: Yup.string().required('Please select a purpose'),
  shiftType: Yup.string().oneOf(['Single Shift', 'Multiple Shift']).required(),
  duration: Yup.number().min(1, 'Please select a duration').required('Please select a duration'),
  brief: Yup.string().trim().max(500, 'Brief is too long (max 500 characters)'),
});

type ServiceDetailsForm = Yup.InferType<typeof ServiceDetailsSchema>;

export const ServiceDetailsScreen: React.FC<ScreenProps<'ServiceDetails'>> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => (state as any).hireGuard?.draft || {});

  const { options, isLoading: isOptionsLoading } = useHireOptions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ServiceDetailsForm>({
    resolver: yupResolver(ServiceDetailsSchema),
    defaultValues: {
      purpose: draft.purpose || '',
      shiftType: draft.shiftType || 'Single Shift',
      duration: draft.durationHours || 0,
      brief: draft.briefRequirement || '',
    },
  });
  const purpose = watch('purpose');
  const shiftType = watch('shiftType');
  const duration = watch('duration');

  React.useEffect(() => {
    if (!options) return;
    if (!purpose && options.purposes.length) setValue('purpose', options.purposes[0]);
    if (!duration) setValue('duration', options.defaults.durationHours);
  }, [options]); 

  const handleNext = (data: ServiceDetailsForm) => {
    dispatch(
      updateHireDraft({
        purpose: data.purpose,
        shiftType: data.shiftType as any,
        durationHours: data.duration,
        briefRequirement: data.brief || '',
      })
    );
    navigation.navigate('SelectDateTime');
  };

  if (isOptionsLoading || !options) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Service Details" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading options..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Service Details" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryBadge}>{route.params?.categoryName || draft.serviceType || 'Guard Service'}</Text>

        <Text style={styles.label}>Purpose of Requirement</Text>
        
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownHeaderText}>{purpose}</Text>
            <Ionicons
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {options.purposes.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.dropdownItem, purpose === p && styles.selectedDropdownItem]}
                  onPress={() => {
                    setValue('purpose', p, { shouldValidate: true });
                    setIsDropdownOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.dropdownItemText, purpose === p && styles.selectedDropdownItemText]}
                  >
                    {p}
                  </Text>
                  {purpose === p && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.label}>Shift Type</Text>
        <View style={styles.tabToggle}>
          {(['Single Shift', 'Multiple Shift'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, shiftType === type && styles.activeToggleBtn]}
              onPress={() => setValue('shiftType', type)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, shiftType === type && styles.activeToggleText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Duration (Hours per Shift)</Text>
        <View style={styles.durationRow}>
          {options.durations.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.durationBox, duration === d && styles.activeDurationBox]}
              onPress={() => setValue('duration', d, { shouldValidate: true })}
              activeOpacity={0.8}
            >
              <Text style={[styles.durationText, duration === d && styles.activeDurationText]}>
                {d} Hours
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Brief About Requirement (Optional)</Text>
        <Controller
          control={control}
          name="brief"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              placeholder="Write your specific guard duties or instructions..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              error={errors.brief?.message}
              touched={Boolean(errors.brief)}
            />
          )}
        />

        <PrimaryButton title="Next" onPress={handleSubmit(handleNext)} style={styles.nextBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentLight,
    color: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedDropdownItem: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedDropdownItemText: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activeToggleBtn: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  activeToggleText: { color: COLORS.white },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  durationBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  activeDurationBox: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  durationText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  activeDurationText: { color: COLORS.white },
  nextBtn: { marginTop: 10 },
});