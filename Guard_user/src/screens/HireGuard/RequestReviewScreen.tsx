import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { requestApi } from '../../api/endpoints';
import { clearHireDraft } from '../../redux/hireGuardSlice';


export const ReviewRequestScreen: React.FC<ScreenProps<'ReviewRequest'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => (state as any).hireGuard?.draft || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      const response = await requestApi.createRequest({
        serviceType: draft.serviceType,
        purpose: draft.purpose,
        shiftType: draft.shiftType,
        bookingType: draft.bookingType,
        date: draft.selectedDateISO || draft.selectedDate,
        startTime: draft.startTime,
        endTime: draft.endTime,
        durationHours: draft.durationHours,
        guardsCount: draft.numberOfGuards,
        genderPreference: draft.genderPreference,
        experienceLevel: draft.experienceLevel,
        specialRequirements: draft.specialRequirements,
        location: {
          address: draft.locationAddress,
          latitude: draft.latitude,
          longitude: draft.longitude,
        },
        contactPerson: draft.contactPerson,
        contactNumber: draft.contactNumber,
        landmark: draft.landmark,
        additionalInstructions: draft.additionalInstructions,
      });

      const createdRequest = response.data.data.request;
      dispatch(clearHireDraft());

      navigation.reset({
        index: 0,
        routes: [{ name: 'RequestSuccess', params: { requestId: createdRequest._id } }],
      });
    } catch (error: any) {
      const data = error?.response?.data;
      const detail = Array.isArray(data?.errors) && data.errors.length ? data.errors.join('\n') : null;
      const message = detail || data?.message || 'Could not submit the request. Please try again.';
      Alert.alert('Submission Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Review Your Request"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GuardCategory')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Service Type</Text>
            <Text style={styles.rowValue}>{draft.serviceType || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Purpose</Text>
            <Text style={styles.rowValue}>{draft.purpose || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Shift</Text>
            <Text style={styles.rowValue}>{draft.timeSlot || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Duration</Text>
            <Text style={styles.rowValue}>{draft.durationHours ? `${draft.durationHours} Hours` : '—'}</Text>
          </View>
        </View>

        {/* Other Details Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Other Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GuardCountRequirements')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Number of Guards</Text>
            <Text style={styles.rowValue}>{draft.numberOfGuards || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Gender</Text>
            <Text style={styles.rowValue}>{draft.genderPreference || 'Any'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Experience</Text>
            <Text style={styles.rowValue}>{draft.experienceLevel || 'Any'}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SelectDutyLocation')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.locationText}>
            {draft.locationAddress || 'Not selected'}
          </Text>
          <Text style={styles.landmarkText}>
            {draft.landmark ? `Near ${draft.landmark}` : ''}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Contact & Instructions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdditionalInstructions')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Contact Person</Text>
            <Text style={styles.rowValue}>{draft.contactPerson || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Contact Number</Text>
            <Text style={styles.rowValue}>{draft.contactNumber || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Instructions</Text>
            <Text style={styles.rowValue}>{draft.additionalInstructions || 'None'}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Submit Request"
          onPress={handleSubmitRequest}
          isLoading={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  landmarkText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#16A34A',
    marginTop: 10,
  },
});