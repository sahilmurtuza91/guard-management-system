import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useRequestLabel } from '../../hooks/useRequestLabel';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { requestApi } from '../../api/endpoints';

const ReplacementSchema = Yup.object().shape({
  reason: Yup.string().trim().min(10, 'Please write at least 10 characters').required('Reason is required'),
});

type ReplacementForm = Yup.InferType<typeof ReplacementSchema>;

export const RequestReplacementScreen: React.FC<ScreenProps<'RequestReplacement'>> = ({
  navigation,
  route,
}) => {
  const { requestId } = route.params;
  const requestLabel = useRequestLabel(requestId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ReplacementForm>({
    resolver: yupResolver(ReplacementSchema),
    defaultValues: { reason: '' },
  });

  const handleSendRequest = async ({ reason }: ReplacementForm) => {
    setIsSubmitting(true);
    try {
      await requestApi.requestReplacement(requestId, reason.trim());
      Alert.alert(
        'Replacement Requested',
        'Your replacement request has been sent to the agency with URGENT priority. They will assign a new guard soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not send the replacement request. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Request Replacement" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.urgentBox}>
          <Ionicons name="flash" size={20} color="#C2410C" />
          <Text style={styles.urgentText}>
            This request goes to the agency with an URGENT flag so a new guard can be assigned as soon as possible.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>{requestLabel}</Text>

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Why do you need a replacement?"
              placeholder="e.g. the current guard is not punctual, or went on emergency leave..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={5}
              error={errors.reason?.message}
              touched={Boolean(errors.reason)}
            />
          )}
        />

        <PrimaryButton
          title="Send Urgent Request"
          onPress={handleSubmit(handleSendRequest)}
          isLoading={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestReplacementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 24, paddingBottom: 40 },
  urgentBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  urgentText: { flex: 1, fontSize: 12, color: '#9A3412', fontWeight: '600', lineHeight: 17 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase' },
  submitBtn: { marginTop: 16, backgroundColor: '#C2410C' },
});