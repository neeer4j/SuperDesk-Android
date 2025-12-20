import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { typography } from '../../theme/designSystem';
import { useTheme } from '../../context/ThemeContext';

interface HeadingProps extends TextProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    color?: string;
    children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
    size = 'xl',
    weight = 'bold',
    color,
    children,
    style,
    ...props
}) => {
    const { colors } = useTheme();

    const getFontSize = () => {
        switch (size) {
            case 'sm':
                return typography.size.lg;
            case 'md':
                return typography.size.xl;
            case 'lg':
                return 22;
            case 'xl':
                return typography.size.xxl;
            case '2xl':
                return 36;
            case '3xl':
                return typography.size.xxxl;
            case '4xl':
                return 48;
            default:
                return typography.size.xxl;
        }
    };

    const getFontWeight = (): TextStyle['fontWeight'] => {
        switch (weight) {
            case 'normal':
                return '400';
            case 'medium':
                return '500';
            case 'semibold':
                return '600';
            case 'bold':
                return '700';
            case 'extrabold':
                return '800';
            default:
                return '700';
        }
    };

    return (
        <Text
            style={[
                styles.heading,
                {
                    fontSize: getFontSize(),
                    fontWeight: getFontWeight(),
                    color: color || colors.text,
                },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontFamily: typography.fontFamily.bold,
    },
});
