import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../constants/theme';
import { AttendanceRecord } from '../redux/attendanceSlice';

interface Props {
    item: AttendanceRecord;
    liveWorkingHours?: string;
}

export const AttendanceCard: React.FC<Props> = ({
    item,
    liveWorkingHours,
}) => {
    const getStatusStyle = (
        status: AttendanceRecord['status'],
    ) => {
        switch (status) {
            case 'Present':
                return {
                    bg: COLORS.successLight,
                    text: COLORS.success,
                };
            case 'Late':
                return {
                    bg: COLORS.warningLight,
                    text: COLORS.warning,
                };
            case 'Absent':
            default:
                return {
                    bg: COLORS.errorLight,
                    text: COLORS.error,
                };
        }
    };
    const statusStyle = getStatusStyle(item.status);
    const workingHours = liveWorkingHours || item.workingHours;
        
    return (
        <View style={styles.attendanceCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.dateText}>
                        {item.date}
                    </Text>
                    <Text style={styles.shiftText}>
                        {item.shiftName}
                    </Text>
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

            <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>
                        Check In:
                    </Text>

                    <Text style={styles.timeValue}>
                        {item.checkInTime}
                    </Text>
                </View>
                <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>
                        Check Out:
                    </Text>

                    <Text style={styles.timeValue}>
                        {item.checkOutTime}
                    </Text>
                </View>

                <View style={styles.hoursBox}>
                    <Text
                        style={[
                            styles.hoursValue,
                            item.status === 'Late' && {
                                color: COLORS.warning,
                            },
                        ]}
                    >
                        {workingHours}
                    </Text>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    attendanceCard: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginVertical: 6,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    shiftText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    timeValue: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    hoursBox: {
        alignItems: 'flex-end',
    },
    hoursValue: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
});