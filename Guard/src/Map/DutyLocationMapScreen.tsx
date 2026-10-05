import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { COLORS } from '../constants/theme';
import { RootState } from '../app/store';
import { getCurrentGuardLocation } from '../utils/locationService';
import { PrimaryButton } from '../components/PrimaryButton';
import { guardApi } from '../api/endpoints';

const EARTH_RADIUS_METERS = 6371000;
const toRad = (value: number) => (value * Math.PI) / 180;
const getDistanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};
const formatDistance = (meters: number) =>
  meters < 1000 ? `${Math.round(meters)} m away` : `${(meters / 1000).toFixed(1)} km away`;

interface DutyLocationMapScreenProps {
  navigation: any;
  route: any;
}

export const DutyLocationMapScreen: React.FC<DutyLocationMapScreenProps> = ({
  navigation,
  route,
}) => {
  const webViewRef = useRef<any>(null);
  const WebViewComponent = WebView as React.ComponentType<any>;
  const shiftId = route.params?.shiftId;

  const { isCheckedIn } = useSelector((state: RootState) => state.attendance);

  const [shift, setShift] = useState<{
    locationName: string;
    locationAddress: string;
    supervisorPhone: string;
    supervisorName: string;
    timeRange: string;
  } | null>(null);

  const [isShiftLoading, setIsShiftLoading] = useState(true);

  const [destCoords, setDestCoords] = useState({
    lat: 30.7046,
    lng: 76.7179,
  });

  useEffect(() => {
    if (!shiftId) {
      setIsShiftLoading(false);
      return;
    }
    guardApi
      .getShiftDetails(shiftId)
      .then((res) => {
        const s = res.data.data.shift;
        setShift({
          locationName: s.site?.name || 'Duty Site',
          locationAddress: s.site?.address || '',
          supervisorPhone: s.supervisorPhone || '',
          supervisorName: s.supervisorName || '',
          timeRange: `${s.startTime} - ${s.endTime}`,
        });
        if (s.site?.latitude && s.site?.longitude) {
          setDestCoords({ lat: s.site.latitude, lng: s.site.longitude });
        }
      })
      .catch((error) => {
        console.log('Shift/site load error: ', error)
      })
      .finally(() => setIsShiftLoading(false));
  }, [shiftId]);

  useEffect(() => {
    if (webViewRef.current && shift) {
      webViewRef.current.injectJavaScript(`
        if (window.map && window.destMarker) {
          window.destMarker.setLatLng([${destCoords.lat}, ${destCoords.lng}]);
          window.map.setView([${destCoords.lat}, ${destCoords.lng}], 14);
        }
        true;
      `);
    }
  }, [destCoords.lat, destCoords.lng]);

  const [guardLocation, setGuardLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>({
    lat: 30.7046,
    lng: 76.7179,
    address: 'Fetching live GPS...',
  });

  const [isLocating, setIsLocating] = useState(false);

  const [hasLiveLocation, setHasLiveLocation] = useState(false);

  const fetchLiveCoordinates = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentGuardLocation();
      const newLoc = {
        lat: loc.latitude || 30.7046,
        lng: loc.longitude || 76.7179,
        address: loc.address || "Sector 17, Mohali",
      };
      setGuardLocation(newLoc);
      setHasLiveLocation(true);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.map) {
            window.map.setView([${newLoc.lat}, ${newLoc.lng}], 15);
            if (window.guardMarker) {
              window.guardMarker.setLatLng([${newLoc.lat}, ${newLoc.lng}]);
            }
          }
          true;
        `);
      }
    }
    catch {
      // fallback
    }
    finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    fetchLiveCoordinates();
  }, []);

  const handleOpenExternalNavigation = () => {
    const lat = destCoords.lat;
    const lng = destCoords.lng;
    const label = encodeURIComponent(shift?.locationName ?? 'Duty location');

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        );
      });
    }
  };

  const handleCallSupervisor = () => {
    if (shift?.supervisorPhone) {
      Linking.openURL(`tel:${shift.supervisorPhone.replace(/\s+/g, '')}`);
    }
  }

  const distanceText = hasLiveLocation
    ? formatDistance(getDistanceMeters(guardLocation.lat, guardLocation.lng, destCoords.lat, destCoords.lng))
    : 'Locating…';

  // Leaflet OpenStreetMap HTML
  const leafletMapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { height: 100%; width: 100%; }
          .custom-dest-pin {
            background-color: #2563EB;
            color: white;
            padding: 5px 8px;
            border-radius: 10px;
            font-family: sans-serif;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            border: 2px solid white;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${destCoords.lat}, ${destCoords.lng}], 14);
          window.map = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var destMarker = L.marker([${destCoords.lat}, ${destCoords.lng}]).addTo(map);
          window.destMarker = destMarker;
          destMarker.bindPopup("<b>${shift?.locationName ?? ''}</b><br>${shift?.locationAddress ?? ''}").openPopup();

          var guardIcon = L.divIcon({
            className: 'custom-dest-pin',
            html: '📍 Guard',
            iconSize: [60, 26],
            iconAnchor: [30, 13]
          });
          window.guardMarker = L.marker([${guardLocation.lat}, ${guardLocation.lng}], { icon: guardIcon }).addTo(map);
        </script>
      </body>
    </html>
  `;

  if (isShiftLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!shift) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.textMuted }}>Shift location not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duty Location</Text>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCallSupervisor}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        <WebViewComponent
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletMapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={fetchLiveCoordinates}
          activeOpacity={0.8}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="locate" size={22} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.locationTitleWrapper}>
            <Text style={styles.locationTitle}>{shift.locationName}</Text>
            <Text style={styles.locationSub}>{shift.locationAddress}</Text>
          </View>
          <View
            style={[
              styles.dutyBadge,
              { backgroundColor: isCheckedIn ? COLORS.successLight : '#F1F5F9' },
            ]}
          >
            <Text
              style={[
                styles.dutyBadgeText,
                { color: isCheckedIn ? COLORS.success : COLORS.textSecondary },
              ]}
            >
              {isCheckedIn ? 'Checked In' : 'Scheduled'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{shift.timeRange}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Ionicons name="person-outline" size={15} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{shift.supervisorName}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Ionicons name="navigate-outline" size={15} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{distanceText}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Open in Maps / Start Navigation"
          onPress={handleOpenExternalNavigation}
          style={styles.navigationBtn}
        />
      </View>
    </SafeAreaView>
  );
};

export default DutyLocationMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationTitleWrapper: {
    flex: 1,
    marginRight: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  locationSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  dutyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dutyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  navigationBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
  },
});