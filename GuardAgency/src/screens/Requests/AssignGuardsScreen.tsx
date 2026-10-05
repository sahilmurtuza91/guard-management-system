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
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';

import { requestApi } from '../../api/endpoints';

interface GuardUI {
  id: string;
  name: string;
  detail: string;
  status: 'Available' | 'On Duty';
  conflictText?: string;
}

export const AssignGuardsScreen: React.FC<ScreenProps<'AssignGuards'>> = ({ route, navigation }) => {
  const { requestId } = route.params || { requestId: '' };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Available');
  const [selectedGuards, setSelectedGuards] = useState<string[]>([]);
  const [guards, setGuards] = useState<GuardUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestApi
      .getEligibleGuards(requestId)
      .then((res) => {
        const list = res.data.data.guards || [];
        setGuards(
          list.map((g: any) => ({
            id: g._id,
            name: g.user?.name || 'Guard',
            detail: `${g.experienceYears || 0} yrs experience • ${g.gender || ''}`,
            status: g.hasConflict ? 'On Duty' : 'Available',
            conflictText: g.hasConflict && g.conflictShift
              ? `Busy: ${g.conflictShift.siteName || 'another site'} • ${g.conflictShift.startTime} - ${g.conflictShift.endTime}`
              : undefined,
          }))
        );
      })
      .catch((error) => console.log('Eligible guards load error: ', error))
      .finally(() => setIsLoading(false));
  }, [requestId]);

  const toggleGuardSelection = (id: string) => {
    const target = guards.find((g) => g.id === id);
    if (target && target.status === 'On Duty') {
      Alert.alert('Guard Busy', target.conflictText || 'This guard already has a shift in this time slot.');
      return;
    }
    if (selectedGuards.includes(id)) {
      setSelectedGuards(selectedGuards.filter((item) => item !== id));
    } else {
      setSelectedGuards([...selectedGuards, id]);
    }
  };

  const filteredGuards = guards.filter((g) => {
    const matchesSearch = !searchQuery.trim() || g.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedFilter === 'All') return true;
    return g.status === selectedFilter;
  });

  const availableCount = guards.filter((g) => g.status === 'Available').length;
  const onDutyCount = guards.filter((g) => g.status === 'On Duty').length;

  const handleProceedReview = () => {
    if (selectedGuards.length === 0) {
      Alert.alert('Error', 'Please select at least one guard to assign.');
      return;
    }
    navigation.navigate('AssignmentReview', {
      requestId,
      selectedGuards,
      selectedGuardDetails: guards.filter((g) => selectedGuards.includes(g.id)).map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
    });
  };

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
        <Text style={styles.headerTitle}>Assign Guards</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.subHeaderContainer}>
        <Text style={styles.subHeaderTitle}>Select available guards for this request</Text>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search guards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      <View style={styles.filterRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[`Available (${availableCount})`, `On Duty (${onDutyCount})`, `All (${guards.length})`].map((tab) => {
            const cleanTab = tab.replace(/\s*\(\d+\)$/, '');
            return (
              <TouchableOpacity 
                key={tab}
                style={[styles.filterChip, selectedFilter === cleanTab && styles.activeChip]}
                onPress={() => setSelectedFilter(cleanTab)}
              >
                <Text style={[styles.filterText, selectedFilter === cleanTab && styles.activeFilterText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState message="Loading eligible guards..." />
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredGuards.length === 0 && (
            <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 30, fontSize: 13 }}>
              No guards in this list for the requested date & time.
            </Text>
          )}
          {filteredGuards.map((guard) => {
            const isSelected = selectedGuards.includes(guard.id);
            return (
              <TouchableOpacity
                key={guard.id}
                style={[styles.guardCard, isSelected && styles.selectedGuardCard, guard.status === 'On Duty' && { opacity: 0.6 }]}
                onPress={() => toggleGuardSelection(guard.id)}
                activeOpacity={0.8}
              >
                <View style={styles.guardInfoRow}>
                  <View style={styles.avatarBox}>
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guardName}>{guard.name}</Text>
                    <Text style={styles.guardType}>{guard.detail}</Text>
                    {guard.conflictText ? (
                      <Text style={[styles.guardType, { color: '#B45309', marginTop: 2 }]}>{guard.conflictText}</Text>
                    ) : null}
                  </View>
                  <View style={styles.rightActionCol}>
                    <View style={[
                      styles.statusBadge,
                      guard.status === 'Available' && { backgroundColor: '#DCFCE7' },
                      guard.status === 'On Duty' && { backgroundColor: '#E0F2FE' },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        guard.status === 'Available' && { color: '#15803D' },
                        guard.status === 'On Duty' && { color: '#0369A1' },
                      ]}>{guard.status}</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                      {isSelected && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      )}

      <View style={styles.footerBar}>
        <PrimaryButton 
          title={`Next (${selectedGuards.length} Selected)`} 
          onPress={handleProceedReview} 
        />
      </View>
    </SafeAreaView>
  );
};

export default AssignGuardsScreen;

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
  subHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  subHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  filterRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  guardCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  selectedGuardCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
  },
  guardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  guardName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  guardRating: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  guardType: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footerBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
});