import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';
import { useRequestLabel } from '../../hooks/useRequestLabel';

interface TimelineStep {
  title: string;
  subtitle: string;
  date: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const RequestStatusTimelineScreen: React.FC<
  ScreenProps<'RequestStatusTimeline'>
> = ({ navigation, route }) => {
  const requestId = route.params?.requestId;
  const requestLabel = useRequestLabel(requestId);
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTimeline = useCallback(() => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const request = res.data.data.request;
        const timeline = request?.timeline || [];
        setSteps(
          timeline.map((entry: any, index: number) => ({
            title: entry.status,
            subtitle: entry.note || '',
            date: entry.changedAt ? new Date(entry.changedAt).toLocaleString('en-IN') : '',
            isCompleted: index < timeline.length - 1,
            isCurrent: index === timeline.length - 1,
          }))
        );
      })
      .catch((error) => console.log('Timeline load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [loadTimeline])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title={`Timeline: ${requestLabel}`}
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <LoadingState message="Loading timeline..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.timelineContainer}>
            {steps.length === 0 && (
              <Text style={styles.emptyText}>No status history available yet.</Text>
            )}
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.iconCircle,
                        step.isCompleted && styles.completedCircle,
                        step.isCurrent && styles.currentCircle,
                      ]}
                    >
                      <Ionicons
                        name={
                          step.isCompleted
                            ? 'checkmark'
                            : step.isCurrent
                              ? 'time'
                              : 'ellipse-outline'
                        }
                        size={14}
                        color={
                          step.isCompleted || step.isCurrent
                            ? COLORS.white
                            : COLORS.textMuted
                        }
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalLine,
                          step.isCompleted && styles.completedLine,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.contentCol}>
                    <Text
                      style={[
                        styles.stepTitle,
                        step.isCurrent && styles.currentTitleText,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {!!step.subtitle && <Text style={styles.stepSubtitle}>{step.subtitle}</Text>}
                    <Text style={styles.stepDate}>{step.date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RequestStatusTimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center', padding: 12 },
  timelineContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRow: { flexDirection: 'row', minHeight: 70 },
  indicatorCol: { alignItems: 'center', marginRight: 16, width: 24 },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completedCircle: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  currentCircle: { backgroundColor: '#D97706', borderColor: '#D97706' },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  completedLine: { backgroundColor: '#16A34A' },
  contentCol: { flex: 1, paddingBottom: 20 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  currentTitleText: { color: '#D97706' },
  stepSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  stepDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
});
