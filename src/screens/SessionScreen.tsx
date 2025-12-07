// Session Screen - Host mode (share phone screen to PC)
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    Share,
    Platform,
} from 'react-native';
import { socketService } from '../services/SocketService';
import { webRTCService } from '../services/WebRTCService';
import { screenCaptureService } from '../services/ScreenCaptureService';

interface SessionScreenProps {
    route: {
        params: {
            role: 'host';
        };
    };
    navigation: any;
}

const SessionScreen: React.FC<SessionScreenProps> = ({ route, navigation }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<string>('creating');
    const [isClientConnected, setIsClientConnected] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureError, setCaptureError] = useState<string | null>(null);

    const frameUnsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        createSession();

        return () => {
            stopCapture();
            webRTCService.close();
        };
    }, []);

    const createSession = async () => {
        try {
            // Set up session creation callback
            socketService.onSessionCreated((id) => {
                setSessionId(id);
                setConnectionState('waiting');
                initializeWebRTC(id);
            });

            // Create a new session
            socketService.createSession();
        } catch (error) {
            console.error('❌ Failed to create session:', error);
            Alert.alert('Error', 'Failed to create session.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        }
    };

    const initializeWebRTC = async (id: string) => {
        try {
            await webRTCService.initialize('host', id);

            webRTCService.onConnectionStateChange((state) => {
                setConnectionState(state);
                if (state === 'connected') {
                    setIsClientConnected(true);
                    // Auto-start screen capture when client connects
                    startScreenCapture();
                } else if (state === 'failed' || state === 'disconnected') {
                    setIsClientConnected(false);
                    stopCapture();
                }
            });
        } catch (error) {
            console.error('❌ WebRTC initialization error:', error);
        }
    };

    const startScreenCapture = async () => {
        if (Platform.OS !== 'android') {
            setCaptureError('Screen capture only supported on Android');
            return;
        }

        try {
            // Request permission first
            const hasPermission = await screenCaptureService.requestPermission();
            if (!hasPermission) {
                setCaptureError('Screen capture permission denied');
                return;
            }

            // Start capturing
            await screenCaptureService.startCapture();
            setIsCapturing(true);
            setCaptureError(null);

            // Subscribe to frames and send via WebRTC data channel
            frameUnsubscribeRef.current = screenCaptureService.onFrame((base64Frame) => {
                // Send frame through data channel to PC
                webRTCService.sendInputEvent({
                    type: 'touch',
                    action: 'frame',
                    data: { frame: base64Frame },
                });
            });

            console.log('📱 Screen capture started');
        } catch (error: any) {
            console.error('❌ Screen capture error:', error);
            setCaptureError(error.message || 'Failed to start screen capture');
        }
    };

    const stopCapture = async () => {
        if (frameUnsubscribeRef.current) {
            frameUnsubscribeRef.current();
            frameUnsubscribeRef.current = null;
        }

        try {
            await screenCaptureService.stopCapture();
            setIsCapturing(false);
        } catch (error) {
            console.error('❌ Stop capture error:', error);
        }
    };

    const handleShareCode = async () => {
        if (!sessionId) return;

        try {
            await Share.share({
                message: `Join my SuperDesk session: ${sessionId}`,
                title: 'SuperDesk Session Code',
            });
        } catch (error) {
            console.error('❌ Share error:', error);
        }
    };

    const handleStopSession = () => {
        Alert.alert(
            'End Session',
            'Are you sure you want to end this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                        await stopCapture();
                        webRTCService.close();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleManualStartCapture = () => {
        startScreenCapture();
    };

    const getStatusMessage = () => {
        if (captureError) {
            return captureError;
        }
        if (isCapturing) {
            return 'Streaming screen to PC...';
        }
        switch (connectionState) {
            case 'creating':
                return 'Creating session...';
            case 'waiting':
                return 'Waiting for PC to connect...';
            case 'connecting':
                return 'Connecting to PC...';
            case 'connected':
                return 'PC connected!';
            case 'failed':
                return 'Connection failed';
            default:
                return connectionState;
        }
    };

    const getStatusColor = () => {
        if (captureError) return '#ef4444';
        if (isCapturing) return '#22c55e';
        if (isClientConnected) return '#22c55e';
        return '#f59e0b';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleStopSession}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Host Session</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Session Code Display */}
                {sessionId ? (
                    <View style={styles.codeCard}>
                        <Text style={styles.codeLabel}>Your Session Code</Text>
                        <Text style={styles.codeValue}>{sessionId}</Text>
                        <Text style={styles.codeHint}>
                            Enter this code on your PC to connect
                        </Text>

                        <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
                            <Text style={styles.shareButtonText}>Share Code</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
                        <Text style={styles.loadingText}>Creating session...</Text>
                    </View>
                )}

                {/* Status */}
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: getStatusColor() }
                        ]} />
                        <Text style={styles.statusText}>{getStatusMessage()}</Text>
                    </View>

                    {isCapturing && (
                        <View style={styles.captureInfo}>
                            <Text style={styles.captureInfoText}>
                                📺 Screen is being shared
                            </Text>
                        </View>
                    )}

                    {isClientConnected && !isCapturing && !captureError && (
                        <TouchableOpacity
                            style={styles.startCaptureButton}
                            onPress={handleManualStartCapture}
                        >
                            <Text style={styles.startCaptureButtonText}>Start Screen Share</Text>
                        </TouchableOpacity>
                    )}

                    {captureError && (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleManualStartCapture}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>How it works</Text>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>1</Text>
                        <Text style={styles.stepText}>Share the session code with your PC</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>2</Text>
                        <Text style={styles.stepText}>Open SuperDesk on your PC and enter the code</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>3</Text>
                        <Text style={styles.stepText}>Allow screen capture when prompted</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>4</Text>
                        <Text style={styles.stepText}>Your PC can now view and control this phone</Text>
                    </View>
                </View>
            </View>

            {/* Stop Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopSession}>
                    <Text style={styles.stopButtonText}>End Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e1e2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    codeCard: {
        backgroundColor: '#16161e',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#8b5cf6',
        marginBottom: 20,
    },
    codeLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    codeValue: {
        color: '#fff',
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 8,
        marginBottom: 16,
    },
    codeHint: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    shareButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingCard: {
        backgroundColor: '#16161e',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
        marginTop: 20,
    },
    statusCard: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
    },
    captureInfo: {
        marginTop: 12,
        paddingLeft: 24,
    },
    captureInfoText: {
        color: '#22c55e',
        fontSize: 14,
    },
    startCaptureButton: {
        marginTop: 16,
        backgroundColor: '#8b5cf6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    startCaptureButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    retryButton: {
        marginTop: 12,
        paddingVertical: 8,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#8b5cf6',
        fontSize: 14,
        fontWeight: '600',
    },
    instructionsCard: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 20,
    },
    instructionsTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8b5cf6',
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
        marginRight: 12,
        overflow: 'hidden',
    },
    stepText: {
        flex: 1,
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    stopButton: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    stopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SessionScreen;
