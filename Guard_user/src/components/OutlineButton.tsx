import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/them';

interface OutlineButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'default' | 'danger';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
    title,
    onPress,
    disabled = false,
    variant = 'default',
    style,
    textStyle,
}) => {
    const color = variant === 'danger' ? COLORS.error : COLORS.primary;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { borderColor: color },
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.75}
        >
            <Text style={[styles.text, { color }, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
