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
  TouchableOpacity,
  Alert,
  Platform
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

const STATUS_OPTIONS = ['Under Review', 'Resolved', 'Rejected'] as const;

interface IncidentDetail {
  title: string;
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  site: string;
  guardName: string;
  time: string;
  description: string;
}

const CommentSchema = Yup.object({
  comment: Yup.string()
    .trim()
    .max(300, 'Comment can be up to 300 characters'),
});

type CommentForm = Yup.InferType<typeof CommentSchema>;

export const AgencyIncidentDetailsScreen: React.FC<ScreenProps<'IncidentDetails'>> = ({
  navigation,
  route,
}) => {
  const { incidentId } = route.params;

  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('Under Review');
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CommentForm>({
    resolver: yupResolver(CommentSchema),
    defaultValues: { comment: '' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadIncident = useCallback(async () => {
    try {
      const response = await operationsApi.getIncidentDetails(incidentId);
      const data = response.data.data.incident;

      setIncident({
        title: data.title,
        type: data.incidentType,
        priority: data.priority,
        site:
          data.site?.address ||
          data.site?.name ||
          data.location ||
          '',
        guardName: data.reportedBy?.user?.name || 'Guard',
        time: new Date(
          data.dateTime || data.createdAt,
        ).toLocaleString(),
        description: data.description,
      });
      if (STATUS_OPTIONS.includes(data.status)) {
        setStatus(data.status);
      }
    } catch (error) {
      console.log('Incident load error: ', error);
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  useFocusEffect(
    useCallback(() => {
      loadIncident();
    }, [loadIncident])
  );

  const saveIncident = async ({ comment }: CommentForm) => {
    setIsSaving(true);
    try {
      await operationsApi.updateIncident(incidentId, { status, comment: (comment || '').trim() || undefined });
      Alert.alert('Updated', 'Incident status updated successfully and guard notified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to update incident. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const escalateIncident = async () => {
    try {
      await operationsApi.updateIncident(incidentId, {
        comment: "Escalated to senior management."
      });
      Alert.alert(
        'Escalated',
        'Incident has been escalated to senior management.',
      );
    } catch (error) {
      console.log('Escalate error: ', error);
    }
  };

  const showPriorityBadge = (priority: string) => {
    let backgroundColor = '#E0F2FE';
    let textColor = '#0369A1';

    if (priority === 'High' || priority === 'Critical') {
      backgroundColor = '#FEE2E2';
      textColor = '#DC2626';
    } else if (priority === 'Medium') {
      backgroundColor = '#FEF3C7';
      textColor = '#D97706';
    }

    return (
      <View style={[styles.inlineBadge, { backgroundColor },]}>
        <Text style={[styles.inlineBadgeText, { color: textColor },]}>
          {priority}
        </Text>
      </View>
    );
  };

  const showStatusBadge = (status: string) => {
    let backgroundColor = '#E0E7FF';
    let textColor = '#4338CA';

    if (status === 'Resolved') {
      backgroundColor = '#DCFCE7';
      textColor = '#15803D';
    } else if (status === 'Rejected') {
      backgroundColor = '#FEE2E2';
      textColor = '#B91C1C';
    }

    return (
      <View style={[styles.inlineBadge, { backgroundColor },]}>
        <Text style={[styles.inlineBadgeText, { color: textColor },]}>
          {status}
        </Text>
      </View>
    );
  };

  if (isLoading || !incident) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.inlineHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incident Details</Text>
        </View>
        <LoadingState message="Loading incident details..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          {showPriorityBadge(incident.priority)}
          {showStatusBadge(status)}
        </View>

        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.subtitle}>{incident.type}</Text>

        <View style={[styles.inlineCard, styles.infoCard]}>
          <InfoRow icon="location-outline" label="Site" value={incident.site} />
          <View style={styles.divider} />
          <InfoRow icon="person-outline" label="Reported By" value={incident.guardName} />
          <View style={styles.divider} />
          <InfoRow icon="time-outline" label="Reported At" value={incident.time} />
        </View>

        <Text style={styles.sectionLabel}>Description</Text>

        <View style={styles.inlineCard}>
          <Text style={styles.descriptionText}>{incident.description}</Text>
        </View>

        <Text style={styles.sectionLabel}>Update Status</Text>
        <View style={styles.statusChipsRow}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.statusChip, status === option && styles.statusChipActive]}
              onPress={() => setStatus(option)}
              activeOpacity={0.75}
            >
              <Text style={[styles.statusChipText, status === option && styles.statusChipTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Controller
          control={control}
          name="comment"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Add a comment (optional)"
              placeholder="Review notes, action taken, escalation details..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              error={errors.comment?.message}
              touched={Boolean(errors.comment)}
            />
          )}
        />

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <OutlineButton title="Escalate" variant="danger" onPress={escalateIncident} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Save Update" onPress={handleSubmit(saveIncident)} isLoading={isSaving} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={18} color={COLORS.primary || '#2563EB'} />
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default AgencyIncidentDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white,
  },
  backButton: {
    marginRight: 12,
    padding: 4
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },

  inlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  inlineBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },

  inlineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 16
  },
  infoCard: {
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4
  },
  infoText: {
    flex: 1
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 8
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  statusChipTextActive: {
    color: COLORS.white
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
});