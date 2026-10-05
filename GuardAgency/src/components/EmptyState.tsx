import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'file-tray-outline',
    title,
    subtitle,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Ionicons
                    name={icon as any}
                    size={32}
                    color={COLORS.textMuted}
                />
            </View>

            <Text style={styles.title}>{title}</Text>

            {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },

    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    title: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 18,
    },
});