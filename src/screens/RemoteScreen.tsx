// Remote Screen - View and control remote PC
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    GestureHandlerRootView,
    GestureDetector,
    Gesture,
} from 'react-native-gesture-handler';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { socketService } from '../services/SocketService';
import { webRTCService } from '../services/WebRTCService';
import { inputService } from '../services/InputService';

interface RemoteScreenProps {
    route: {
        params: {
            sessionId: string;
            role: 'viewer';
        };
    };
    navigation: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RemoteScreen: React.FC<RemoteScreenProps> = ({ route, navigation }) => {
    const { sessionId } = route.params;

    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [isRemoteControlEnabled, setIsRemoteControlEnabled] = useState(false);
    const [streamDimensions, setStreamDimensions] = useState({ width: 1920, height: 1080 });

    const cleanupRef = useRef(false);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        initializeConnection();

        // Set up view size for input translation
        inputService.setViewSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        inputService.setSessionId(sessionId);

        // Auto-hide controls after 5 seconds
        startControlsTimeout();

        // Handle session events
        socketService.onHostStoppedSharing(() => {
            if (!cleanupRef.current) {
                Alert.alert('Host Stopped', 'The host has stopped sharing their screen.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        });

        socketService.onHostDisconnected(() => {
            if (!cleanupRef.current) {
                Alert.alert('Host Disconnected', 'The host has left the session.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        });

        socketService.onSessionEnded(() => {
            if (!cleanupRef.current) {
                Alert.alert('Session Ended', 'The session has been ended.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        });

        socketService.onRemoteControlEnabled(() => {
            setIsRemoteControlEnabled(true);
        });

        socketService.onRemoteControlDisabled(() => {
            setIsRemoteControlEnabled(false);
        });

        return () => {
            cleanupRef.current = true;
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            webRTCService.close();
        };
    }, []);

    const startControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 5000);
    };

    const initializeConnection = async () => {
        try {
            // IMPORTANT: Set up callbacks BEFORE initialization
            // This ensures they're in place when ontrack fires during signaling
            webRTCService.onRemoteStream((stream) => {
                console.log('📱 Got remote stream!');
                setRemoteStream(stream);
            });

            webRTCService.onConnectionStateChange((state) => {
                console.log('📱 Connection state:', state);
                setConnectionState(state);

                if (state === 'failed') {
                    if (!cleanupRef.current) {
                        Alert.alert('Connection Failed', 'Failed to connect to the host.', [
                            { text: 'OK', onPress: () => navigation.goBack() },
                        ]);
                    }
                } else if (state === 'disconnected') {
                    if (!cleanupRef.current) {
                        Alert.alert('Disconnected', 'Lost connection to the host.', [
                            { text: 'OK', onPress: () => navigation.goBack() },
                        ]);
                    }
                }
            });

            // Enable data channel for low-latency input
            webRTCService.onDataChannelOpen(() => {
                console.log('📱 Data channel ready for input!');
                setIsRemoteControlEnabled(true);
            });

            // NOW initialize WebRTC (this will trigger signaling and potentially ontrack)
            await webRTCService.initialize('viewer', sessionId);

        } catch (error) {
            console.error('❌ Connection error:', error);
            Alert.alert('Connection Error', 'Failed to connect to remote session.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        }
    };

    // Gesture handlers for remote control
    const tapGesture = Gesture.Tap()
        .onEnd((event) => {
            if (isRemoteControlEnabled) {
                inputService.onTap(event.x, event.y);
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((event) => {
            if (isRemoteControlEnabled) {
                inputService.onDoubleTap(event.x, event.y);
            }
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onEnd((event) => {
            if (isRemoteControlEnabled) {
                inputService.onLongPress(event.x, event.y);
            }
        });

    const panGesture = Gesture.Pan()
        .onStart((event) => {
            if (isRemoteControlEnabled) {
                inputService.onTouchStart(event.x, event.y);
            }
        })
        .onUpdate((event) => {
            if (isRemoteControlEnabled) {
                inputService.onTouchMove(event.x, event.y);
            }
        })
        .onEnd(() => {
            if (isRemoteControlEnabled) {
                inputService.onTouchEnd();
            }
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            if (isRemoteControlEnabled) {
                inputService.onPinch(event.scale, event.focalX, event.focalY);
            }
        });

    // Combine gestures with priority to double tap
    const composedGesture = Gesture.Race(
        doubleTapGesture,
        Gesture.Simultaneous(
            tapGesture,
            longPressGesture,
            panGesture,
            pinchGesture
        )
    );

    const toggleControls = () => {
        setShowControls(!showControls);
        if (!showControls) {
            startControlsTimeout();
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect',
            'Are you sure you want to disconnect from this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: () => {
                        webRTCService.close();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const getConnectionStatusColor = () => {
        switch (connectionState) {
            case 'connected':
                return '#22c55e';
            case 'connecting':
            case 'new':
                return '#f59e0b';
            case 'failed':
            case 'disconnected':
                return '#ef4444';
            default:
                return '#888';
        }
    };

    const getStatusText = () => {
        if (remoteStream) {
            return isRemoteControlEnabled ? 'Connected • Control Enabled' : 'Connected • View Only';
        }
        switch (connectionState) {
            case 'connecting':
            case 'new':
                return 'Connecting...';
            case 'connected':
                return 'Waiting for video...';
            case 'failed':
                return 'Connection Failed';
            case 'disconnected':
                return 'Disconnected';
            default:
                return connectionState;
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar hidden />

            {/* Remote Stream View */}
            {remoteStream ? (
                <GestureDetector gesture={composedGesture}>
                    <View style={styles.streamContainer}>
                        <RTCView
                            streamURL={remoteStream.toURL()}
                            style={styles.stream}
                            objectFit="contain"
                        />
                    </View>
                </GestureDetector>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                    <Text style={styles.loadingText}>{getStatusText()}</Text>
                    <Text style={styles.sessionCode}>Session: {sessionId}</Text>
                </View>
            )}

            {/* Full Controls (only when NOT in remote control mode) */}
            {!isRemoteControlEnabled && showControls && (
                <View style={styles.controlsOverlay} pointerEvents="box-none">
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View style={styles.sessionInfo}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: getConnectionStatusColor() },
                                ]}
                            />
                            <Text style={styles.sessionText}>{getStatusText()}</Text>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={handleDisconnect}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => inputService.sendSpecialKey('escape')}
                        >
                            <Text style={styles.controlButtonText}>ESC</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => inputService.sendSpecialKey('home')}
                        >
                            <Text style={styles.controlButtonText}>🏠</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => inputService.sendSpecialKey('backspace')}
                        >
                            <Text style={styles.controlButtonText}>⌫</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => setIsRemoteControlEnabled(true)}
                        >
                            <Text style={styles.controlButtonText}>🖱️ Control</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Floating Control Toggle (only when in remote control mode) */}
            {isRemoteControlEnabled && remoteStream && (
                <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={() => setIsRemoteControlEnabled(false)}
                >
                    <Text style={styles.floatingControlText}>🖱️</Text>
                    <Text style={styles.floatingControlLabel}>Exit</Text>
                </TouchableOpacity>
            )}

            {/* Tap anywhere to toggle controls (only when NOT controlling) */}
            {!isRemoteControlEnabled && (
                <TouchableOpacity
                    style={styles.controlsToggle}
                    onPress={toggleControls}
                    activeOpacity={1}
                />
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    streamContainer: {
        flex: 1,
    },
    stream: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0f',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
        marginTop: 20,
    },
    sessionCode: {
        color: '#555',
        fontSize: 14,
        marginTop: 10,
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    sessionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        gap: 12,
    },
    controlButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        borderColor: '#8b5cf6',
        minWidth: 60,
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: '#22c55e',
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    controlsToggle: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        bottom: 100,
    },
    floatingControlButton: {
        position: 'absolute',
        right: 10,
        top: '45%',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    floatingControlText: {
        fontSize: 20,
    },
    floatingControlLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginTop: -2,
    },
});

export default RemoteScreen;
