import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenProps } from '../../navigation/types';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

import { operationsApi } from '../../api/endpoints';

export const LiveGuardsMapScreen: React.FC<ScreenProps<'LiveGuardsMap'>> = ({ navigation }) => {
  const [liveGuards, setLiveGuards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuardId, setSelectedGuardId] = useState<string | undefined>();

  useEffect(() => {
    operationsApi
      .getLiveGuardsMap()
      .then((res) => {
        const guards = res.data.data.liveGuards || [];
        setLiveGuards(guards);
        setSelectedGuardId(guards[0]?.shiftId);
      })
      .catch((err) => console.log('Live map load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedGuard = liveGuards.find((g) => g.shiftId === selectedGuardId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
    
      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Guards Map</Text>
      </View>

      {isLoading ? (
        <LoadingState message="Loading live guards..." />
      ) : liveGuards.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="No guards on active duty"
          subtitle="As soon as a guard checks in, it will appear here live"
        />
      ) : (
        <>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={COLORS.primary || '#2563EB'} />
            <Text style={styles.mapPlaceholderTitle}>
              {selectedGuard ? `${selectedGuard.guard?.user?.name} @ ${selectedGuard.site?.name}` : 'Select a guard'}
            </Text>
            <Text style={styles.mapPlaceholderSubtitle}>
              {liveGuards.length} guard{liveGuards.length > 1 ? 's' : ''} currently on active duty
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Active Guards</Text>
            {liveGuards.map((item) => (
              <TouchableOpacity key={item.shiftId} onPress={() => setSelectedGuardId(item.shiftId)} activeOpacity={0.75}>
                <View style={[styles.inlineCard, styles.guardCard, selectedGuardId === item.shiftId && styles.guardCardActive]}>
                  <View style={styles.guardRow}>
                    <View style={styles.avatarWrap}>
                      <Ionicons name="person" size={18} color={COLORS.white || '#FFFFFF'} />
                      <View style={styles.liveDot} />
                    </View>
                    <View style={styles.guardTextWrap}>
                      <Text style={styles.guardName}>{item.guard?.user?.name}</Text>
                      <Text style={styles.guardSite}>{item.site?.name}</Text>
                    </View>
                    <View style={styles.pingWrap}>
                      <Text style={styles.pingText}>
                        {item.lastKnownLocation?.updatedAt
                          ? new Date(item.lastKnownLocation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'No GPS ping yet'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default LiveGuardsMapScreen;

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

  mapPlaceholder: {
    height: 220,
    backgroundColor: COLORS.accentLight || '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E5E7EB',
  },
  mapPlaceholderTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary || '#111827', marginTop: 8 },
  mapPlaceholderSubtitle: { fontSize: 12, color: COLORS.textSecondary || '#4B5563', marginTop: 2 },
  listContent: { padding: 16, paddingBottom: 32 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted || '#6B7280', marginBottom: 12, textTransform: 'uppercase' },

  // Direct Card UI
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
  guardCard: { marginBottom: 8 },
  guardCardActive: { borderColor: COLORS.primary || '#2563EB', backgroundColor: COLORS.accentLight || '#EFF6FF' },
  guardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success || '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success || '#10B981',
    borderWidth: 2,
    borderColor: COLORS.white || '#FFFFFF',
  },
  guardTextWrap: { flex: 1 },
  guardName: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary || '#111827' },
  guardSite: { fontSize: 11, color: COLORS.textMuted || '#6B7280', marginTop: 2 },
  pingWrap: { alignItems: 'flex-end' },
  pingText: { fontSize: 10, fontWeight: '700', color: COLORS.success || '#10B981' },
  checkInText: { fontSize: 10, color: COLORS.textMuted || '#6B7280', marginTop: 2 },
});