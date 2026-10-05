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
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../constants/theme';
import { resolveAssetUrl } from '../api/client';

interface DashboardHeaderProps {
    name: string;
    role?: string;
    avatarUrl?: string;
    unreadCount?: number;
    onNotificationPress: () => void;
}

const getTimeBasedGreeting = (): string => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning,';
    }
    if (currentHour >= 12 && currentHour < 17) {
        return 'Good Afternoon,';
    }
    if (currentHour >= 17 && currentHour < 21) {
        return 'Good Evening,';
    }
    return 'Good Night,';
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    name,
    role = 'Security Guard',
    avatarUrl,
    unreadCount = 0,
    onNotificationPress,
}) => {
    const profileImage = resolveAssetUrl(avatarUrl?.trim());

    return (
        <SafeAreaView edges={['top']} style={styles.safeTopHeader}>
            <View style={styles.topHeader}>
                <View style={styles.profileRow}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={22} color={COLORS.white} />
                        </View>
                    )}

                    <View style={styles.greetingWrapper}>
                        <Text style={styles.greetingText}>{getTimeBasedGreeting()}</Text>
                        <Text style={styles.guardName}>{name}</Text>
                        <Text style={styles.guardRole}>{role}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.notificationBtn}
                    onPress={onNotificationPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications" size={20} color={COLORS.white} />
                    {unreadCount > 0 && (
                        <View style={styles.notifyBadge}>
                            <Text style={styles.badgeNumber}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeTopHeader: {
        backgroundColor: '#0F2042',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 12 : 4,
        paddingBottom: 22,
        backgroundColor: '#0F2042',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#3B82F6',
        backgroundColor: '#1E3A8A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    greetingWrapper: {
        marginLeft: 12,
    },
    greetingText: {
        fontSize: 11,
        color: '#93C5FD',
        fontWeight: '500',
    },
    guardName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        marginTop: 1,
    },
    guardRole: {
        fontSize: 11,
        color: '#CBD5E1',
    },
    notificationBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifyBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeNumber: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '800',
    },
});