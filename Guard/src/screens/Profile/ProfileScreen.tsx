import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { RootState } from '../../app/store';
import { logout } from '../../redux/authSlice';
import { guardApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { LoadingState } from '../../components/LoadingState';
import { storage } from '../../utils/storage';
import { disconnectSocket } from '../../services/socket';
import { FullScreenImageViewer } from '../../components/FullScreenImageViewer';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const incidents = useSelector((state: RootState) => state.incidents.incidents);
  const attendanceHistory = useSelector((state: RootState) => state.attendance.history);
  const isCheckedIn = useSelector((state: RootState) => state.attendance.isCheckedIn);

  const [guardProfile, setGuardProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [attendancePercent, setAttendancePercent] = React.useState<number | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    guardApi
      .getProfile()
      .then((res) => {
        if (isMounted) setGuardProfile(res.data.data.guard);
      })
      .catch((err) => console.log('Profile fetch error:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    guardApi
      .getAttendanceHistory()
      .then((res) => {
        if (!isMounted) return;
        const records = res.data.data.history || [];
        if (records.length === 0) {
          setAttendancePercent(null);
          return;
        }
        const presentOrLate = records.filter(
          (r: any) => r.status === 'Present' || r.status === 'Late'
        ).length;
        setAttendancePercent(Math.round((presentOrLate / records.length) * 100));
      })
      .catch((err) => console.log('Attendance stats fetch error:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await storage.clear();
            disconnectSocket();
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ]
    );
  };

  const guardStatusText = isCheckedIn ? 'Active / On Duty' : 'Off Duty';
  const guardStatusColor = isCheckedIn ? COLORS.success : COLORS.textMuted;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

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
              <Image
                source={{ uri: resolveAssetUrl(user?.avatarUrl) }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={COLORS.white}
              />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>
                EMP ID: {guardProfile?.employeeId || '—'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isCheckedIn
                    ? COLORS.successLight
                    : '#F1F5F9',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: guardStatusColor },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: guardStatusColor },
                ]}
              >
                {guardStatusText}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {attendanceHistory.length}
              </Text>
              <Text style={styles.statLabel}>Shifts Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{incidents.length}</Text>
              <Text style={styles.statLabel}>Incidents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {attendancePercent === null ? '—' : `${attendancePercent}%`}
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>GUARD DETAILS</Text>
        <View style={styles.menuContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Phone Number</Text>
              <Text style={styles.infoValue}>
                {user?.phone}
              </Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Email Address</Text>
              <Text style={styles.infoValue}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.primary}
            />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Joining Date</Text>
              <Text style={styles.infoValue}>
                {guardProfile?.joinDate ? new Date(guardProfile.joinDate).toLocaleDateString() : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={COLORS.primary}
            />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Assigned Location</Text>
              <Text style={styles.infoValue}>
                {guardProfile?.assignedSite?.name || guardProfile?.assignedSite?.address || 'Not assigned yet'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT & SETTINGS</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.textPrimary}
              />
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={COLORS.textPrimary}
              />
              <Text style={styles.menuTitle}>Notifications</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={COLORS.textPrimary}
              />
              <Text style={styles.menuTitle}>Help & Support</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
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

      <FullScreenImageViewer
        visible={isImageViewerVisible}
        imageUri={resolveAssetUrl(user?.avatarUrl)}
        onClose={() => setIsImageViewerVisible(false)}
      />
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
    gap: 4,
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
    gap: 8,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
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