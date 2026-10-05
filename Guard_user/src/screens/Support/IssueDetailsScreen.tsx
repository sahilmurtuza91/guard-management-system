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
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { requestApi, userApi } from '../../api/endpoints';

const IssueSchema = Yup.object().shape({
  description: Yup.string()
    .trim()
    .min(10, 'Please describe the issue in at least 10 characters')
    .max(300, 'Description can be up to 300 characters')
    .required('Please describe your issue before submitting'),
});

type IssueForm = Yup.InferType<typeof IssueSchema>;

export const IssueDetailsScreen: React.FC<ScreenProps<'IssueDetails'>> = ({
  navigation,
  route,
}) => {
  const issueType = route.params?.issueType || 'behavior';
  const requestIdParam = (route.params as any)?.requestId;
  const { control, handleSubmit, watch, formState: { errors } } = useForm<IssueForm>({
    resolver: yupResolver(IssueSchema),
    defaultValues: { description: '' },
  });
  const description = watch('description');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (response) => {
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setPhotoUri(response.assets[0].uri);
      }
    });
  };

  const handleSubmitIssue = async ({ description }: IssueForm) => {
    setIsSubmitting(true);
    try {
      let requestId = requestIdParam;
      if (!requestId) {
        const requestsRes = await requestApi.getMyRequests();
        const requests = requestsRes.data.data.requests || [];
        if (!requests.length) {
          Alert.alert('No Request Found', 'You need at least one request to raise an issue.');
          setIsSubmitting(false);
          return;
        }
        requestId = requests[0]._id;
      }

      if (photoUri) {
        const body = new FormData();
        body.append('requestId', requestId);
        body.append('issueType', issueType);
        body.append('description', description);
        body.append('image', {
          uri: photoUri,
          name: `issue_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        await userApi.raiseIssue(body);
      } else {
        await userApi.raiseIssue({ requestId, issueType, description });
      }
      Alert.alert('Success', 'Your issue has been reported successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not submit the issue. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Issue Details" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Selected Issue Type</Text>
          <Text style={styles.infoValue}>
            {issueType.charAt(0).toUpperCase() + issueType.slice(1)} Guard Issue
          </Text>
        </View>

        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              placeholder="Please describe the issue in detail..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={6}
              maxLength={300}
              error={errors.description?.message}
              touched={Boolean(errors.description)}
            />
          )}
        />
        <Text style={styles.charCount}>{description.length}/300</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Add Photo (Optional)</Text>
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={handlePickPhoto}
          activeOpacity={0.8}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
              <Text style={styles.uploadText}>Tap to attach a screenshot or photo</Text>
            </>
          )}
        </TouchableOpacity>
        {photoUri && (
          <TouchableOpacity onPress={() => setPhotoUri(null)}>
            <Text style={styles.removePhotoText}>Remove photo</Text>
          </TouchableOpacity>
        )}

        <PrimaryButton
          title="Submit Issue"
          onPress={handleSubmit(handleSubmitIssue)}
          isLoading={isSubmitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default IssueDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '900', color: COLORS.primary, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
  uploadBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 12 },
  removePhotoText: { fontSize: 11, color: COLORS.error, fontWeight: '700', marginTop: 6, textAlign: 'right' },
  submitBtn: { marginTop: 30, backgroundColor: '#16A34A' },
});