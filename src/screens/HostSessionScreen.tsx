// Host Session Screen - Share your device screen with session code
// Redesigned to use SessionManager for persistent sessions across tabs
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Share,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SettingsIcon } from '../components/Icons';
import { sessionManager, SessionState } from '../services/SessionManager';
import { webRTCService } from '../services/WebRTCService';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer, Card, Button } from '../components/ui';
import { colors, typography, layout } from '../theme/designSystem';
import Clipboard from '@react-native-clipboard/clipboard';

interface HostSessionScreenProps {
    navigation: any;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'session-active' | 'guest-connected';

const HostSessionScreen: React.FC<HostSessionScreenProps> = ({ navigation }) => {
    // We can still use useTheme for toggle logic if needed, but we rely on designSystem for values
    const { theme } = useTheme();
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [sessionCode, setSessionCode] = useState('');
    const [guestId, setGuestId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    useEffect(() => {
        // Initialize state from SessionManager
        const state = sessionManager.getState();
        if (state.isActive && state.role === 'host') {
            setSessionCode(state.sessionId || '');
            setGuestId(state.peerId);
            setConnectionStatus(state.peerId ? 'guest-connected' : 'session-active');
            setIsScreenSharing(state.isScreenSharing);
        }

        // Subscribe to session state changes
        const unsubscribe = sessionManager.subscribe((newState: SessionState, prevState: SessionState) => {
            if (newState.role === 'host' || newState.role === null) {
                if (!newState.isActive) {
                    setConnectionStatus('disconnected');
                    setSessionCode('');
                    setGuestId(null);
                    setIsScreenSharing(false);
                } else {
                    setSessionCode(newState.sessionId || '');
                    setGuestId(newState.peerId);
                    setConnectionStatus(newState.peerId ? 'guest-connected' : 'session-active');
                    setIsScreenSharing(newState.isScreenSharing);
                }
            }
        });

        // Listen for guest joined event
        const handleGuestJoined = (data: { guestId: string; sessionId: string }) => {
            console.log('📱 Guest joined:', data.guestId);
            setGuestId(data.guestId);
            setConnectionStatus('guest-connected');

            // AUTOMATICALLY Initialize WebRTC connection for file transfer
            const initDataConnection = async () => {
                try {
                    console.log('📱 Initializing WebRTC data connection...');
                    await webRTCService.initialize('host', data.sessionId);

                    // Wait a moment for initialization
                    await new Promise<void>(resolve => setTimeout(resolve, 500));

                    // Create offer to establish data channel
                    await webRTCService.createOffer();
                    console.log('📱 Data connection offer sent');
                } catch (err) {
                    console.error('❌ Failed to init data connection:', err);
                }
            };

            initDataConnection();
        };
        sessionManager.on('guestJoined', handleGuestJoined);

        // Listen for errors
        const handleError = (errorMsg: string) => {
            setError(errorMsg);
            setConnectionStatus('disconnected');
        };
        sessionManager.on('error', handleError);

        // Listen for session ended
        const handleSessionEnded = () => {
            setConnectionStatus('disconnected');
            setSessionCode('');
            setGuestId(null);
            setIsScreenSharing(false);
        };
        sessionManager.on('sessionEnded', handleSessionEnded);

        return () => {
            unsubscribe();
            sessionManager.off('guestJoined', handleGuestJoined);
            sessionManager.off('error', handleError);
            sessionManager.off('sessionEnded', handleSessionEnded);
        };
    }, []);

    const handleStartHosting = async () => {
        setConnectionStatus('connecting');
        setError(null);

        try {
            await sessionManager.createSession();
        } catch (err: any) {
            console.error('❌ Failed to start hosting:', err);
            setError(err.message || 'Failed to connect to server');
            setConnectionStatus('disconnected');
        }
    };

    const handleStopHosting = () => {
        Alert.alert(
            'End Session',
            'Are you sure you want to end the session? This will disconnect any connected guests.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: () => {
                        sessionManager.endSession();
                    },
                },
            ]
        );
    };

    const handleShareScreen = () => {
        if (!guestId) {
            Alert.alert(
                'No Guest Connected',
                'Wait for someone to join your session before sharing your screen.',
                [{ text: 'OK' }]
            );
            return;
        }

        navigation.navigate('Session', {
            role: 'host',
            sessionId: sessionCode,
            guestId: guestId,
        });
    };

    const handleCopyCode = useCallback(() => {
        Clipboard.setString(sessionCode);
        Alert.alert('Copied!', 'Session code copied to clipboard');
    }, [sessionCode]);

    const handleShareCode = useCallback(async () => {
        try {
            await Share.share({
                message: `Join my SuperDesk session with code: ${sessionCode}`,
                title: 'SuperDesk Session Code',
            });
        } catch (err: any) {
            Alert.alert('Error', 'Failed to share code');
        }
    }, [sessionCode]);

    const handleRefreshCode = useCallback(async () => {
        if (!sessionCode) return;

        try {
            setConnectionStatus('connecting');
            await sessionManager.refreshSessionCode();
        } catch (err: any) {
            setError(err.message || 'Failed to refresh code');
        }
    }, [sessionCode]);

    const formatCode = (code: string) => {
        if (code.length >= 8) {
            return code.slice(0, 4) + '-' + code.slice(4, 8);
        }
        return code;
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connecting':
                return 'Connecting to server...';
            case 'session-active':
                return 'Waiting for someone to join...';
            case 'guest-connected':
                return isScreenSharing ? 'Screen sharing active' : 'Guest connected! Ready to share screen';
            default:
                return '';
        }
    };

    const isHosting = connectionStatus === 'session-active' || connectionStatus === 'guest-connected';

    return (
        <ScreenContainer withScroll>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>SuperDesk</Text>
                <Button
                    title=""
                    variant="ghost"
                    icon={<SettingsIcon size={24} color={colors.textSecondary} />}
                    onPress={() => navigation.navigate('Settings')}
                    style={styles.settingsButton}
                />
            </View>

            {!isHosting ? (
                <>
                    {/* Host Session Card */}
                    <Card style={styles.mainCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>📡</Text>
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Host Session</Text>
                                <Text style={styles.cardSubtitle}>Share your screen with others</Text>
                            </View>
                        </View>

                        <Text style={styles.cardDescription}>
                            Generate a secure session code to share your screen with PC viewer.
                        </Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>⚠️ {error}</Text>
                            </View>
                        )}

                        <Button
                            title={connectionStatus === 'connecting' ? 'Connecting...' : 'Start Hosting'}
                            onPress={handleStartHosting}
                            loading={connectionStatus === 'connecting'}
                            style={styles.hostButton}
                        />
                    </Card>

                    {/* How it works */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>HOW IT WORKS</Text>

                        <Card variant="outlined" style={styles.infoCard}>
                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}><Text style={styles.stepText}>1</Text></View>
                                <Text style={styles.stepDesc}>Tap "Start Hosting" to get a code</Text>
                            </View>
                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}><Text style={styles.stepText}>2</Text></View>
                                <Text style={styles.stepDesc}>Share code with the viewer</Text>
                            </View>
                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}><Text style={styles.stepText}>3</Text></View>
                                <Text style={styles.stepDesc}>Approve screen share request</Text>
                            </View>
                        </Card>
                    </View>
                </>
            ) : (
                <>
                    {/* Active Session Card */}
                    <Card style={styles.activeCard}>
                        <View style={styles.statusHeader}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: connectionStatus === 'guest-connected' ? colors.success : colors.warning }
                            ]} />
                            <Text style={styles.statusText}>
                                {connectionStatus === 'guest-connected' ? 'Guest Connected' : 'Waiting for Guest'}
                            </Text>
                        </View>

                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>SESSION CODE</Text>
                            <Text style={styles.codeValue}>{formatCode(sessionCode)}</Text>
                        </View>

                        <View style={styles.actionGrid}>
                            <Button
                                title="Copy"
                                variant="secondary"
                                size="sm"
                                onPress={handleCopyCode}
                                style={styles.actionButton}
                            />
                            <Button
                                title="Share"
                                size="sm"
                                onPress={handleShareCode}
                                style={styles.actionButton}
                            />
                        </View>

                        {connectionStatus === 'guest-connected' && (
                            <Button
                                title={isScreenSharing ? "Return to Stream" : "Share Screen"}
                                variant="primary"
                                onPress={handleShareScreen}
                                style={{ marginTop: 16, backgroundColor: colors.success }}
                            />
                        )}
                    </Card>

                    <Button
                        title="End Session"
                        variant="danger"
                        onPress={handleStopHosting}
                        style={styles.endButton}
                    />

                    <View style={styles.statusFooter}>
                        <Text style={styles.footerText}>{getStatusText()}</Text>
                        {connectionStatus === 'session-active' && (
                            <ActivityIndicator size="small" color={colors.textTertiary} style={{ marginTop: 8 }} />
                        )}
                    </View>
                </>
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: layout.spacing.md,
        marginBottom: layout.spacing.md,
    },
    logo: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.size.xl,
        color: colors.textPrimary,
    },
    settingsButton: {
        padding: 0,
        height: 40,
        width: 40,
    },
    mainCard: {
        marginBottom: layout.spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: layout.borderRadius.md,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    iconText: {
        fontSize: 24,
    },
    cardTitle: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.size.lg,
        color: colors.textPrimary,
    },
    cardSubtitle: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    cardDescription: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.size.md,
        color: colors.textSecondary,
        marginBottom: layout.spacing.lg,
        lineHeight: typography.lineHeight.md,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: layout.spacing.md,
        borderRadius: layout.borderRadius.sm,
        marginBottom: layout.spacing.md,
    },
    errorText: {
        color: colors.error,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.size.sm,
    },
    hostButton: {
        width: '100%',
    },
    infoSection: {
        marginTop: layout.spacing.md,
    },
    sectionTitle: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        letterSpacing: 1,
        marginBottom: layout.spacing.sm,
    },
    infoCard: {
        padding: layout.spacing.md,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    stepText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepDesc: {
        color: colors.textSecondary,
        fontSize: 14,
    },

    // Active session styles
    activeCard: {
        borderColor: colors.primary,
        borderWidth: 1,
        marginBottom: layout.spacing.lg,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
        backgroundColor: colors.surfaceHighlight,
        padding: layout.spacing.sm,
        borderRadius: layout.borderRadius.full,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
        marginLeft: 4,
    },
    statusText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    codeContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xl,
    },
    codeLabel: {
        color: colors.primary,
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: layout.spacing.xs,
    },
    codeValue: {
        color: colors.textPrimary,
        fontSize: 40,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: 4,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: layout.spacing.md,
        marginTop: layout.spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    endButton: {
        marginTop: 'auto',
    },
    statusFooter: {
        marginTop: layout.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        color: colors.textTertiary,
        fontSize: 14,
    }
});

export default HostSessionScreen;
