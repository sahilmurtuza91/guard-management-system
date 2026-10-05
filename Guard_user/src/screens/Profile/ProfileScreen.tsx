import React, { useEffect, useState } from 'react';
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
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { RootState } from '../../app/store';
import { userApi } from '../../api/endpoints';
import { storage } from '../../utils/storage';
import { clientLogout, updateClientProfile } from '../../redux/authSlice';
import { disconnectSocket } from '../../services/socket';
import { resolveAssetUrl } from '../../api/client';
import { FullScreenImageViewer } from '../../components/FullScreenImageViewer';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state as any).auth?.user);

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [stats, setStats] = useState({ totalRequests: 0, activeRequests: 0, completedRequests: 0 });

  useEffect(() => {
    userApi
      .getProfile()
      .then((res) => {
        const freshUser = res.data.data.user;
        dispatch(updateClientProfile(freshUser));
        if (res.data.data.stats) setStats(res.data.data.stats);
      })
      .catch((error) => console.log('Profile load error: ', error));
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await storage.clear();
          disconnectSocket();
          dispatch(clientLogout());
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setIsImageViewerVisible(true)}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: resolveAssetUrl(user?.avatarUrl) }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.defaultAvatarBox]}>
                  <Ionicons name="person" size={42} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>CLIENT</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalRequests}</Text>
              <Text style={styles.statLabel}>Requests</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.activeRequests}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completedRequests}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CONTACT DETAILS</Text>
        <View style={styles.menuContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Email Address</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT & SETTINGS</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SavedAddresses')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="location-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.menuTitle}>Saved Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('NotificationSettings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.menuTitle}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('RaiseService')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.menuTitle}>Raise Service / Issue</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {user?.avatarUrl && (
        <FullScreenImageViewer
          visible={isImageViewerVisible}
          imageUri={resolveAssetUrl(user?.avatarUrl)}
          onClose={() => setIsImageViewerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  defaultAvatarBox: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  idBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '800',
  },
});