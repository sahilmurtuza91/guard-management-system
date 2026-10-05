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
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateHireDraft } from '../../redux/hireGuardSlice';
import { useHireOptions } from '../../hooks/useHireOptions';
import { LoadingState } from '../../components/LoadingState';

const RequirementsSchema = Yup.object().shape({
  guardCount: Yup.number().min(1, 'At least 1 guard is required').max(50, 'Maximum 50 guards per request').required(),
  genderPreference: Yup.string().required(),
  experienceLevel: Yup.string().required(),
  specialRequirements: Yup.string().trim().max(300, 'Please keep this under 300 characters'),
});

type RequirementsForm = Yup.InferType<typeof RequirementsSchema>;

export const GuardCountRequirementsScreen: React.FC<
  ScreenProps<'GuardCountRequirements'>
> = ({ navigation }) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => (state as any).hireGuard?.draft || {});

  const { options, isLoading: isOptionsLoading } = useHireOptions();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RequirementsForm>({
    resolver: yupResolver(RequirementsSchema),
    defaultValues: {
      guardCount: draft.numberOfGuards || 0,
      genderPreference: draft.genderPreference || '',
      experienceLevel: draft.experienceLevel || '',
      specialRequirements: draft.specialRequirements || '',
    },
  });
  const guardCount = watch('guardCount');
  const genderPreference = watch('genderPreference');
  const experienceLevel = watch('experienceLevel');

  React.useEffect(() => {
    if (!options) return;
    if (!guardCount) setValue('guardCount', options.defaults.guardsCount);
    if (!genderPreference) setValue('genderPreference', options.defaults.gender);
    if (!experienceLevel) setValue('experienceLevel', options.defaults.experience);
  }, [options]); 

  const handleDecrement = () => {
    if (guardCount > 1) setValue('guardCount', guardCount - 1, { shouldValidate: true });
  };

  const handleIncrement = () => {
    setValue('guardCount', guardCount + 1, { shouldValidate: true });
  };

  const handleNext = (data: RequirementsForm) => {
    dispatch(
      updateHireDraft({
        numberOfGuards: data.guardCount,
        genderPreference: data.genderPreference as any,
        experienceLevel: data.experienceLevel as any,
        specialRequirements: data.specialRequirements || '',
      })
    );
    navigation.navigate('SelectDutyLocation');
  };

  if (isOptionsLoading || !options) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Guard Requirements" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading options..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Guard Requirements"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Number of Guards Required</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity
            style={[styles.stepBtn, guardCount <= 1 && styles.disabledStep]}
            onPress={handleDecrement}
            activeOpacity={0.7}
            disabled={guardCount <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={guardCount <= 1 ? COLORS.textMuted : COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.countDisplay}>
            <Text style={styles.countText}>{guardCount}</Text>
            <Text style={styles.countSubText}>
              {guardCount === 1 ? 'Guard' : 'Guards'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={handleIncrement}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Gender Preference</Text>
        <View style={styles.optionsRow}>
          {options.genderOptions.map(gender => {
            const isSelected = genderPreference === gender;
            return (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionChip,
                  isSelected && styles.activeOptionChip,
                ]}
                onPress={() => setValue('genderPreference', gender)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.activeOptionText,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>
          Experience Level Required
        </Text>
        <View style={styles.optionsRow}>
          {options.experienceOptions.map(exp => {
            const isSelected = experienceLevel === exp;
            return (
              <TouchableOpacity
                key={exp}
                style={[
                  styles.optionChip,
                  isSelected && styles.activeOptionChip,
                ]}
                onPress={() => setValue('experienceLevel', exp)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.activeOptionText,
                  ]}
                >
                  {exp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>
          Special Skills / Equipment (Optional)
        </Text>
        <Controller
          control={control}
          name="specialRequirements"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              placeholder="e.g. Firearm licensed, martial arts training, night vision..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              error={errors.specialRequirements?.message}
              touched={Boolean(errors.specialRequirements)}
            />
          )}
        />

        <PrimaryButton
          title="Next"
          onPress={handleSubmit(handleNext)}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuardCountRequirementsScreen;

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledStep: {
    opacity: 0.5,
  },
  countDisplay: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  countSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  activeOptionChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeOptionText: {
    color: COLORS.white,
  },
  nextBtn: {
    marginTop: 30,
  },
});