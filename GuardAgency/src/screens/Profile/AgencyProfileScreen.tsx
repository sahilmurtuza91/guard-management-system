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
  Alert,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { LoadingState } from '../../components/LoadingState';

import { agencyApi } from '../../api/endpoints';
import { resolveAssetUrl } from '../../api/client';
import { storage } from '../../utils/storage';
import { logout } from '../../redux/agencySlice';
import { disconnectSocket } from '../../services/socket';

const MENU_ITEMS = [
  { id: 'team', title: 'Team Members', icon: 'people-outline', route: 'TeamMembers' },
  { id: 'reports', title: 'Reports', icon: 'bar-chart-outline', route: 'ReportsDashboard' },
  { id: 'roles', title: 'Roles & Permissions', icon: 'key-outline', route: 'RolesPermissions' },
  { id: 'notif', title: 'Notification Settings', icon: 'notifications-outline', route: 'NotificationSettings' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', route: 'HelpSupport' },
];


const AgencyProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.agency?.user);
  const isAdmin = user?.role === 'agency_admin';

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const loadProfile = useCallback(() => {
    agencyApi
      .getProfile()
      .then((res) => {
        const agency = res.data.data.agency;
        setName(agency.name || '');
        setAddress(agency.address || '');
        setContactEmail(agency.contactEmail || '');
        setContactPhone(agency.contactPhone || '');
        setLogoUrl(resolveAssetUrl(agency.logoUrl));
      })
      .catch((error) => console.log('Agency profile load error: ', error))
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await storage.clear();
          disconnectSocket();
          dispatch(logout());
          (navigation.getParent() || navigation).reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
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

      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('EditAgencyProfile')}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={30} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.userName}>{user?.name || '—'}</Text>
          <Text style={styles.userSub}>{user?.email || user?.phone || ''}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Agency Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Agency Name</Text>
            <Text style={styles.infoValue}>{name || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{address || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{contactEmail || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{contactPhone || '—'}</Text>
          </View>
        </View>

        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AgencyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
  editText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  userCard: { alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 20, marginBottom: 16 },
  avatarBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarImage: { width: 60, height: 60, borderRadius: 14, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
  userSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', gap: 12 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' },
  infoValue: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  saveBtn: { marginTop: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary },
  menuList: { gap: 10, marginBottom: 20 },
  menuCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14 },
  menuText: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 14 },
  logoutText: { fontSize: 13, fontWeight: '900', color: '#DC2626' },
});
