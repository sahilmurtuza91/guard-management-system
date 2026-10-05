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

interface ClientUI {
  id: string;
  name: string;
  phone: string;
  sites: string;
}

export const ClientsListScreen: React.FC<ScreenProps<'ClientsList'>> = ({
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClients = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    try {
      const [clientsResponse, sitesResponse] = await Promise.all([
        clientSiteApi.getClients(),
        clientSiteApi.getSites(),
      ]);

      const rawClients = clientsResponse.data.data.clients || [];
      const rawSites = sitesResponse.data.data.sites || [];

      const siteCountByClient: Record<string, number> = {};

      rawSites.forEach((site: any) => {
        const clientId = site.client?._id || site.client;

        if (clientId) {
          siteCountByClient[clientId] =
            (siteCountByClient[clientId] || 0) + 1;
        }
      });

      const clientList = rawClients.map((client: any) => {
        const siteCount = siteCountByClient[client._id] || 0;

        return {
          id: client._id,
          name: client.user?.name || 'Client',
          phone: client.user?.phone || '',
          sites: `${siteCount} Site${siteCount === 1 ? '' : 's'}`,
        };
      });

      setClients(clientList);
    } catch (error) {
      console.log('Clients load error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      !searchQuery.trim() ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery),
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

        <Text style={styles.headerTitle}>Clients List</Text>

        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading clients..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadClients(true)}
            />
          }
        >
          <View style={styles.listContainer}>
            {filteredClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() =>
                  navigation.navigate('ClientDetails', {
                    clientId: client.id,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.clientLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{client.name}</Text>

                    <Text style={styles.clientPhone}>
                      {client.phone}
                    </Text>

                    <Text style={styles.clientSites}>
                      {client.sites}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ClientsListScreen;

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

  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },

  clientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clientName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  clientPhone: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  clientSites: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
});