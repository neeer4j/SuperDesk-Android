import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { layout } from '../../theme/designSystem';

interface StackProps {
    children: React.ReactNode;
    direction?: 'vertical' | 'horizontal';
    spacing?: keyof typeof layout.spacing;
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
    children,
    direction = 'vertical',
    spacing = 'md',
    align = 'stretch',
    justify = 'flex-start',
    style,
}) => {
    return (
        <View
            style={[
                styles.stack,
                {
                    flexDirection: direction === 'horizontal' ? 'row' : 'column',
                    alignItems: align,
                    justifyContent: justify,
                    gap: layout.spacing[spacing],
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

// Convenience components
export const VStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
    <Stack {...props} direction="vertical" />
);

export const HStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
    <Stack {...props} direction="horizontal" />
);

const styles = StyleSheet.create({
    stack: {
        // Base styles
    },
});
