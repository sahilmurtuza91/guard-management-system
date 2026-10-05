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
import { guardManagementApi } from '../../api/endpoints';

interface Guard {
  id: string;
  name: string;
  gender: string;
  experience: string;
  status: 'Available' | 'On Duty' | 'Off Duty';
  location: string;
}

const formatGuard = (guard: any): Guard => {
  const status: Guard['status'] = guard.dutyStatus || 'Available';

  let location = guard.address || '';

  if (status === 'On Duty' && guard.currentShift) {
    location = `${guard.currentShift.siteName || 'Site'} (${guard.currentShift.startTime} - ${guard.currentShift.endTime})`;
  } else if (status === 'Off Duty' && guard.dutyReason) {
    location = guard.dutyReason;
  }

  return {
    id: guard._id,
    name: guard.user?.name || 'Guard',
    gender: guard.gender || '',
    experience: `${guard.experienceYears || 0} Years`,
    status,
    location,
  };
};

export const GuardsListScreen: React.FC<ScreenProps<'GuardsList'>> = ({
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const getGuards = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      }
      try {
        const res = await guardManagementApi.getGuards({
          search: searchQuery || undefined,
        });
        setGuards((res.data.data.guards || []).map(formatGuard));
      } catch (error) {
        console.log('Guards load error: ', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery],
  );
  useFocusEffect(
    useCallback(() => {
      getGuards();
    }, [getGuards]),
  );

  const showGuards = guards.filter(guard => {
    if (selectedTab === 'All') {
      return true;
    }
    return guard.status === selectedTab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android'
          ? { backgroundColor: COLORS.white }
          : {})}
      />

      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Guards</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddGuard' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRowContainer}>
        <View style={styles.tabContainer}>
          {['All', 'Available', 'On Duty', 'Off Duty'].map(tab => {
            const isActive = selectedTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                onPress={() => setSelectedTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                  numberOfLines={1}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search guards by name, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => getGuards()}
          returnKeyType="search"
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading guards..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => getGuards(true)}
            />
          }
        >
          <View style={styles.listContainer}>
            {showGuards.length === 0 && (
              <Text style={styles.emptyText}>
                No guards in this list right now.
              </Text>
            )}
            {showGuards.map(guard => (
              <TouchableOpacity
                key={guard.id}
                style={styles.guardCard}
                onPress={() =>
                  navigation.navigate('GuardProfile', {
                    guardId: guard.id,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.guardLeft}>
                  <View style={styles.avatarBox}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.guardName} numberOfLines={1}>
                      {guard.name}
                    </Text>

                    <Text style={styles.guardSub} numberOfLines={2} ellipsizeMode="tail">
                      {guard.experience}
                      {guard.location ? ` • ${guard.location}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.guardRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      guard.status === 'Available' && {
                        backgroundColor: '#DCFCE7',
                      },
                      guard.status === 'On Duty' && {
                        backgroundColor: '#E0F2FE',
                      },
                      guard.status === 'Off Duty' && {
                        backgroundColor: '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        guard.status === 'Available' && {
                          color: '#15803D',
                        },
                        guard.status === 'On Duty' && {
                          color: '#0369A1',
                        },
                        guard.status === 'Off Duty' && {
                          color: '#B45309',
                        },
                      ]}
                    >
                      {guard.status}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textMuted}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default GuardsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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

  headerTitle: {
    fontSize: 18,
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

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  listContainer: {
    gap: 12,
  },

  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 30,
    fontSize: 13,
  },

  guardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },

  guardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },

  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
  },

  guardName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  guardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },

  guardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});

