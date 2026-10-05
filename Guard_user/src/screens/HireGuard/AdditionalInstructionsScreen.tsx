import React from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateHireDraft } from '../../redux/hireGuardSlice';

const InstructionsSchema = Yup.object().shape({
  contactPerson: Yup.string().trim().min(2, 'Name is too short').required('Contact person is required'),
  contactNumber: Yup.string()
    .trim()
    .matches(/^[+]?[0-9]{10,13}$/, 'Enter a valid mobile number')
    .required('Contact number is required'),
  landmark: Yup.string().trim().max(100, 'Landmark is too long'),
  instructions: Yup.string().trim().max(500, 'Instructions are too long (max 500 characters)'),
});

type InstructionsForm = Yup.InferType<typeof InstructionsSchema>;

export const AdditionalInstructionsScreen: React.FC<ScreenProps<'AdditionalInstructions'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => state.hireGuard.draft);
  const user = useSelector((state: RootState) => state.auth.user);

  const { control, handleSubmit, formState: { errors } } = useForm<InstructionsForm>({
    resolver: yupResolver(InstructionsSchema),
    defaultValues: {
      contactPerson: draft.contactPerson || user?.name || '',
      contactNumber: draft.contactNumber || user?.phone || '',
      landmark: draft.landmark || '',
      instructions: draft.additionalInstructions || '',
    },
  });

  const handleNext = (data: InstructionsForm) => {
    dispatch(
      updateHireDraft({
        contactPerson: data.contactPerson,
        contactNumber: data.contactNumber,
        landmark: data.landmark || '',
        additionalInstructions: data.instructions || '',
      })
    );
    navigation.navigate('ReviewRequest');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Additional Instructions" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Controller
            control={control}
            name="contactPerson"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Contact Person"
                placeholder="Name of onsite contact person"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.contactPerson?.message}
                touched={Boolean(errors.contactPerson)}
              />
            )}
          />
          <Controller
            control={control}
            name="contactNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Contact Number"
                placeholder="Mobile number for guard reporting"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.contactNumber?.message}
                touched={Boolean(errors.contactNumber)}
              />
            )}
          />
          <Controller
            control={control}
            name="landmark"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Landmark (Optional)"
                placeholder="e.g. Opposite Metro Station"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.landmark?.message}
                touched={Boolean(errors.landmark)}
              />
            )}
          />
          <Controller
            control={control}
            name="instructions"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Additional Instructions"
                placeholder="Special instructions for guard arrival, dress code, or gate pass..."
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                error={errors.instructions?.message}
                touched={Boolean(errors.instructions)}
              />
            )}
          />

          <PrimaryButton title="Next" onPress={handleSubmit(handleNext)} style={styles.nextBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flexOne: { flex: 1 },
  scrollContent: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  nextBtn: { marginTop: 20 },
});