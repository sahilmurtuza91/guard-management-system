import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
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
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { userApi } from '../../api/endpoints';
import { getCurrentClientLocation, searchAddressSuggestions, AddressSuggestion } from '../../utils/locationService';

interface AddressUI {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

const AddressSchema = Yup.object().shape({
  title: Yup.string().trim().min(2, 'Label is too short').required('Address label is required'),
  address: Yup.string().trim().min(8, 'Please enter a complete address').required('Address is required'),
});

type AddressForm = Yup.InferType<typeof AddressSchema>;

const toAddressUI = (a: any): AddressUI => ({
  id: a._id,
  title: a.label,
  address: a.addressLine,
  isDefault: !!a.isDefault,
});

export const SavedAddressesScreen: React.FC<ScreenProps<'SavedAddresses'>> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<AddressUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: yupResolver(AddressSchema),
    defaultValues: { title: '', address: '' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newLatitude, setNewLatitude] = useState<number | undefined>(undefined);
  const [newLongitude, setNewLongitude] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userApi
      .getAddresses()
      .then((res) => setAddresses((res.data.data.addresses || []).map(toAddressUI)))
      .catch((error) => console.log('Addresses load error: ', error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentClientLocation();
      setValue('address', loc.address, { shouldValidate: true });
      setNewLatitude(loc.latitude);
      setNewLongitude(loc.longitude);
      setSuggestions([]);
    } catch (error: any) {
      Alert.alert('Location Error', error?.message || 'Could not fetch your current location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddressTextChange = (text: string) => {
    setNewLatitude(undefined);
    setNewLongitude(undefined);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(text);
      setSuggestions(results);
      setIsSearching(false);
    }, 400);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setValue('address', suggestion.label, { shouldValidate: true });
    setNewLatitude(suggestion.latitude);
    setNewLongitude(suggestion.longitude);
    setSuggestions([]);
  };

  const handleAddAddress = async ({ title, address }: AddressForm) => {
    setIsSaving(true);
    try {
      const response = await userApi.addAddress({
        label: title.trim(),
        addressLine: address.trim(),
        latitude: newLatitude,
        longitude: newLongitude,
        isDefault: addresses.length === 0,
      });
      setAddresses((response.data.data.addresses || []).map(toAddressUI));
      reset();
      setNewLatitude(undefined);
      setNewLongitude(undefined);
      setSuggestions([]);
      setShowAddForm(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not save the address. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this saved location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          userApi
            .deleteAddress(id)
            .then((response) => setAddresses((response.data.data.addresses || []).map(toAddressUI)))
            .catch((error) => console.log('Address delete error: ', error));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Saved Addresses" onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <LoadingState message="Loading addresses..." />
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topActionRow}>
          <Text style={styles.sectionTitle}>Your Duty Locations</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.8}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={16} color={COLORS.primary} />
            <Text style={styles.addBtnText}>{showAddForm ? 'Cancel' : 'Add New'}</Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formHeading}>Add New Address</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Address Label"
                  placeholder="e.g. Warehouse, Branch Office"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  touched={Boolean(errors.title)}
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Complete Address"
                  placeholder="Enter building number, street, sector..."
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleAddressTextChange(text);
                  }}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  error={errors.address?.message}
                  touched={Boolean(errors.address)}
                />
              )}
            />
            {isSearching && <Text style={styles.searchingText}>Searching...</Text>}
            {!isSearching && suggestions.length > 0 && (
              <View style={styles.autocompleteContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.suggestionText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleUseCurrentLocation}
              activeOpacity={0.8}
              disabled={isLocating}
            >
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.gpsButtonText}>{isLocating ? 'Locating...' : 'Use Current GPS Location'}</Text>
            </TouchableOpacity>
            <PrimaryButton title="Save Address" onPress={handleSubmit(handleAddAddress)} isLoading={isSaving} style={styles.saveBtn} />
          </View>
        )}

        <View style={styles.listContainer}>
          {addresses.map(item => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.addressTitle}>{item.title}</Text>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressSub}>{item.address}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SavedAddressesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  formCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  formHeading: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  saveBtn: { marginTop: 14 },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  gpsButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  searchingText: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
  autocompleteContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  suggestionText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, flex: 1 },
  listContainer: { gap: 12 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  addressSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
});