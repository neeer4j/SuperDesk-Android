// Login Screen - OTP Authentication matching Desktop design
import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Alert,
    StatusBar,
    Image,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { authService } from '../services/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { VStack, Input, Button, Heading } from '../components/ui';
import { layout, typography } from '../theme/designSystem';

interface LoginScreenProps {
    navigation: any;
    onLogin: () => void;
}

interface UserProfile {
    username: string;
    avatar_url: string | null;
    email: string | null;
    display_name: string | null;
}

type AuthStep = 'email' | 'otp' | 'welcome';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLogin }) => {
    const { theme, colors } = useTheme();
    const [step, setStep] = useState<AuthStep>('email');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        try {
            const profile = await authService.getUserProfile();
            if (profile) {
                setUserProfile({
                    username: profile.username,
                    avatar_url: profile.avatar_url,
                    email: profile.email,
                    display_name: profile.display_name,
                });
                setStep('welcome');
            }
        } catch (error) {
            // No existing session
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.sendOTP(email);
            setStep('otp');
            Alert.alert('Code Sent', 'Check your email for the verification code');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send verification code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode || otpCode.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit code');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.verifyOTP(email, otpCode);
            const profile = await authService.getUserProfile();
            if (profile) {
                setUserProfile({
                    username: profile.username,
                    avatar_url: profile.avatar_url,
                    email: profile.email,
                    display_name: profile.display_name,
                });
                setStep('welcome');
            } else {
                onLogin();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Invalid verification code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        onLogin();
    };

    const handleSwitchAccount = async () => {
        await authService.signOut();
        setUserProfile(null);
        setStep('email');
        setEmail('');
        setOtpCode('');
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Welcome Back Screen
    if (step === 'welcome' && userProfile) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />
                <View style={styles.centerContainer}>
                    <Heading size="3xl" color={colors.text} style={styles.textCenter}>
                        Welcome Back!
                    </Heading>
                    <Text style={[styles.welcomeSubtext, { color: colors.subText }]}>
                        You're currently signed in as
                    </Text>

                    <View
                        style={[
                            styles.profileCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                    >
                        {/* Avatar */}
                        {userProfile.avatar_url ? (
                            <Image
                                source={{ uri: userProfile.avatar_url }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.avatarPlaceholder,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                <Text style={styles.avatarText}>
                                    {userProfile.username.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Heading size="xl" color={colors.text}>
                            @{userProfile.username}
                        </Heading>
                    </View>

                    <Button
                        title="Continue to Dashboard"
                        onPress={handleContinue}
                        size="lg"
                        style={styles.fullWidth}
                    />

                    <Button
                        title="Sign in with different account"
                        onPress={handleSwitchAccount}
                        variant="ghost"
                        style={styles.switchButton}
                    />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        {/* Header */}
                        <VStack spacing="sm" align="center" style={styles.header}>
                            <Heading size="4xl" color={colors.text} style={styles.letterSpacing}>
                                SuperDesk
                            </Heading>
                            <Text
                                style={[
                                    styles.headerSubtext,
                                    { color: colors.primary },
                                ]}
                            >
                                REMOTE DESKTOP CONTROL
                            </Text>
                        </VStack>

                        {/* Card */}
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                    shadowColor: theme === 'light' ? '#000' : 'transparent',
                                },
                            ]}
                        >
                            {step === 'email' ? (
                                <VStack spacing="xl">
                                    <VStack spacing="sm">
                                        <Heading size="xl" color={colors.text} style={styles.textCenter}>
                                            Sign In
                                        </Heading>
                                        <Text style={[styles.cardSubtext, { color: colors.subText }]}>
                                            Enter your email to receive a verification code
                                        </Text>
                                    </VStack>

                                    <Input
                                        label="EMAIL"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        size="xl"
                                    />

                                    <Button
                                        title="Send Code"
                                        onPress={handleSendOTP}
                                        size="lg"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    />
                                </VStack>
                            ) : (
                                <VStack spacing="xl">
                                    <VStack spacing="sm">
                                        <Heading size="xl" color={colors.text} style={styles.textCenter}>
                                            Verify Code
                                        </Heading>
                                        <Text style={[styles.cardSubtext, { color: colors.subText }]}>
                                            Enter the 6-digit code sent to {email}
                                        </Text>
                                    </VStack>

                                    <Input
                                        label="VERIFICATION CODE"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        size="xl"
                                        inputStyle={styles.otpInput}
                                    />

                                    <Button
                                        title="Verify"
                                        onPress={handleVerifyOTP}
                                        size="lg"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    />

                                    <Button
                                        title="Wrong email? Go back"
                                        onPress={() => setStep('email')}
                                        variant="ghost"
                                    />
                                </VStack>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: layout.spacing.xl,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: {
        paddingHorizontal: layout.spacing.xl,
        paddingVertical: layout.spacing.xxl,
    },
    header: {
        marginBottom: layout.spacing.xxl,
    },
    headerSubtext: {
        fontSize: typography.size.sm,
        marginTop: layout.spacing.sm,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    card: {
        padding: layout.spacing.xl,
        borderRadius: layout.borderRadius.lg,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    profileCard: {
        padding: layout.spacing.xxl,
        borderRadius: layout.borderRadius.lg,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: layout.spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    avatarText: {
        fontSize: typography.size.xxxl,
        fontWeight: 'bold',
        color: 'white',
    },
    textCenter: {
        textAlign: 'center',
    },
    letterSpacing: {
        letterSpacing: 1,
    },
    welcomeSubtext: {
        marginBottom: layout.spacing.xxl,
    },
    cardSubtext: {
        textAlign: 'center',
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: 10,
        fontSize: 24,
        fontWeight: 'bold',
    },
    fullWidth: {
        width: '100%',
    },
    switchButton: {
        marginTop: layout.spacing.md,
    },
});

export default LoginScreen;
