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
  Image,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { useDispatch, useSelector } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { TabScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';
import { agencyApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { setAgencyDetails } from '../../redux/agencySlice';

interface RecentRequestUI {
  id: string;
  heading: string;
  title: string;
  status: string;
  time: string;
}

const formatRequestTitle = (
  serviceType?: string,
  date?: string,
) => {
  const dateObject = date ? new Date(date) : null;

  const formattedDate =
    dateObject && !isNaN(dateObject.getTime())
      ? dateObject.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : '';

  return [serviceType || 'Guard Request', formattedDate]
    .filter(Boolean)
    .join(' • ');
};

const ROLE_LABEL: Record<string, string> = {
  agency_admin: 'Agency Admin',
  operations_manager: 'Operations Manager',
  supervisor: 'Supervisor',
};

export const AgencyDashboardScreen: React.FC<TabScreenProps<'DashboardTab'>> = ({ navigation }) => {
  const dispatch = useDispatch();

  const user = useSelector((state: any) => state.agency?.user);
  const agencyName = useSelector(
    (state: any) => state.agency?.agencyName,
  );
  const agencyLogoUrl = useSelector(
    (state: any) => state.agency?.agencyLogoUrl,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalGuards: 0,
    activeGuards: 0,
    pendingRequests: 0,
    activeShifts: 0,
  });

  const [recentRequests, setRecentRequests] = useState<
    RecentRequestUI[]
  >([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await agencyApi.getDashboard();

        const dashboardStats = response.data.data.stats;
        const requests = response.data.data.recentRequests;
        const agency = response.data.data.agency;

        if (agency) {
          dispatch(
            setAgencyDetails({
              agencyName: agency.name || '',
              agencyLogoUrl: agency.logoUrl || '',
            }),
          );
        }

        setStats({
          totalGuards: dashboardStats.totalGuards,
          activeGuards: dashboardStats.activeGuards,
          pendingRequests: dashboardStats.pendingRequests,
          activeShifts: dashboardStats.activeShifts,
        });

        setRecentRequests(
          (requests || []).map((request: any) => ({
            id: request._id,

            heading: formatRequestTitle(
              request.serviceType,
              request.date || request.createdAt,
            ),
            title: `${request.client?.name || 'Client'}${request.location?.address
                ? ` • ${request.location.address}`
                : ''
              }`,
            status: request.status,
            time: new Date(
              request.createdAt,
            ).toLocaleString(),
          })),
        );
      } catch (error) {
        console.log('Dashboard load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning,';
    }
    if (hour < 17) {
      return 'Good Afternoon,';
    }
    return 'Good Evening,';
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeHeaderArea}>
        <View style={styles.headerBar}>
          <View style={styles.userInfoRow}>
            <View style={styles.avatarBox}>
              {agencyLogoUrl ? (
                <Image
                  source={{
                    uri: resolveAssetUrl(agencyLogoUrl),
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                  }}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={22}
                  color="#FFFFFF"
                />
              )}
            </View>

            <View>
              <Text style={styles.greetingText}>
                {getGreeting()}
              </Text>

              <Text style={styles.userName}>
                {user?.name || 'Agency User'}
              </Text>

              {agencyName ? (
                <Text
                  style={[
                    styles.greetingText,
                    { marginTop: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {agencyName}
                </Text>
              ) : null}

              <View style={styles.roleTag}>
                <Text style={styles.roleText}>
                  {ROLE_LABEL[user?.role] ||
                    user?.role ||
                    'Agency Staff'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() =>
              navigation.navigate('Notifications')
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#FFFFFF"
            />

            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <LoadingState
            message="Loading dashboard..."
            fullScreen={false}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Dashboard Overview
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.gridItem}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: '#EFF6FF' },
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={20}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.cardTextContent}>
                  <Text style={styles.summaryValue}>
                    {stats.totalGuards}
                  </Text>

                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Total Guards
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: '#FEF3C7' },
                  ]}
                >
                  <Ionicons
                    name="document-text"
                    size={20}
                    color="#D97706"
                  />
                </View>

                <View style={styles.cardTextContent}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: '#D97706' },
                    ]}
                  >
                    {stats.pendingRequests}
                  </Text>

                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Pending Req.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: '#DCFCE7' },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#16A34A"
                  />
                </View>

                <View style={styles.cardTextContent}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: '#16A34A' },
                    ]}
                  >
                    {stats.activeGuards}
                  </Text>

                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Active Guards
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: '#F3E8FF' },
                  ]}
                >
                  <Ionicons
                    name="time"
                    size={20}
                    color="#8B5CF6"
                  />
                </View>

                <View style={styles.cardTextContent}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: '#8B5CF6' },
                    ]}
                  >
                    {stats.activeShifts}
                  </Text>

                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Active Shifts
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.clientQuickCard}
            onPress={() =>
              navigation.navigate('ClientsList')
            }
            activeOpacity={0.85}
          >
            <View style={styles.clientQuickLeft}>
              <View style={styles.clientIconBox}>
                <Ionicons
                  name="business"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.clientQuickTitle}>
                  Manage Clients & Sites
                </Text>

                <Text style={styles.clientQuickSub}>
                  View client details and site geofences
                </Text>
              </View>
            </View>

            <View style={styles.arrowCircle}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#2563EB"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Recent Requests
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'MainTabs' as any,
                  { screen: 'RequestsTab' } as any,
                )
              }
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requestsList}>
            {recentRequests.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.requestCard}
                onPress={() =>
                  navigation.navigate(
                    'RequestDetails',
                    { requestId: item.id },
                  )
                }
                activeOpacity={0.8}
              >
                <View style={styles.requestLeft}>
                  <View style={styles.reqIconBox}>
                    <Ionicons
                      name="shield-outline"
                      size={20}
                      color="#2563EB"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqId}>
                      {item.heading}
                    </Text>

                    <Text
                      style={styles.reqTitle}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    <Text style={styles.reqTime}>
                      {item.time}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Under Review' &&
                    styles.reviewBadge,
                    item.status === 'Accepted' &&
                    styles.acceptedBadge,
                    item.status === 'Guard Assigned' &&
                    styles.assignedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Under Review' &&
                      styles.reviewText,
                      item.status === 'Accepted' &&
                      styles.acceptedText,
                      item.status === 'Guard Assigned' &&
                      styles.assignedText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AgencyDashboardScreen;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#0F2042',
  },

  safeHeaderArea: {
    backgroundColor: '#0F2042',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greetingText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },

  roleTag: {
    marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  roleText: {
    fontSize: 10,
    color: '#60A5FA',
    fontWeight: '700',
  },

  notifBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  redDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  loadingWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  scrollContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    minHeight: '100%',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary || '#0F172A',
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 18,
  },

  gridItem: {
    width: '48%',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTextContent: {
    flex: 1,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },

  clientQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  clientQuickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },

  clientIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clientQuickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  clientQuickSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  requestsList: {
    gap: 12,
  },

  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },

  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },

  reqIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reqId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },

  reqTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },

  reqTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  reviewBadge: {
    backgroundColor: '#FEF3C7',
  },

  reviewText: {
    color: '#B45309',
  },

  acceptedBadge: {
    backgroundColor: '#DCFCE7',
  },

  acceptedText: {
    color: '#15803D',
  },

  assignedBadge: {
    backgroundColor: '#E0F2FE',
  },

  assignedText: {
    color: '#0369A1',
  },
});