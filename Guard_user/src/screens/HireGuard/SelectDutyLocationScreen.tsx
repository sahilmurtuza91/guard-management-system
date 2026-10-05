import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateHireDraft } from '../../redux/hireGuardSlice';
import { userApi } from '../../api/endpoints';
import { getCurrentClientLocation, searchAddressSuggestions, AddressSuggestion } from '../../utils/locationService';

const DutyLocationSchema = Yup.object().shape({
  address: Yup.string().trim().min(8, 'Please enter a complete duty address').required('Duty address is required'),
  landmark: Yup.string().trim().max(100, 'Landmark is too long'),
});

type DutyLocationForm = Yup.InferType<typeof DutyLocationSchema>;

export const SelectDutyLocationScreen: React.FC<
  ScreenProps<'SelectDutyLocation'>
> = ({ navigation }) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => state.hireGuard.draft);

  const [savedAddresses, setSavedAddresses] = useState<{ id: string; title: string; address: string; latitude?: number; longitude?: number }[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(draft.addressId || '');
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<DutyLocationForm>({
    resolver: yupResolver(DutyLocationSchema),
    defaultValues: { address: draft.locationAddress || '', landmark: draft.landmark || '' },
  });
  const customAddress = watch('address');
  const landmark = watch('landmark') || '';
  const setCustomAddress = (value: string) => setValue('address', value, { shouldValidate: true });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    userApi
      .getAddresses()
      .then((res) => {
        const list = (res.data.data.addresses || []).map((a: any) => ({
          id: a._id,
          title: a.label,
          address: a.addressLine,
          latitude: a.latitude,
          longitude: a.longitude,
        }));
        setSavedAddresses(list);
        if (!draft.addressId && list.length && !customAddress) {
          setSelectedAddressId(list[0].id);
          setCustomAddress(list[0].address);
          dispatch(updateHireDraft({ latitude: list[0].latitude, longitude: list[0].longitude }));
        }
      })
      .catch((error) => console.log('Saved addresses load error: ', error))
      .finally(() => setIsLoadingAddresses(false));
  }, []);

  const [isTypingCustom, setIsTypingCustom] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelectSaved = (addr: typeof savedAddresses[0]) => {
    setSelectedAddressId(addr.id);
    setCustomAddress(addr.address);
    setIsTypingCustom(false);
    dispatch(updateHireDraft({ latitude: addr.latitude, longitude: addr.longitude }));
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentClientLocation();
      setCustomAddress(loc.address);
      setSelectedAddressId('GPS-CURRENT');
      setIsTypingCustom(false);
      dispatch(updateHireDraft({ latitude: loc.latitude, longitude: loc.longitude }));
    } catch (error: any) {
      Alert.alert('Location Error', error?.message || 'Could not fetch your current location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddressInputChange = (text: string) => {
    setCustomAddress(text);
    setSelectedAddressId('CUSTOM-NEW');
    setIsTypingCustom(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (text.trim().length < 3) {
      setFilteredSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(text);
      setFilteredSuggestions(results);
      setIsSearchingSuggestions(false);
    }, 400);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setCustomAddress(suggestion.label);
    setIsTypingCustom(false);
    setFilteredSuggestions([]);
    dispatch(updateHireDraft({ latitude: suggestion.latitude, longitude: suggestion.longitude }));
  };

  const handleNext = () => {
    if (selectedAddressId === 'CUSTOM-NEW' && customAddress.trim()) {
      userApi
        .addAddress({ label: 'Duty Location', addressLine: customAddress.trim(), isDefault: savedAddresses.length === 0 })
        .catch((error) => console.log('Address auto-save error: ', error));
    }

    dispatch(
      updateHireDraft({
        addressId: selectedAddressId,
        locationAddress: customAddress,
        landmark,
      })
    );
    navigation.navigate('AdditionalInstructions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Duty Location"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Select from Saved Locations</Text>
        {isLoadingAddresses && <Text style={styles.addrText}>Loading saved addresses...</Text>}
        {!isLoadingAddresses && savedAddresses.length === 0 && (
          <Text style={styles.addrText}>No saved addresses yet — add one from your Profile, or type a new address below.</Text>
        )}
        <View style={styles.savedList}>
          {savedAddresses.map(addr => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressCard,
                  isSelected && styles.activeAddressCard,
                ]}
                onPress={() => handleSelectSaved(addr)}
                activeOpacity={0.8}
              >
                <View style={styles.addressCardLeft}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.addrTitle,
                        isSelected && styles.activeAddrTitle,
                      ]}
                    >
                      {addr.title}
                    </Text>
                    <Text style={styles.addrText}>{addr.address}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.activeRadio,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
          disabled={isLocating}
        >
          <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
          <Text style={styles.gpsButtonText}>{isLocating ? 'Locating...' : 'Use Current GPS Location'}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 24 }]}>
          Or Search / Enter Detailed Duty Address
        </Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onBlur, value } }) => (
            <CustomInput
              placeholder="Start typing building number, street, area..."
              value={value}
              onChangeText={handleAddressInputChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              error={errors.address?.message}
              touched={Boolean(errors.address)}
            />
          )}
        />

        {isTypingCustom && isSearchingSuggestions && (
          <Text style={styles.searchingText}>Searching...</Text>
        )}
        {isTypingCustom && !isSearchingSuggestions && filteredSuggestions.length > 0 && (
          <View style={styles.autocompleteContainer}>
            {filteredSuggestions.map((item, index) => (
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

        <Text style={[styles.label, { marginTop: 14 }]}>
          Landmark (Optional)
        </Text>
        <Controller
          control={control}
          name="landmark"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              placeholder="e.g. Near City Center Mall, Opposite Park"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.landmark?.message}
              touched={Boolean(errors.landmark)}
            />
          )}
        />

        <PrimaryButton
          title="Next"
          onPress={handleSubmit(handleNext)}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectDutyLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  savedList: {
    gap: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeAddressCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accentLight,
  },
  addressCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  activeAddrTitle: {
    color: COLORS.primary,
  },
  addrText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadio: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
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
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchingText: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
  autocompleteContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  nextBtn: {
    marginTop: 24,
  },
});