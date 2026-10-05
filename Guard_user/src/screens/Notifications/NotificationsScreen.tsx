import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { NotificationCard } from '../../components/NotificationCard';
import { LoadingState } from '../../components/LoadingState';
import { userApi } from '../../api/endpoints';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  targetScreen?: string;
  targetParams?: Record<string, any>;
}

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback((isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    userApi
      .getNotifications(true)
      .then((res) => {
        const list = res.data.data.notifications || [];
        setNotifications(
          list.map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleString(),
            isUnread: !n.isRead,
            targetScreen: n.targetScreen,
            targetParams: n.targetParams,
          }))
        );
      })
      .catch((error) => console.log('Notifications load error: ', error))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleMarkAllAsRead = () => {
    userApi
      .markAllNotificationsRead()
      .then(() => setNotifications([]))
      .catch((error) => console.log('Mark all as read error: ', error));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    userApi.markNotificationRead(item.id).catch((error) => console.log('Mark as read error: ', error));
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams || {});
    } else {
      Alert.alert(item.title, item.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <ScreenHeader title="Notifications" onBackPress={() => navigation.goBack()} />
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState message="Loading notifications..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadNotifications(true)} />}
        >
          {notifications.length === 0 && (
            <Text style={styles.emptyText}>You are all caught up. No new notifications.</Text>
          )}
          {notifications.map(item => (
            <NotificationCard
              key={item.id}
              title={item.title}
              message={item.message}
              time={item.time}
              isUnread={item.isUnread}
              onPress={() => handleNotificationPress(item)}
            />
          ))}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginTop: 60 },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: { padding: 20 },
});