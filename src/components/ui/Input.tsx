import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { layout, typography } from '../../theme/designSystem';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    size?: 'md' | 'lg' | 'xl';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    inputStyle,
    size = 'md',
    ...textInputProps
}) => {
    const { colors } = useTheme();

    const getHeight = () => {
        switch (size) {
            case 'lg':
                return 52;
            case 'xl':
                return 60;
            default:
                return 44;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'lg':
                return typography.size.lg;
            case 'xl':
                return typography.size.xl;
            default:
                return typography.size.md;
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.card,
                        borderColor: error ? colors.error : colors.border,
                        color: colors.text,
                        height: getHeight(),
                        fontSize: getFontSize(),
                    },
                    inputStyle,
                ]}
                placeholderTextColor={colors.subText}
                {...textInputProps}
            />
            {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: layout.spacing.md,
    },
    label: {
        fontSize: typography.size.sm,
        fontFamily: typography.fontFamily.medium,
        marginBottom: layout.spacing.xs,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderRadius: layout.borderRadius.lg, // Updated to lg for more rounded appearance
        paddingHorizontal: layout.spacing.md,
        fontFamily: typography.fontFamily.regular,
    },
    error: {
        fontSize: typography.size.sm,
        marginTop: layout.spacing.xs,
    },
});
