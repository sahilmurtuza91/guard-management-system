; import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import { IncidentStatus, IncidentItem, setIncidents } from '../../redux/incidentSlice';
import { IncidentCard } from '../../components/IncidentCard';

import { guardApi } from '../../api/endpoints';
import { LoadingState } from '../../components/LoadingState';
import { SERVER_ORIGIN } from '../../api/client';

interface Props {
  navigation: any;
}
const TABS: ('All' | IncidentStatus)[] = [
  'All',
  'Reported',
  'Under Review',
  'Resolved',
  'Rejected',
];

export const mapBackendIncident = (i: any): IncidentItem => ({
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

})

export const IncidentListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState<'All' | IncidentStatus>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const incidents = useSelector((state: RootState) => state.incidents.incidents);

  const filteredList =
    selectedTab === 'All'
      ? incidents
      : incidents.filter(item => item.status === selectedTab);

  const loadIncidents = async () => {
    try {
      const response = await guardApi.getIncidents();
      const mapped = (response.data.data.incidents || []).map(mapBackendIncident);
      dispatch(setIncidents(mapped));
    } catch (error) {
      console.log('Incidents load error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadIncidents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadIncidents();
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.screenTitle}>
            Incidents
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('ReportIncident')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add"
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.reportButtonText}>
              Report Incident
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {TABS.map(tab => {
            const selected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  selected && styles.activeTabButton,
                ]}
                onPress={() => setSelectedTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    selected && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {isLoading ? (
        <LoadingState message='Loading incidents...' />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <IncidentCard
              item={item}
              onPress={() =>
                navigation.navigate('IncidentDetails', {
                  incidentId: item.id,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>
                No Incidents Found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
export default IncidentListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight
      : 0,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2042',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  reportButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#0F2042',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
});