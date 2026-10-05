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
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';

import { clientSiteApi } from '../../api/endpoints';

export const AddEditClientScreen: React.FC<ScreenProps<any>> = ({ navigation, route }) => {
  const clientId = route.params?.clientId;
  const isEditMode = !!clientId;

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const loadClient = async () => {
      try {
        const response = await clientSiteApi.getClientDetails(clientId!);
        const client = response.data.data.client;

        setClientName(client.user?.name || '');
        setPhone(client.user?.phone || '');
        setEmail(client.user?.email || '');
      } catch (error) {
        console.log('Client load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClient();
  }, [isEditMode, clientId]);

  const handleSaveClient = async () => {
    if (!clientName.trim() || !phone.trim() || !email.trim() || (!isEditMode && !tempPassword.trim())) {
      Alert.alert('Error', 'Please fill in all client details.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEditMode) {
        await clientSiteApi.updateClient(clientId!, { name: clientName.trim(), email: email.trim(), phone: phone.trim() });
      } else {
        await clientSiteApi.addClient({ name: clientName.trim(), email: email.trim(), phone: phone.trim(), password: tempPassword.trim() });
      }
      Alert.alert('Success', 'Client saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not save client. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})} />
        <LoadingState message="Loading client..." />
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add / Edit Client</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Company / Client Name</Text>
          <CustomInput
            placeholder="e.g. Sunrise Mall"
            value={clientName}
            onChangeText={setClientName}
          />

          <Text style={styles.label}>Phone Number</Text>
          <CustomInput
            placeholder="+91 9111111111"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email Address</Text>
          <CustomInput
            placeholder="client@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {!isEditMode && (
            <>
              <Text style={styles.label}>Temporary Password</Text>
              <CustomInput
                placeholder="Set a temporary login password"
                value={tempPassword}
                onChangeText={setTempPassword}
                secureTextEntry
              />
            </>
          )}

          <PrimaryButton
            title="Save Client"
            onPress={handleSaveClient}
            isLoading={isSaving}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEditClientScreen;

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
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  submitBtn: {
    marginTop: 24,
  },
});