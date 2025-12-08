// Login Screen - OTP Authentication matching Desktop design
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { authService } from '../services/supabaseClient';

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    // Welcome Back Screen - Desktop Style
    if (step === 'welcome' && userProfile) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

                <View style={styles.welcomeContent}>
                    {/* Title */}
                    <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                    <Text style={styles.welcomeSubtitle}>You're currently signed in as</Text>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        {userProfile.avatar_url ? (
                            <Image
                                source={{ uri: userProfile.avatar_url }}
                                style={styles.profileAvatar}
                            />
                        ) : (
                            <View style={styles.profileAvatarPlaceholder}>
                                <Text style={styles.profileAvatarText}>
                                    {userProfile.username.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.profileUsername}>@{userProfile.username}</Text>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                    >
                        <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
                    </TouchableOpacity>

                    {/* Switch Account */}
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={handleSwitchAccount}
                    >
                        <Text style={styles.switchButtonText}>Sign in with different account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>SuperDesk</Text>
                        <Text style={styles.subtitle}>Remote Desktop Control</Text>
                    </View>

                    {/* Auth Card */}
                    <View style={styles.card}>
                        {step === 'email' ? (
                            <>
                                <Text style={styles.cardTitle}>Sign In</Text>
                                <Text style={styles.cardDescription}>
                                    Enter your email to receive a verification code
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#666"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleSendOTP}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.continueButtonText}>Send Code</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.cardTitle}>Verify Code</Text>
                                <Text style={styles.cardDescription}>
                                    Enter the 6-digit code sent to {email}
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Verification Code</Text>
                                    <TextInput
                                        style={[styles.input, styles.otpInput]}
                                        placeholder="000000"
                                        placeholderTextColor="#666"
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        textAlign="center"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleVerifyOTP}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.continueButtonText}>Verify</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.switchButton}
                                    onPress={() => setStep('email')}
                                >
                                    <Text style={styles.switchButtonText}>
                                        Wrong email? Go back
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    welcomeContent: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#8b5cf6',
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
    },
    profileCard: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#2a2a3a',
        marginBottom: 24,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    profileAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileAvatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0a0a0f',
    },
    profileUsername: {
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
    },
    continueButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        padding: 18,
        width: '100%',
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        marginTop: 20,
        padding: 12,
    },
    switchButtonText: {
        color: '#8b5cf6',
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#16161e',
        borderRadius: 20,
        padding: 28,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 28,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: '#3a3a4a',
    },
    otpInput: {
        fontSize: 28,
        letterSpacing: 10,
        fontWeight: '600',
    },
});

export default LoginScreen;
