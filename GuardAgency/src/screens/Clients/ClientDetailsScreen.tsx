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
import { LoadingState } from '../../components/LoadingState';
import { clientSiteApi } from '../../api/endpoints';

interface ClientDetail {
  name: string;
  email: string;
  phone: string;
  sites: {
    id: string;
    title: string;
    address: string;
    isActive: boolean;
  }[];
}

export const ClientDetailsScreen: React.FC<ScreenProps<'ClientDetails'>> = ({ route, navigation }) => {
  const { clientId } = route.params;

  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadClientDetails = async () => {
    try {
      const response = await clientSiteApi.getClientDetails(clientId);

      const client = response.data.data.client;
      const sites = response.data.data.sites;

      setDetail({
        name: client.user?.name || 'Client',
        email: client.user?.email || '',
        phone: client.user?.phone || '',
        sites: (sites || []).map((site: any) => ({
          id: site._id,
          title: site.name,
          address: site.address,
          isActive: site.isActive,
        })),
      });
    } catch (error) {
      console.log('Client details load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientDetails();
  }, [clientId]);

  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android'
            ? { backgroundColor: COLORS.white }
            : {})}
        />

        <LoadingState message="Loading client..." />
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

        <Text style={styles.headerTitle}>Client Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons
              name="business"
              size={28}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.clientName}>{detail.name}</Text>
          <Text style={styles.contactPerson}>{detail.phone}</Text>
          <Text style={styles.emailText}>{detail.email}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Registered Sites ({detail.sites.length})
          </Text>
        </View>

        {detail.sites.map(site => (
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
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.primary}
              />

              <View>
                <Text style={styles.siteTitle}>
                  {site.title}
                </Text>

                <Text style={styles.siteSub}>
                  {site.address}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                !site.isActive && styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  !site.isActive && styles.inactiveText,
                ]}
              >
                {site.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    marginBottom: 20,
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

  clientName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  contactPerson: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  emailText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
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
    marginBottom: 10,
  },

  siteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },

  siteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  siteSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
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

  inactiveText: {
    color: '#DC2626',
  },
});