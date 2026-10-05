import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useRequestLabel } from '../../hooks/useRequestLabel';
import { CustomInput } from "../../components/CustomeInput";
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { requestApi } from '../../api/endpoints';

const CANCEL_REASONS = [
  'Guard no longer required',
  'Found alternate security arrangement',
  'Schedule changed',
  'Pricing concern',
  'Other',
];

const CancelSchema = Yup.object().shape({
  selectedReason: Yup.string().required('Please select a cancellation reason'),
  otherReason: Yup.string().when('selectedReason', {
    is: 'Other',
    then: (schema) => schema.trim().min(5, 'Please write at least 5 characters').required('Please write your reason'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type CancelForm = Yup.InferType<typeof CancelSchema>;

export const CancelRequestScreen: React.FC<ScreenProps<'CancelRequest'>> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const requestLabel = useRequestLabel(requestId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<CancelForm>({
    resolver: yupResolver(CancelSchema) as any,
    defaultValues: { selectedReason: '', otherReason: '' },
  });
  const selectedReason = watch('selectedReason');

  const handleConfirmCancel = async (data: CancelForm) => {
    setIsSubmitting(true);
    try {
      const reason = data.selectedReason === 'Other' ? (data.otherReason || '').trim() : data.selectedReason;
      await requestApi.cancelRequest(requestId, reason);
      Alert.alert('Request Cancelled', 'Your request has been cancelled.', [
        { text: 'OK', onPress: () => navigation.navigate('MyRequests') },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not cancel the request. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Cancel Request" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={22} color={COLORS.error} />
          <Text style={styles.warningText}>
            Cancelling "{requestLabel}" will also cancel all assigned guards and shifts. This action cannot be undone.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Select a reason for cancellation</Text>
        <Controller
          control={control}
          name="selectedReason"
          render={({ field: { onChange, value } }) => (
            <>
              {CANCEL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, value === reason && styles.reasonRowActive]}
                  onPress={() => onChange(reason)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.radio, value === reason && styles.radioActive]}>
                    {value === reason && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        />
        {errors.selectedReason && <Text style={styles.errorText}>{errors.selectedReason.message}</Text>}

        {selectedReason === 'Other' && (
          <Controller
            control={control}
            name="otherReason"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                placeholder="Write your reason..."
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                error={errors.otherReason?.message}
                touched={Boolean(errors.otherReason)}
              />
            )}
          />
        )}

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <OutlineButton title="Keep Request" onPress={() => navigation.goBack()} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title="Cancel Request"
              onPress={handleSubmit(handleConfirmCancel)}
              isLoading={isSubmitting}
              style={styles.dangerBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CancelRequestScreen;

const styles = StyleSheet.create({
  errorText: { color: COLORS.error, fontSize: 12, marginBottom: 12, marginLeft: 4 },
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: 24, paddingBottom: 40 },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: { flex: 1, fontSize: 12, color: '#991B1B', fontWeight: '600', lineHeight: 17 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reasonRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.accentLight },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  reasonText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  dangerBtn: { backgroundColor: COLORS.error },
});