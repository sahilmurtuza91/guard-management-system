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
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { requestApi } from '../../api/endpoints';

const RateSchema = Yup.object().shape({
  rating: Yup.number().min(1, 'Please give at least 1 star').max(5).required('Rating is required'),
  review: Yup.string().trim().max(500, 'Review is too long (max 500 characters)'),
});

type RateForm = Yup.InferType<typeof RateSchema>;

export const RateReviewScreen: React.FC<ScreenProps<'RateReview'>> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const requestLabel = useRequestLabel(requestId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RateForm>({
    resolver: yupResolver(RateSchema) as any,
    defaultValues: { rating: 0, review: '' },
  });

  const handleSubmitReview = async (data: RateForm) => {
    setIsSubmitting(true);
    try {
      await requestApi.rateRequest(requestId, data.rating, (data.review || '').trim() || undefined);
      Alert.alert('Thank You!', 'Your feedback has been submitted.', [
        { text: 'OK', onPress: () => navigation.navigate('MyRequests') },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not submit feedback. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Rate & Review" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.prompt}>How was your security service?</Text>
        <Text style={styles.subPrompt}>{requestLabel}</Text>

        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
                  <Ionicons
                    name={star <= value ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= value ? '#F59E0B' : COLORS.textMuted}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.rating && <Text style={styles.errorText}>{errors.rating.message}</Text>}

        <Controller
          control={control}
          name="review"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Write a review (optional)"
              placeholder="Tell us about the guard's behaviour, punctuality and professionalism..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={5}
              error={errors.review?.message}
              touched={Boolean(errors.review)}
            />
          )}
        />

        <PrimaryButton title="Submit Review" onPress={handleSubmit(handleSubmitReview)} isLoading={isSubmitting} style={styles.submitBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RateReviewScreen;

const styles = StyleSheet.create({
  errorText: { color: COLORS.error, fontSize: 12, marginTop: -20, marginBottom: 16 },
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: 24, paddingBottom: 40, alignItems: 'center' },
  prompt: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subPrompt: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, marginBottom: 24 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  starIcon: { marginHorizontal: 2 },
  submitBtn: { marginTop: 16, width: '100%' },
});