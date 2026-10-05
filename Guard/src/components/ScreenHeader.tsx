import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

interface ScreenHeaderProps {
    title: string;
    onBackPress?: () => void;
    rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    onBackPress,
    rightAction,
}) => {
    return (
        <View style={styles.header}>
            {onBackPress ? (
                <TouchableOpacity style={styles.backBtn} onPress={onBackPress} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
            <Text style={styles.title}>{title}</Text>
            {rightAction ? rightAction : <View style={styles.placeholder} />}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
    placeholder: { width: 36 },
});