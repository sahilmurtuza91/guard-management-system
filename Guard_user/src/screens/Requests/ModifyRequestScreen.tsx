import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useRequestLabel } from '../../hooks/useRequestLabel';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';

const ModifySchema = Yup.object().shape({
  date: Yup.string().trim().required('Date is required'),
  startTime: Yup.string().trim().required('Start time is required'),
  endTime: Yup.string().trim().required('End time is required'),
  guardsCount: Yup.string()
    .matches(/^[1-9][0-9]?$/, 'Enter number of guards (1-99)')
    .required('Number of guards is required'),
  instructions: Yup.string().trim().max(500, 'Instructions are too long (max 500 characters)'),
});

type ModifyForm = Yup.InferType<typeof ModifySchema>;

export const ModifyRequestScreen: React.FC<ScreenProps<'ModifyRequest'>> = ({
  navigation,
  route,
}) => {
  const { requestId } = route.params;
  const requestLabel = useRequestLabel(requestId);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ModifyForm>({
    resolver: yupResolver(ModifySchema),
    defaultValues: { date: '', startTime: '', endTime: '', guardsCount: '', instructions: '' },
  });

  useEffect(() => {
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const request = res.data.data.request;
        reset({
          date: request.date ? new Date(request.date).toDateString() : '',
          startTime: request.startTime || '',
          endTime: request.endTime || '',
          guardsCount: String(request.guardsCount || ''),
          instructions: request.additionalInstructions || '',
        });
      })
      .catch((error) => console.log('Request details load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId, reset]);

  const handleModify = async (data: ModifyForm) => {
    setIsSubmitting(true);
    try {
      await requestApi.modifyRequest(requestId, {
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        guardsCount: Number(data.guardsCount) || undefined,
        additionalInstructions: data.instructions,
      });
      Alert.alert(
        'Request Updated',
        'Your changes have been sent to the agency. If a guard is already assigned, the changes will be confirmed after agency approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not modify the request. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Modify Request" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading request..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Modify Request" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Ionicons name="information-circle" size={18} color={COLORS.warning} />
            <Text style={styles.noticeText}>
              Changes made after assigning a guard require agency approval.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{requestLabel}</Text>

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Date"
              placeholder="DD MMM YYYY"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.date?.message}
              touched={Boolean(errors.date)}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Start Time"
                  placeholder="09:00 AM"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.startTime?.message}
                  touched={Boolean(errors.startTime)}
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="End Time"
                  placeholder="05:00 PM"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.endTime?.message}
                  touched={Boolean(errors.endTime)}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="guardsCount"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Guards Required"
              placeholder="2"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              error={errors.guardsCount?.message}
              touched={Boolean(errors.guardsCount)}
            />
          )}
        />

        <Controller
          control={control}
          name="instructions"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Additional Instructions"
              placeholder="Any new instruction..."
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

        <PrimaryButton
          title="Submit Changes"
          onPress={handleSubmit(handleModify)}
          isLoading={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModifyRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 24, paddingBottom: 40 },
  noticeCard: {
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  noticeText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600', lineHeight: 17 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, marginBottom: 16, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  submitBtn: { marginTop: 12 },
});