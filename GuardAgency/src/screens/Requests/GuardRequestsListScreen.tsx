import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { TabScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';

import { requestApi } from '../../api/endpoints';

interface RequestUI {
  title: string;
  clientName: string;
  id: string;
  serviceType: string;
  guardsCountText: string;
  address: string;
  status: string;
  time: string;
}

const formatRequestTitle = (serviceType?: string, date?: string) => {
  const d = date ? new Date(date) : null;
  const dateText = d && !isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return [serviceType || 'Guard Request', dateText].filter(Boolean).join(' • ');
};

const PENDING_STATUSES = ['Submitted', 'Under Review', 'Clarification Required', 'Replacement Requested'];
const ACCEPTED_STATUSES = ['Accepted', 'Guard Assigned', 'Confirmed', 'Active', 'Completed'];
const REJECTED_STATUSES = ['Rejected', 'Cancelled by User', 'Cancelled by Agency', 'Expired'];

const matchesTab = (tab: string, status: string) => {
  if (tab === 'All') return true;
  if (tab === 'Pending') return PENDING_STATUSES.includes(status);
  if (tab === 'Accepted') return ACCEPTED_STATUSES.includes(status);
  return REJECTED_STATUSES.includes(status);
};

export const GuardRequestsListScreen: React.FC<TabScreenProps<'RequestsTab'>> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [requests, setRequests] = useState<RequestUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    requestApi
      .getRequests()
      .then((res) => {
        const list = res.data.data.request || [];
        setRequests(
          list.map((r: any) => {
            const count = r.guardsCount || 1;
            return {
              id: r._id,
              serviceType: r.serviceType || 'Guard Request',
              title: formatRequestTitle(r.serviceType, r.date || r.createdAt),
              clientName: r.client?.name || 'Client',
              guardsCountText: `(${count} ${count === 1 ? 'Guard' : 'Guards'})`,
              address: r.location?.address || 'No address provided',
              status: r.status,
              time: new Date(r.date || r.createdAt).toLocaleString(),
            };
          })
        );
      })
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

  const filteredRequests = requests.filter((r) => {
    if (!matchesTab(selectedTab, r.status)) return false;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      r.serviceType.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Guard Requests</Text>
      </View>

      <View style={styles.filterRowContainer}>
        <View style={styles.tabContainer}>
          {['All', 'Pending', 'Accepted', 'Rejected'].map((tab) => {
            const isTabActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isTabActive && styles.activeTabBtn]}
                onPress={() => setSelectedTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isTabActive && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search requests..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading requests..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadRequests(true)} />}
        >
          <View style={styles.listContainer}>
            {filteredRequests.map((item) => {
              const isRejected = REJECTED_STATUSES.includes(item.status);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.reqIconBox, isRejected && styles.reqIconBoxRejected]}>
                        <Ionicons
                          name={isRejected ? 'close-circle' : 'document-text-outline'}
                          size={18}
                          color={isRejected ? '#DC2626' : COLORS.primary}
                        />
                      </View>
                      <View style={styles.titleInfoBox}>
                        <Text style={styles.reqId}>{item.clientName}</Text>
                        
                        <Text style={styles.reqTitle}>
                          <Text style={styles.serviceTypeText}>{item.serviceType} </Text>
                          <Text style={styles.guardBracketText}>{item.guardsCountText}</Text>
                        </Text>

                        <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
                          {item.address}
                        </Text>
                      </View>
                    </View>

                    <View style={[
                      styles.statusBadge,
                      item.status === 'Under Review' && { backgroundColor: '#FEF3C7' },
                      item.status === 'Accepted' && { backgroundColor: '#DCFCE7' },
                      item.status === 'Guard Assigned' && { backgroundColor: '#E0F2FE' },
                      item.status === 'Completed' && { backgroundColor: '#F1F5F9' },
                      isRejected && styles.statusBadgeRejected,
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'Under Review' && { color: '#B45309' },
                        item.status === 'Accepted' && { color: '#15803D' },
                        item.status === 'Guard Assigned' && { color: '#0369A1' },
                        item.status === 'Completed' && { color: COLORS.textSecondary },
                        isRejected && styles.statusTextRejected,
                      ]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default GuardRequestsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  filterRowContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  reqIconBoxRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  reqIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfoBox: {
    flex: 1,
  },
  reqId: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  reqTitle: {
    marginTop: 2,
  },
  serviceTypeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary, // Dark color
  },
  guardBracketText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary, // Slightly muted for brackets
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textMuted, // Light/muted color for address
    marginTop: 4,
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});