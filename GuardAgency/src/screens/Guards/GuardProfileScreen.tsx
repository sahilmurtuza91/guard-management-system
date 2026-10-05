import React, { useEffect, useState } from 'react';
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
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { guardManagementApi } from '../../api/endpoints';

interface GuardDetail {
  name: string;
  phone: string;
  email: string;
  gender: string;
  experience: string;
  status: string;
  isVerified: boolean;
  employeeId: string;
}

export const GuardProfileScreen: React.FC<ScreenProps<'GuardProfile'>> = ({ route, navigation }) => {
  const { guardId } = route.params;

  const [detail, setDetail] = useState<GuardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await guardManagementApi.getGuardProfile(guardId);
        const guard = response.data.data.guard;
        setDetail({
          name: guard.user?.name || 'Guard',
          phone: guard.user?.phone || '',
          email: guard.user?.email || '',
          gender: guard.gender || '',
          experience: `${guard.experienceYears || 0} Years`,
          status: guard.status || 'Active',
          isVerified: !!guard.isVerified,
          employeeId: guard.employeeId || '—',
        });
      } catch (error) {
        console.log('Guard profile load error: ', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [guardId]);

  const handleReportIncident = () => {
    Alert.alert('Report Incident', `Report an incident for ${detail?.name ?? 'this guard'}?`,
      [{ text: 'Cancel', style: 'cancel', },
      {
        text: 'Proceed',
        onPress: () => navigation.navigate('IncidentReports'),
      },
      ]
    );
  };

  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android'
            ? { backgroundColor: COLORS.white }
            : {})}
        />

        <LoadingState message="Loading guard profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Guard Profile
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('EditGuard', { guardId })
          }
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons
              name="person"
              size={32}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.guardName}>
            {detail.name}
          </Text>

          {detail.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#16A34A"
              />

              <Text style={styles.verifiedText}>
                Verified
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>
            Overview Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Employee ID
            </Text>

            <Text style={styles.infoValue}>
              {detail.employeeId}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Phone Number
            </Text>

            <Text style={styles.infoValue}>
              {detail.phone}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text style={styles.infoValue}>
              {detail.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Gender
            </Text>

            <Text style={styles.infoValue}>
              {detail.gender}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Experience
            </Text>

            <Text style={styles.infoValue}>
              {detail.experience}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Status
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: '#16A34A',
                  fontWeight: '900',
                },
              ]}
            >
              {detail.status}
            </Text>
          </View>
        </View>

        <View style={styles.quickNavSection}>
          <Text style={styles.quickNavTitle}>
            Guard Management & Records
          </Text>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() =>
              navigation.navigate(
                'AvailabilityCalendar',
                { guardId }
              )
            }
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.navCardText}>
              View Availability Calendar
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() =>
              navigation.navigate('GuardDocuments', {
                guardId,
              })
            }
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.navCardText}>
              View Guard Documents
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() =>
              navigation.navigate('GuardAttendance', {
                guardId,
              })
            }
          >
            <Ionicons
              name="finger-print-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.navCardText}>
              View Attendance Logs
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() =>
              navigation.navigate('ShiftHistory', {
                guardId,
              })
            }
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.navCardText}>
              View Shift History
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navCard,
              styles.incidentCard,
            ]}
            onPress={handleReportIncident}
          >
            <Ionicons
              name="warning-outline"
              size={20}
              color="#DC2626"
            />
            <Text
              style={[
                styles.navCardText,
                { color: '#DC2626' },
              ]}
            >
              Report / View Incident
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#DC2626"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footerAction}>
          <PrimaryButton
            title="Message Guard"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Messaging with guards is not available yet. Please check back soon.'
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuardProfileScreen;

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

  editText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  guardName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },

  sectionContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },

  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },

  infoValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },

  quickNavSection: {
    marginBottom: 20,
  },

  quickNavTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },

  incidentCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  navCardText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  footerAction: {
    marginTop: 10,
  },
});

