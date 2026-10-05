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
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';

import { operationsApi } from '../../api/endpoints';

interface IncidentUI {
  id: string;
  title: string;
  site: string;
  time: string;
  severity: string;
}

export const IncidentReportsScreen: React.FC<ScreenProps<'IncidentReports'>> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState<IncidentUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadIncidents = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    operationsApi
      .getIncidents()
      .then((res) => {
        const list = res.data.data.incidents || [];
        setIncidents(
          list.map((i: any) => ({
            id: i._id,
            title: i.title,
            site: i.site?.name || 'Unknown Site',
            time: new Date(i.dateTime || i.createdAt).toLocaleString(),
            severity: i.priority,
          }))
        );
      })
      .catch((error) => console.log('Incidents load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIncidents();
    }, [loadIncidents])
  );

  const filteredIncidents = incidents.filter((i) =>
    !searchQuery.trim() || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Reports</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => loadIncidents(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search incidents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading incidents..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadIncidents(true)} />}
      >
        <View style={styles.listContainer}>
          {filteredIncidents.map((item) => (
            <TouchableOpacity key={item.id} style={styles.incidentCard} onPress={() => navigation.navigate('IncidentDetails' as any, { incidentId: item.id })} activeOpacity={0.8}>
              <View style={styles.incidentLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="warning-outline" size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.incidentTitle}>{item.title}</Text>
                  <Text style={styles.siteText}>Site: {item.site}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
              <View style={[
                styles.severityBadge,
                item.severity === 'High' && { backgroundColor: '#FEE2E2' },
                item.severity === 'Critical' && { backgroundColor: '#FEE2E2' },
                item.severity === 'Medium' && { backgroundColor: '#FEF3C7' },
                item.severity === 'Low' && { backgroundColor: '#E0F2FE' },
              ]}>
                <Text style={[
                  styles.severityText,
                  (item.severity === 'High' || item.severity === 'Critical') && { color: '#DC2626' },
                  item.severity === 'Medium' && { color: '#B45309' },
                  item.severity === 'Low' && { color: '#0369A1' },
                ]}>{item.severity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default IncidentReportsScreen;

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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  incidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  incidentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  siteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
  },
});