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
  RefreshControl,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';
import { clientSiteApi } from '../../api/endpoints';

interface SiteUI {
  id: string;
  name: string;
  location: string;
  status: string;
}

export const SitesListScreen: React.FC<ScreenProps<'SitesList'>> = ({
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState<SiteUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await clientSiteApi.getSites();
        const siteList = response.data.data.sites || [];

        const formattedSites = siteList.map((site: any) => ({
          id: site._id,
          name: site.name,
          location: site.address,
          status: site.isActive ? 'Active' : 'Inactive',
        }));

        setSites(formattedSites);
      } catch (error) {
        console.log('Sites load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, []);

  const refreshSites = async () => {
    setIsRefreshing(true);

    try {
      const response = await clientSiteApi.getSites();
      const siteList = response.data.data.sites || [];

      const formattedSites = siteList.map((site: any) => ({
        id: site._id,
        name: site.name,
        location: site.address,
        status: site.isActive ? 'Active' : 'Inactive',
      }));

      setSites(formattedSites);
    } catch (error) {
      console.log('Sites refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredSites = sites.filter(
    (site) =>
      !searchQuery.trim() ||
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

        <Text style={styles.headerTitle}>Sites List</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditSite' as any)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search sites..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading sites..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshSites}
            />
          }
        >
          <View style={styles.listContainer}>
            {filteredSites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={styles.siteCard}
                onPress={() =>
                  navigation.navigate('SiteDetails', {
                    siteId: site.id,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.siteLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.siteName}>
                      {site.name}
                    </Text>

                    <Text style={styles.siteLocation}>
                      {site.location}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    site.status === 'Inactive' &&
                      styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      site.status === 'Inactive' &&
                        styles.inactiveStatusText,
                    ]}
                  >
                    {site.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SitesListScreen;

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

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  listContainer: {
    gap: 12,
  },

  siteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },

  siteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  siteName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  siteLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },

  inactiveStatusText: {
    color: '#DC2626',
  },
});