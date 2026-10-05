import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/them';

interface RequestCardProps {
    title: string;
    date: string;
    guards: string;
    status: string;
    statusBg: string;
    statusColor: string;
    onPress: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
    title,
    date,
    guards,
    status,
    statusBg,
    statusColor,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.cardTop}>
                <Text 
                    style={styles.reqId} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>
                <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]} numberOfLines={1}>
                        {status}
                    </Text>
                </View>
            </View>

            <Text style={styles.reqDate}>{date}</Text>
            <Text style={styles.reqGuards}>{guards}</Text>
        </TouchableOpacity>
    );
};

export default RequestCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden', 
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    reqId: {
        flex: 1, 
        marginRight: 8,
        fontSize: 15,
        fontWeight: '900',
        color: COLORS.textPrimary,
    },
    badge: {
        flexShrink: 0,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    reqDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    reqGuards: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
});