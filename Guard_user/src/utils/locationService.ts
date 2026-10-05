import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
    city: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;

    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
    } catch (err) {
        console.warn('Permission error:', err);
        return false;
    }
};

export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
): Promise<{ address: string; city: string }> => {
    try {
        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=jsonv2` +
            `&lat=${latitude}` +
            `&lon=${longitude}` +
            `&zoom=18` +
            `&addressdetails=1` +
            `&namedetails=1`;

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'GuardUserApp/1.0',
            },
        });

        if (!response.ok) {
            throw new Error('Nominatim request failed');
        }

        const data = await response.json();
        const addr = data.address || {};

        const city =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.village ||
            addr.county ||
            addr.suburb ||
            '';

        const parts = [
            addr.amenity,
            addr.building,
            addr.shop,
            addr.office,
            addr.tourism,
            addr.leisure,

            addr.house_number && addr.road
                ? `${addr.house_number} ${addr.road}`
                : addr.road,

            addr.neighbourhood,
            addr.quarter,
            addr.residential,
            addr.suburb,

            city,

            addr.city_district,
            addr.district,
            addr.state_district,

            addr.state,

            addr.postcode,
        ].filter(Boolean);

        const uniqueParts = [
            ...new Set(
                parts.map(value => String(value).trim()).filter(Boolean),
            ),
        ];

        let address = uniqueParts.join(', ');

        if (data.display_name) {
            const displayParts = String(data.display_name)
                .split(',')
                .map((part: string) => part.trim())
                .filter(Boolean);

            const uniqueDisplayParts = [...new Set(displayParts)];
            address = uniqueDisplayParts.join(', ');
        }

        if (address) {
            return { address, city };
        }
    } catch (error) {
        console.log('Nominatim error:', error);
    }

    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&localityLanguage=en`,
        );

        if (response.ok) {
            const data = await response.json();

            const city = data.city || data.locality || data.principalSubdivision || '';

            const parts = [
                data.locality,
                data.city,
                data.principalSubdivision,
                data.postcode,
            ].filter(Boolean);

            const uniqueParts = [
                ...new Set(parts.map((value: string) => value.trim()).filter(Boolean)),
            ];

            const address = uniqueParts.join(', ');

            if (address) {
                return { address, city };
            }
        }
    } catch (error) {
        console.log('BigDataCloud error:', error);
    }

    throw new Error('Unable to determine address from coordinates');
};

export const getCurrentClientLocation = async (): Promise<LocationData> => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
        throw new Error('Location permission denied');
    }

    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            async position => {
                try {
                    const { latitude, longitude, accuracy } = position.coords;
                    const result = await getAddressFromCoordinates(latitude, longitude);

                    resolve({
                        latitude,
                        longitude,
                        accuracy,
                        address: result.address,
                        city: result.city,
                    });
                } catch (error) {
                    reject(error);
                }
            },
            error => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
            },
        );
    });
};

export interface AddressSuggestion {
    label: string;
    latitude: number;
    longitude: number;
}

export const searchAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
    if (!query || query.trim().length < 3) return [];

    try {
        const url =
            `https://nominatim.openstreetmap.org/search` +
            `?format=jsonv2` +
            `&q=${encodeURIComponent(query.trim())}` +
            `&countrycodes=in` +
            `&addressdetails=1` +
            `&limit=6`;

        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'GuardUserApp/1.0',
            },
        });

        if (!response.ok) {
            throw new Error('Nominatim search request failed');
        }

        const data = await response.json();

        return (data || []).map((item: any) => ({
            label: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
        }));
    } catch (error) {
        console.log('Address search error:', error);
        return [];
    }
};

