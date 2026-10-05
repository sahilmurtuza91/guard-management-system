import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/them';
import { resolveAssetUrl } from '../api/client';

interface DashboardHeaderProps {
    name: string;
    avatarUrl?: string;
    onNotificationPress: () => void;
    hasUnreadNotifications?: boolean;
    location?: string | null;
}

const getTimeGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning,';
    if (hour >= 12 && hour < 17) return 'Good Afternoon,';
    if (hour >= 17 && hour < 21) return 'Good Evening,';
    return 'Good Night,';
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    name,
    avatarUrl,
    onNotificationPress,
    hasUnreadNotifications,
    location,
}) => {
    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerRow}>
                <View style={styles.profileSection}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: resolveAssetUrl(avatarUrl) }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.defaultAvatarBox]}>
                            <Ionicons
                                name="person"
                                size={22}
                                color={COLORS.primary}
                            />
                        </View>
                    )}
                    <View style={styles.textWrapper}>
                        <Text style={styles.greeting}>{getTimeGreeting()}</Text>
                        <Text style={styles.nameText}>{name}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={11} color={location ? '#94A3B8' : '#64748B'} />
                            <Text style={[styles.locationText, !location && styles.locationMuted]}>
                                {location || 'Location not available'}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.bellBtn}
                    onPress={onNotificationPress}
                    activeOpacity={0.8}
                >
                    <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
                    {hasUnreadNotifications ? <View style={styles.unreadDot} /> : null}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#0B1936',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 12 : 4,
        paddingBottom: 20,
        backgroundColor: '#0B1936',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#3B82F6',
    },
    defaultAvatarBox: {
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrapper: {},
    greeting: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        marginTop: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    locationText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    locationMuted: {
        color: '#64748B',
        fontStyle: 'italic',
    },
    bellBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: 9,
        right: 9,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#EF4444',
    },
});