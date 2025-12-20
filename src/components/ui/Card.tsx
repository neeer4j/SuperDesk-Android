import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, layout, shadows } from '../../theme/designSystem';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
    onPress?: () => void;
    padding?: keyof typeof layout.spacing;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
    onPress,
    padding = 'md',
}) => {
    const cardStyles = [
        styles.card,
        { padding: layout.spacing[padding] },
        variant === 'outlined' && styles.outlined,
        variant === 'elevated' && styles.elevated,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.md,
        // Default subtle border for all cards in dark mode for better definition
        borderWidth: 1,
        borderColor: colors.border,
    },
    outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 0,
        ...shadows.md,
    },
});
