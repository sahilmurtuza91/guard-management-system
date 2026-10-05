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
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { clientSiteApi } from '../../api/endpoints';

interface SiteDetail {
  name: string;
  address: string;
  geofenceRadiusMeters: number;
  latitude: number;
  longitude: number;
}

export const SiteDetailsScreen: React.FC<ScreenProps<'SiteDetails'>> = ({
  route,
  navigation,
}) => {
  const { siteId } = route.params;

  const [siteDetails, setSiteDetails] = useState<SiteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSiteDetails = async () => {
      try {
        const response = await clientSiteApi.getSiteDetails(siteId);
        const site = response.data.data.site;

        setSiteDetails({
          name: site.name,
          address: site.address,
          geofenceRadiusMeters: site.geofenceRadiusMeters,
          latitude: site.latitude,
          longitude: site.longitude,
        });
      } catch (error) {
        console.log('Site details load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteDetails();
  }, [siteId]);

  if (isLoading || !siteDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android'
            ? { backgroundColor: COLORS.white }
            : {})}
        />

        <LoadingState message="Loading site..." />
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

        <Text style={styles.headerTitle}>Site Details</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SiteMapGeofence' as any, { siteId })
          }
        >
          <Text style={styles.mapButtonText}>Map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons
              name="location"
              size={28}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.siteName}>{siteDetails.name}</Text>

          <Text style={styles.siteAddress}>
            {siteDetails.address}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Geofence Radius</Text>

            <Text style={styles.infoValue}>
              {siteDetails.geofenceRadiusMeters} m radius
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordinates</Text>

            <Text style={styles.infoValue}>
              {siteDetails.latitude}, {siteDetails.longitude}
            </Text>
          </View>
        </View>

        <View style={styles.footerAction}>
          <PrimaryButton
            title="Edit Site Information"
            onPress={() =>
              navigation.navigate('AddEditSite' as any, { siteId })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SiteDetailsScreen;

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

  mapButtonText: {
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  siteName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  siteAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
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

  footerAction: {
    marginTop: 28,
  },
});