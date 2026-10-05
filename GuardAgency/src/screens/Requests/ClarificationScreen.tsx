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
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons'
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { CustomInput } from '../../components/CustomeInput';
import { requestApi } from '../../api/endpoints';

const NoteSchema = Yup.object().shape({
  note: Yup.string().trim().min(5, 'Please write at least 5 characters').required('Message is required'),
});

type NoteForm = Yup.InferType<typeof NoteSchema>;

const QUICK_REASONS = [
  'Location details incomplete',
  'Guard count needs confirmation',
  'Shift timing conflict',
  'Special requirement unclear',
];

export const ClarificationScreen: React.FC<ScreenProps<'ClarificationScreen'>> = ({
  route,
  navigation,
}) => {
  const { requestId } = route.params || { requestId: '' };
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm<NoteForm>({
    resolver: yupResolver(NoteSchema),
    defaultValues: { note: '' },
  });

  const handleQuickReason = (reason: string) => {
    const prev = getValues('note');
    setValue('note', prev ? `${prev}\n${reason}` : reason, { shouldValidate: true });
  };

  const handleSendClarification = async ({ note }: NoteForm) => {
    setSubmitting(true);
    try {
      await requestApi.requestClarification(requestId, note);
      setSubmitting(false);
      Alert.alert('Sent to Client', 'Your clarification request has been sent to the client.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      setSubmitting(false);
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    }
  };

  const handleReject = ({ note }: NoteForm) => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await requestApi.rejectRequest(requestId, note);
            setSubmitting(false);
            navigation.navigate('MainTabs');
          } catch (error: any) {
            setSubmitting(false);
            const message = error?.response?.data?.message || 'Could not reject the request. Please try again.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white || '#FFFFFF' } : {})}
      />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Clarification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.info || '#0284C7'} />
          <Text style={styles.infoText}>
            Ask the client for more details, or reject the request.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Quick reasons</Text>
        <View style={styles.chipsRow}>
          {QUICK_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.chip}
              onPress={() => handleQuickReason(reason)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={14} color={COLORS.textPrimary || '#111827'} />
              <Text style={styles.chipText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                    label="Message to client"
                    placeholder="What should the client clarify or why is it rejected?"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={5}
                    error={errors.note?.message}
                    touched={Boolean(errors.note)}
                />
            )}
        />

        <PrimaryButton
          title={submitting ? 'Sending...' : 'Send Clarification Request'}
          onPress={handleSubmit(handleSendClarification)}
          isLoading={submitting}
        />

        <View style={{ height: 12 }} />

        <OutlineButton title="Reject This Request Instead" onPress={handleSubmit(handleReject)} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClarificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white || '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white || '#FFFFFF',
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary || '#111827' },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.infoLight || '#E0F2FE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary || '#111827',
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary || '#111827',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.borderLight || '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary || '#111827',
  },
});