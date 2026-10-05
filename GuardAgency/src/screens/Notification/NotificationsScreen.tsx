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
import { ScreenProps } from '../../navigation/types';
import { LoadingState } from '../../components/LoadingState';

import { agencyApi } from '../../api/endpoints';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: string;
  category: string;
  targetScreen: string | null;
  targetParams: Record<string, any> | null;
}

const TARGET_PARAM_KEY: Record<string, string> = {
  RequestDetails: 'requestId',
  ShiftDetails: 'shiftId',
  IncidentDetails: 'incidentId',
};

const CATEGORY_ICON: Record<string, string> = {
  Requests: 'document-text-outline',
  Duty: 'time-outline',
  Incidents: 'warning-outline',
  General: 'notifications-outline',
};

const FILTERS = ['All', 'Requests', 'Operations', 'System'] as const;
const matchesFilter = (filter: string, category: string) => {
  if (filter === 'All') return true;
  if (filter === 'Requests') return category === 'Requests';
  if (filter === 'Operations') return category === 'Duty' || category === 'Incidents';
  return category === 'General';
};

export const NotificationsScreen: React.FC<ScreenProps<'Notifications'>> = ({ navigation }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    }
    try {
      const response = await agencyApi.getNotifications();
      const notificationList = response.data.data.notifications || []

      setItems(
        notificationList
          .filter((notification: any) => !notification.isRead)
          .map((notification: any) => ({
            id: notification._id,
            title: notification.title,
            description: notification.message,
            time: new Date(notification.createdAt).toLocaleString(),
            unread: !notification.isRead,
            icon: CATEGORY_ICON[notification.category] || 'notifications-outline',
            category: notification.category || 'General',
            targetScreen: notification.targetScreen || null,
            targetParams: notification.targetParams || null,
          })),
      );
    } catch(error){
      console.log('Notification load error: ',error);
    } finally{
      setIsLoading(false);
      setIsRefreshing(false);
    }
  },[]);
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleMarkAllRead = () => {
    agencyApi
      .markAllNotificationsRead()
      .then(() => setItems([]))
      .catch((error) => console.log('Mark all read error: ', error));
  };

  const handlePress = (item: Notification) => {
    if (item.unread) {
      agencyApi.markNotificationRead(item.id).catch((error) => console.log('Mark read error: ', error));
      setItems((prev) => prev.filter((n) => n.id !== item.id));
    }
    if (item.targetScreen && TARGET_PARAM_KEY[item.targetScreen]) {
      const paramKey = TARGET_PARAM_KEY[item.targetScreen];
      const paramValue = item.targetParams?.[paramKey];
      if (paramValue) {
        navigation.navigate(item.targetScreen as any, { [paramKey]: paramValue } as any);
      }
    }
  };

  const visibleItems = items.filter((n) => matchesFilter(filter, n.category));

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
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllRead}>
          <Text style={styles.clearAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((filterItem) => (
            <TouchableOpacity
              key={filterItem}
              style={[styles.filterChip, filter === filterItem && styles.activeChip]}
              onPress={() => setFilter(filterItem)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === filterItem && styles.activeFilterText]}>{filterItem}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState message="Loading notifications..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadNotifications(true)} />}
        >
          {visibleItems.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="notifications-off-outline" size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up! Check back later for updates.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {visibleItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => handlePress(item)}
                  style={[styles.notifCard, item.unread && styles.unreadCard]}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                      {item.unread && <View style={styles.redDot} />}
                    </View>

                    <Text style={styles.notifDesc}>{item.description}</Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                      </View>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  filterRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    flex: 1,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  notifDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});