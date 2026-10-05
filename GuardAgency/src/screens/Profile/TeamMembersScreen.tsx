import React, { useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Modal, Alert, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { useFocusEffect } from '@react-navigation/native';
import { agencyApi } from '../../api/endpoints';
import { useSelector } from 'react-redux';

const ROLE_LABEL: Record<string, string> = {
  agency_admin: 'Admin',
  operations_manager: 'Operations Manager',
  supervisor: 'Supervisor',
};

const ASSIGNABLE_ROLES: { value: string; label: string }[] = [
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operations_manager', label: 'Operations Manager' },
];

const MemberSchema = Yup.object().shape({
  name: Yup.string().trim().required('Full name is required'),
  email: Yup.string().trim().email('Invalid email address'),
  phone: Yup.string().trim().matches(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number').required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Temporary password is required'),
});

type MemberForm = Yup.InferType<typeof MemberSchema>;

export const TeamMembersScreen: React.FC<any> = ({ navigation }) => {
  const currentUser = useSelector((state: any) => state.agency?.user);
  const isAdmin = currentUser?.role === 'agency_admin';
  const [role, setRole] = useState('supervisor');
  const [showAddModal, setShowAddModal] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MemberForm>({
    resolver: yupResolver(MemberSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });
  const [team, setTeam] = useState<{ id: string; name: string; role: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTeam = useCallback(() => {
    agencyApi
      .getTeamMember()
      .then((res) => {
        const list = res.data.data.team || [];
        setTeam(list.map((m: any) => ({ id: m._id, name: m.name, role: m.role, email: m.email || m.phone || '' })));
      })
      .catch((error) => console.log('Team load error: ', error))
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTeam();
    }, [loadTeam])
  );

  const handleAddMember = async ({ name, email, phone, password }: MemberForm) => {
    setIsSaving(true);
    try {
      await agencyApi.addTeamMember({ name: name.trim(), email: email?.trim() ?? '', phone: phone.trim(), password, role });
      setShowAddModal(false);
      const addedName = name.trim();
      reset();
      setRole('supervisor');
      loadTeam();
      Alert.alert('Member Added', `${addedName} has been added. They can now log in with ${email?.trim() || phone.trim()} and the password you set.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to add team member. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Members</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState message="Loading team..." />
        ) : (
          team.map((member) => (
            <View key={member.id} style={[styles.inlineCard, styles.memberCard]}>
              <View style={styles.memberRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarInitial}>{member.name.charAt(0)}</Text>
                </View>
                <View style={styles.memberTextWrap}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>

                <View style={styles.inlineBadge}>
                  <Text style={styles.inlineBadgeText}>
                    {ROLE_LABEL[member.role] || member.role}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
            <Ionicons name="person-add-outline" size={18} color={COLORS.primary || '#2563EB'} />
            <Text style={styles.addBtnText}>Add Team Member</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Team Member</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Full Name"
                  placeholder="e.g. Neha Gupta"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  touched={Boolean(errors.name)}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Email"
                  placeholder="email@example.com"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  touched={Boolean(errors.email)}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Phone"
                  placeholder="9876543210"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                  touched={Boolean(errors.phone)}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Temporary Password"
                  placeholder="Set a temporary password (min 6 characters)"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword
                  autoCapitalize="none"
                  error={errors.password?.message}
                  touched={Boolean(errors.password)}
                />
              )}
            />
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 }}>Role</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {ASSIGNABLE_ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      paddingVertical: 9,
                      borderRadius: 10,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: active ? COLORS.primary : COLORS.border,
                      backgroundColor: active ? COLORS.primary : COLORS.white,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '800', color: active ? COLORS.white : COLORS.textSecondary }}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <PrimaryButton title="Add Member" onPress={handleSubmit(handleAddMember)} isLoading={isSaving} style={styles.modalSubmit} />
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TeamMembersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white || '#FFFFFF',
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary || '#111827' },

  scrollContent: { padding: 16, paddingBottom: 32 },

  inlineCard: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  memberCard: { marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary || '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: COLORS.white || '#FFFFFF', fontWeight: '900', fontSize: 15 },
  memberTextWrap: { flex: 1 },
  memberName: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary || '#111827' },
  memberEmail: { fontSize: 11, color: COLORS.textMuted || '#6B7280', marginTop: 2 },

  inlineBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  inlineBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary || '#2563EB',
    textTransform: 'capitalize',
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary || '#2563EB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,32,66,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white || '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary || '#111827', marginBottom: 16 },
  modalSubmit: { marginTop: 12 },
  modalCancel: { alignItems: 'center', marginTop: 12, paddingVertical: 8 },
  modalCancelText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted || '#6B7280' },
});