import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    Image,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigation';
import { colors, typography, layout } from '../theme/designSystem';

const LandingScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Simple fade-in animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.background}
            />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Logo */}
                <Image
                    source={require('../assets/supp.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* App Name */}
                <Text style={styles.appName}>SuperDesk</Text>

                {/* Tagline */}
                <Text style={styles.tagline}>
                    Remote desktop, simplified.
                </Text>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Text style={styles.footer}>v1.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.xl,
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: layout.spacing.lg,
    },
    appName: {
        fontSize: 32,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        letterSpacing: -0.5,
        marginBottom: layout.spacing.sm,
    },
    tagline: {
        fontSize: typography.size.md,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
        marginBottom: layout.spacing.xxl,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: layout.spacing.xxl,
        paddingVertical: layout.spacing.md,
        borderRadius: layout.borderRadius.md,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: typography.size.md,
        fontFamily: typography.fontFamily.semiBold,
    },
    footer: {
        position: 'absolute',
        bottom: layout.spacing.xl,
        fontSize: typography.size.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.textTertiary,
    },
});

export default LandingScreen;
