import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import {
  NotificationItem,
  deleteNotification,
  clearAllNotifications,
  setNotifications,
  addNotification,
} from '../../redux/notificationSlice';

import { guardApi } from '../../api/endpoints';
import { LoadingState } from '../../components/LoadingState';
import { onNewNotification, removeNewNotificationListener } from '../../services/socket';

interface NotificationsScreenProps {
  navigation: any;
}

const mapBackendNotification = (n: any): NotificationItem => ({
  id: n._id,
  title: n.title,
  message: n.message,
  timestamp: new Date(n.createdAt).toLocaleString(),
  isRead: n.isRead,
  category: n.category === 'Requests' ? 'General' : n.category,
  targetScreen: n.targetScreen,
  targetParams: n.targetParams,
});

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const loadNotifications = useCallback(() => {
    return guardApi
      .getNotifications(true)
      .then((res) => {
        dispatch(setNotifications((res.data.data.notifications || []).map(mapBackendNotification)));
      })
      .catch((error) => console.log('Notification load error: ', error));
  }, [dispatch]);

  useEffect(() => {
    loadNotifications().finally(() => setIsLoading(false));
  }, [loadNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications().finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    onNewNotification((incoming) => {
      dispatch(addNotification(mapBackendNotification(incoming)));
    });
    return () => {
      removeNewNotificationListener();
    };
  }, [dispatch]);

  const handleNotificationPress = (item: NotificationItem) => {
    guardApi.markNotificationRead(item.id).catch((error) => console.log('Mark as read error: ', error));
    dispatch(deleteNotification(item.id));

    if (item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams || {});
    }
  };

  const handleDismiss = (item: NotificationItem) => {
    guardApi.markNotificationRead(item.id).catch((error) => console.log('Mark as read error: ', error));
    dispatch(deleteNotification(item.id));
  };

  const handleMarkAllRead = () => {
    guardApi
      .markAllNotificationsRead()
      .catch((error) => console.log('Mark all as read error: ', error));
    dispatch(clearAllNotifications());
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'Duty':
        return { name: 'calendar', color: '#2563EB', bg: '#DBEAFE' };
      case 'Incidents':
        return { name: 'warning', color: COLORS.error, bg: '#FEE2E2' };
      default:
        return { name: 'notifications', color: '#8B5CF6', bg: '#EDE9FE' };
    }
  };

  const renderNotificationCard = ({ item }: { item: NotificationItem }) => {
    const iconMeta = getCategoryIcon(item.category);

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconAndTitle}>
            <View
              style={[styles.iconWrapper, { backgroundColor: iconMeta.bg }]}
            >
              <Ionicons
                name={iconMeta.name}
                size={18}
                color={iconMeta.color}
              />
            </View>

            <View style={styles.titleTextWrapper}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.notificationTitle,
                    !item.isRead && styles.unreadTitle,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDismiss(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.messageText}>{item.message}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>

          <View style={styles.headerActions}>
            {notifications.length > 0 ? (
              <TouchableOpacity
                style={styles.markReadBtn}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.markReadBtn} />
            )}
          </View>
        </View>

      </View>

      {isLoading ? (
        <LoadingState message='Loading notifications...' />
      ) : (
        <FlatList
          data={notifications}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No New Notifications</Text>
              <Text style={styles.emptySubtitle}>You are all caught up.</Text>
            </View>
          }
        />
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
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleTextWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#1E3A8A',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  timestampText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    paddingLeft: 46,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});