import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';
import { LoadingState } from '../../components/LoadingState';

import { guardApi } from '../../api/endpoints';
import { SERVER_ORIGIN } from '../../api/client';
import { IncidentItem } from '../../redux/incidentSlice';
import { FullScreenImageViewer } from '../../components/FullScreenImageViewer';

interface IncidentDetailsScreenProps {
  navigation: any;
  route: any;
}

export const IncidentDetailsScreen: React.FC<
  IncidentDetailsScreenProps
> = ({ navigation, route }) => {
  const incidentId = route.params?.incidentId;
  const [incident, setIncident] = useState<IncidentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useEffect(() => {
    if (!incidentId) {
      setIsLoading(false);
      return;
    }
    guardApi
      .getIncidentDetails(incidentId)
      .then((res) => {
        const i = res.data.data.incident;
        setIncident({
          id: i._id,
          title: i.title,
          incidentType: i.incidentType,
          priority: i.priority,
          location: i.location || '',
          dateTime: new Date(i.dateTime || i.createdAt).toLocaleString(),
          date: new Date(i.dateTime || i.createdAt).toLocaleDateString(),
          time: new Date(i.dateTime || i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: i.status,
          description: i.description,
          imageUrl: i.images?.[0] ? `${SERVER_ORIGIN}${i.images[0]}` : undefined,
          reportedBy: i.reportedBy?.user?.name || 'You',
        });
      })
      .catch((error) => console.log("Incident details load error: ", error))
      .finally(() => {
        setIsLoading(false);
      })
  }, [incidentId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <LoadingState message='Loading incident details...' />
      </SafeAreaView>
    );
  }
  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20 }}>
          <Text>Incident not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return {
          backgroundColor: COLORS.successLight,
          textColor: COLORS.success,
        };

      case 'Under Review':
        return {
          backgroundColor: COLORS.warningLight,
          textColor: COLORS.warning,
        };

      default:
        return {
          backgroundColor: COLORS.errorLight,
          textColor: COLORS.error,
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return {
          backgroundColor: '#FEE2E2',
          textColor: COLORS.error,
        };

      case 'Medium':
        return {
          backgroundColor: '#FEF3C7',
          textColor: COLORS.warning,
        };

      default:
        return {
          backgroundColor: '#DBEAFE',
          textColor: COLORS.info,
        };
    }
  };

  const statusBadge = getStatusBadge(incident.status);
  const priorityBadge = getPriorityBadge(incident.priority);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Incident Details
        </Text>

        <TouchableOpacity
          style={styles.callSupervisorBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="call"
            size={18}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCard}>
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor:
                    priorityBadge.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: priorityBadge.textColor,
                  },
                ]}
              >
                {incident.priority} Priority
              </Text>
            </View>

            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor:
                    statusBadge.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: statusBadge.textColor,
                  },
                ]}
              >
                {incident.status}
              </Text>
            </View>
          </View>
          <Text style={styles.incidentMainTitle}>
            {incident.incidentType}
          </Text>
          <Text style={styles.incidentTypeSubtitle}>
            Reported on {incident.date}
          </Text>
        </View>

        {incident.imageUrl && (
          <TouchableOpacity style={styles.imageContainer} activeOpacity={0.85} onPress={() => setIsImageViewerVisible(true)}>
            <Image
              source={{ uri: incident.imageUrl }}
              style={styles.evidenceImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        <View style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={COLORS.primary}
            />

            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>
                Location
              </Text>
              <Text style={styles.infoValue}>
                {incident.location}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={COLORS.primary}
            />

            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>
                Reported Date & Time
              </Text>
              <Text style={styles.infoValue}>
                {incident.dateTime ||
                  `${incident.date} • ${incident.time}`}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.primary}
            />

            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>
                Reported By
              </Text>
              <Text style={styles.infoValue}>
                {incident.reportedBy}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descHeading}>
            Description
          </Text>
          <Text style={styles.descBody}>
            {incident.description}
          </Text>
        </View>
      </ScrollView>

      <FullScreenImageViewer
        visible={isImageViewerVisible}
        imageUri={incident.imageUrl}
        onClose={() => setIsImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default IncidentDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  callSupervisorBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  topCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  incidentMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  incidentTypeSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  evidenceImage: {
    width: '100%',
    height: 180,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  descBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});