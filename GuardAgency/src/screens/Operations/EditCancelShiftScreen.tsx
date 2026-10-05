import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { LoadingState } from '../../components/LoadingState';

import { operationsApi } from '../../api/endpoints';

const TIME_REGEX = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i;

const ShiftSchema = Yup.object().shape({
  guardName: Yup.string(),
  siteName: Yup.string(),
  startTime: Yup.string().trim().matches(TIME_REGEX, 'Use format e.g. 09:00 AM').required('Start time is required'),
  endTime: Yup.string().trim().matches(TIME_REGEX, 'Use format e.g. 05:00 PM').required('End time is required'),
  reportingTime: Yup.string().trim().matches(/^(|(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM))$/i, 'Use format e.g. 08:45 AM'),
  breakTime: Yup.string().trim(),
  supervisorName: Yup.string().trim(),
  supervisorPhone: Yup.string().trim().matches(/^([+]?[0-9]{10,13})?$/, 'Enter a valid phone number'),
  cancelReason: Yup.string().trim(),
});

type ShiftForm = Yup.InferType<typeof ShiftSchema>;

export const EditCancelShiftScreen: React.FC<ScreenProps<'EditCancelShift'>> = ({ route, navigation }) => {
  const { shiftId } = route.params;
  const { control, handleSubmit, reset, getValues, formState: { errors } } = useForm<ShiftForm>({
    resolver: yupResolver(ShiftSchema) as any,
    defaultValues: {
      guardName: '', siteName: '', startTime: '', endTime: '', reportingTime: '',
      breakTime: '', supervisorName: '', supervisorPhone: '', cancelReason: '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      operationsApi
        .getShiftDetails(shiftId)
        .then((res) => {
          const s = res.data.data.shift;
          reset({
            guardName: s.guard?.user?.name || '',
            siteName: s.site?.name || '',
            startTime: s.startTime || '',
            endTime: s.endTime || '',
            reportingTime: s.reportingTime || '',
            breakTime: s.breakTime || '',
            supervisorName: s.supervisorName || '',
            supervisorPhone: s.supervisorPhone || '',
            cancelReason: '',
          });
        })
        .catch((error) => console.log('Shift load error: ', error))
        .finally(() => setIsLoading(false));
    }, [shiftId, reset])
  );

  const handleUpdateShift = async (data: ShiftForm) => {
    setIsSaving(true);
    try {
      await operationsApi.updateShift(shiftId, {
        startTime: data.startTime.trim(),
        endTime: data.endTime.trim(),
        reportingTime: (data.reportingTime || '').trim(),
        breakTime: (data.breakTime || '').trim(),
        supervisorName: (data.supervisorName || '').trim(),
        supervisorPhone: (data.supervisorPhone || '').trim(),
      });
      Alert.alert('Success', 'Shift updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not update shift. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelShift = () => {
    Alert.alert('Cancel Shift', 'Are you sure you want to cancel this shift? The guard will be notified.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setIsCancelling(true);
          try {
            await operationsApi.cancelShift(shiftId, (getValues('cancelReason') || '').trim());
            Alert.alert('Shift Cancelled', 'The shift has been cancelled and the guard has been notified.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch (error: any) {
            const message = error?.response?.data?.message || 'Could not cancel shift. Please try again.';
            Alert.alert('Error', message);
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading shift..." />
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
        <Text style={styles.headerTitle}>Edit Shift</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Controller
              control={control}
              name="guardName"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Assigned Guard"
                      placeholder="Guard Name"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={false}
                      error={errors.guardName?.message}
                      touched={Boolean(errors.guardName)}
                  />
              )}
          />

          <Controller
              control={control}
              name="siteName"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Site"
                      placeholder="Site Name"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={false}
                      error={errors.siteName?.message}
                      touched={Boolean(errors.siteName)}
                  />
              )}
          />

          <Controller
              control={control}
              name="startTime"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Start Time"
                      placeholder="e.g. 09:00 AM"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.startTime?.message}
                      touched={Boolean(errors.startTime)}
                  />
              )}
          />

          <Controller
              control={control}
              name="endTime"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="End Time"
                      placeholder="e.g. 05:00 PM"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.endTime?.message}
                      touched={Boolean(errors.endTime)}
                  />
              )}
          />

          <Controller
              control={control}
              name="reportingTime"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Reporting Time"
                      placeholder="e.g. 08:45 AM"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.reportingTime?.message}
                      touched={Boolean(errors.reportingTime)}
                  />
              )}
          />

          <Controller
              control={control}
              name="breakTime"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Break Time"
                      placeholder="e.g. 01:00 PM - 01:30 PM"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.breakTime?.message}
                      touched={Boolean(errors.breakTime)}
                  />
              )}
          />

          <Controller
              control={control}
              name="supervisorName"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Supervisor Name"
                      placeholder="Supervisor Name"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.supervisorName?.message}
                      touched={Boolean(errors.supervisorName)}
                  />
              )}
          />

          <Controller
              control={control}
              name="supervisorPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      label="Supervisor Phone"
                      placeholder="Supervisor Phone"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      error={errors.supervisorPhone?.message}
                      touched={Boolean(errors.supervisorPhone)}
                  />
              )}
          />

          <PrimaryButton 
            title="Update Shift" 
            onPress={handleSubmit(handleUpdateShift)} 
            isLoading={isSaving}
            style={styles.submitBtn} 
          />

          <Text style={[styles.label, styles.dangerLabel]}>Cancel this shift</Text>
          <Controller
              control={control}
              name="cancelReason"
              render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                      placeholder="Reason for cancellation (optional)"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={3}
                      error={errors.cancelReason?.message}
                      touched={Boolean(errors.cancelReason)}
                  />
              )}
          />
          <OutlineButton
            title="Cancel Shift"
            variant="danger"
            onPress={handleCancelShift}
            disabled={isCancelling}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditCancelShiftScreen;

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
  dangerLabel: {
    marginTop: 28,
    color: '#DC2626',
  },
  cancelBtn: {
    marginTop: 12,
  },
});