import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/them';
import { ScreenHeader } from '../../components/ScreenHeader';
import { RequestCard } from '../../components/RequestCard';
import { LoadingState } from '../../components/LoadingState';
import { requestApi } from '../../api/endpoints';
import { formatRequestTitle } from '../../utils/requestLabel';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Draft': {
    bg: '#F1F5F9',
    color: '#64748B'
  },
  'Submitted': {
    bg: '#FEF3C7',
    color: '#D97706'
  },
  'Under Review': {
    bg: '#FEF3C7',
    color: '#D97706'
  },
  'Clarification Required': {
    bg: '#FEF3C7',
    color: '#D97706'
  },
  'Accepted': {
    bg: '#EFF6FF',
    color: '#2563EB'
  },
  'Guard Assigned': {
    bg: '#EFF6FF',
    color: '#2563EB'
  },
  'Confirmed': {
    bg: '#EFF6FF',
    color: '#2563EB'
  },
  'Active': {
    bg: '#EFF6FF',
    color: '#2563EB'
  },
  'Completed': {
    bg: '#DCFCE7',
    color: '#16A34A'
  },
  'Rejected': {
    bg: '#FEE2E2',
    color: '#DC2626'
  },
  'Cancelled by User': {
    bg: '#FEE2E2',
    color: '#DC2626'
  },
  'Cancelled by Agency': {
    bg: '#FEE2E2',
    color: '#DC2626'
  },
  'Expired': {
    bg: '#FEE2E2',
    color: '#DC2626'
  },
  'Replacement Requested': {
    bg: '#F5F3FF',
    color: '#7C3AED'
  },
};

const ACTIVE_STATUSES = [
  'Submitted',
  'Under Review',
  'Clarification Required',
  'Accepted',
  'Guard Assigned',
  'Confirmed',
  'Active',
  'Replacement Requested'
];
const CANCELLED_STATUSES = ['Cancelled by User', 'Cancelled by Agency', 'Rejected', 'Expired'];

const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const;
type TabType = (typeof TABS)[number];

interface RequestUI {
  id: string;
  title: string;
  status: string;
  date: string;
  guards: string;
  statusBg: string;
  statusColor: string;
}

const toRequestUI = (r: any): RequestUI => {
  const style = STATUS_STYLE[r.status] || { bg: '#F1F5F9', color: '#64748B' };
  const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '';
  return {
    id: r._id,
    title: formatRequestTitle(r.serviceType, r.date),
    status: r.status,
    date: `${dateStr}${r.startTime ? ` • ${r.startTime}` : ''}`,
    guards: `${r.guardsCount || 1} Guard${(r.guardsCount || 1) > 1 ? 's' : ''}${r.durationHours ? ` • ${r.durationHours} Hours` : ''}`,
    statusBg: style.bg,
    statusColor: style.color,
  };
};

export const MyRequestsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [requests, setRequests] = useState<RequestUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    requestApi
      .getMyRequests()
      .then((res) => setRequests((res.data.data.requests || []).map(toRequestUI)))
      .catch((error) => console.log('Requests load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ACTIVE_STATUSES.includes(req.status);
    if (activeTab === 'Completed') return req.status === 'Completed';
    if (activeTab === 'Cancelled') return CANCELLED_STATUSES.includes(req.status);
    return true;
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="My Requests" onBackPress={handleBackPress} />

      <View style={styles.headerTabWrapper}>
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.activeTabBtn,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingState message="Loading requests..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadRequests(true)} />}
        >
          <View style={styles.list}>
            {filteredRequests.map(item => (
              <RequestCard
                key={item.id}
                title={item.title}
                date={item.date}
                guards={item.guards}
                status={item.status}
                statusBg={item.statusBg}
                statusColor={item.statusColor}
                onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTabWrapper: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20
  },
  list: {
    gap: 12
  },
});