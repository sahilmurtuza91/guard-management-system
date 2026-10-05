import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';
import { IncidentItem } from '../redux/incidentSlice';

interface Props {
    item: IncidentItem;
    onPress: () => void;
}

export const IncidentCard: React.FC<Props> = ({
    item,
    onPress,
}) => {
    const getStatusStyle = (
        status: IncidentItem['status']
    ) => {
        switch (status) {
            case 'Resolved':
                return {
                    bg: '#DCFCE7',
                    text: '#15803D',
                };
            case 'Under Review':
                return {
                    bg: '#FEF3C7',
                    text: '#B45309',
                };
            case 'Rejected':
                return {
                    bg: '#F1F5F9',
                    text: '#64748B',
                };
            case 'Reported':
            default:
                return {
                    bg: '#FEE2E2',
                    text: '#B91C1C',
                };
        }
    };
    const getPriorityStyle = (
        priority: IncidentItem['priority']
    ) => {
        switch (priority) {
            case 'Critical':
            case 'High':
                return {
                    bg: '#FEE2E2',
                    text: '#DC2626',
                };
            case 'Medium':
                return {
                    bg: '#FEF3C7',
                    text: '#D97706',
                };
            case 'Low':
            default:
                return {
                    bg: '#DBEAFE',
                    text: '#2563EB',
                };
        }
    };
    const getStatusIcon = (
        status: IncidentItem['status']
    ) => {
        switch (status) {
            case 'Resolved':
                return {
                    name: 'checkmark-circle',
                    bg: '#DCFCE7',
                    color: '#16A34A',
                };
            case 'Rejected':
                return {
                    name: 'close-circle',
                    bg: '#F1F5F9',
                    color: '#64748B',
                };
            case 'Under Review':
                return {
                    name: 'time',
                    bg: '#FEF3C7',
                    color: '#D97706',
                };
            default:
                return {
                    name: 'warning',
                    bg: '#FEE2E2',
                    color: '#DC2626',
                };
        }
    };
    const statusStyle = getStatusStyle(item.status);
    const priorityStyle = getPriorityStyle(item.priority);
    const iconData = getStatusIcon(item.status);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconAndTitle}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: iconData.bg,
                            },
                        ]}
                    >
                        <Ionicons
                            name={iconData.name}
                            size={20}
                            color={iconData.color}
                        />

                    </View>

                    <View style={styles.titleWrapper}>
                        <Text
                            style={styles.incidentTitle}
                            numberOfLines={1}
                        >
                            {item.title || item.incidentType}
                        </Text>
                        <Text style={styles.incidentType}>
                            {item.incidentType}
                        </Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: statusStyle.bg,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color: statusStyle.text,
                            },
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.locationRow}>
                <Ionicons
                    name="location-outline"
                    size={15}
                    color={COLORS.textMuted}
                />
                <Text
                    style={styles.locationText}
                    numberOfLines={1}
                >
                    {item.location}
                </Text>

            </View>

            <View style={styles.cardFooter}>
                <View style={styles.timeWrapper}>
                    <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={COLORS.textMuted}
                    />
                    <Text style={styles.dateText}>
                        {item.date} • {item.time}
                    </Text>

                </View>

                <View style={styles.rightFooter}>
                    <View
                        style={[
                            styles.priorityBadge,
                            {
                                backgroundColor: priorityStyle.bg,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.priorityText,
                                {
                                    color: priorityStyle.text,
                                },
                            ]}
                        >
                            {item.priority}
                        </Text>

                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={COLORS.textMuted}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconAndTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleWrapper: {
        flex: 1,
    },
    incidentTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    incidentType: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    locationText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 2,
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    rightFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '800',
    },
});