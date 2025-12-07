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
            role: 'viewer' | 'host';
        };
    };
    navigation: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RemoteScreen: React.FC<RemoteScreenProps> = ({ route, navigation }) => {
    const { sessionId, role } = route.params;

    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const viewRef = useRef<View>(null);

    useEffect(() => {
        initializeConnection();

        // Set up view size for input translation
        inputService.setViewSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        // Auto-hide controls after 3 seconds
        const timer = setTimeout(() => setShowControls(false), 3000);

        return () => {
            clearTimeout(timer);
            webRTCService.close();
        };
    }, []);

    const initializeConnection = async () => {
        try {
            // Initialize WebRTC
            await webRTCService.initialize(role, sessionId);

            // Set up callbacks
            webRTCService.onRemoteStream((stream) => {
                console.log('📱 Got remote stream');
                setRemoteStream(stream);
            });

            webRTCService.onConnectionStateChange((state) => {
                setConnectionState(state);
                if (state === 'failed' || state === 'disconnected') {
                    Alert.alert('Disconnected', 'Connection to remote PC was lost.', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                }
            });

            // Join the session
            socketService.joinSession(sessionId);

            socketService.onSessionJoined((success) => {
                if (!success) {
                    Alert.alert('Session Not Found', 'The session code is invalid or expired.', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                }
            });

        } catch (error) {
            console.error('❌ Connection error:', error);
            Alert.alert('Connection Error', 'Failed to connect to remote session.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        }
    };

    // Gesture handlers
    const tapGesture = Gesture.Tap()
        .onEnd((event) => {
            inputService.onTap(event.x, event.y);
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((event) => {
            inputService.onDoubleTap(event.x, event.y);
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onEnd((event) => {
            inputService.onLongPress(event.x, event.y);
        });

    const panGesture = Gesture.Pan()
        .onStart((event) => {
            inputService.onTouchStart(event.x, event.y);
        })
        .onUpdate((event) => {
            inputService.onTouchMove(event.x, event.y);
        })
        .onEnd(() => {
            inputService.onTouchEnd();
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            inputService.onPinch(event.scale, event.focalX, event.focalY);
        });

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
    };

    const handleDisconnect = () => {
        webRTCService.close();
        navigation.goBack();
    };

    const getConnectionStatusColor = () => {
        switch (connectionState) {
            case 'connected': return '#22c55e';
            case 'connecting': return '#f59e0b';
            case 'failed': return '#ef4444';
            default: return '#888';
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar hidden />

            {/* Remote Stream View */}
            {remoteStream ? (
                <GestureDetector gesture={composedGesture}>
                    <View style={styles.streamContainer} ref={viewRef}>
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
                    <Text style={styles.loadingText}>
                        {connectionState === 'connecting'
                            ? 'Connecting to remote PC...'
                            : 'Waiting for video stream...'}
                    </Text>
                    <Text style={styles.sessionCode}>Session: {sessionId}</Text>
                </View>
            )}

            {/* Overlay Controls */}
            {showControls && (
                <View style={styles.controlsOverlay}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View style={styles.sessionInfo}>
                            <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
                            <Text style={styles.sessionText}>{sessionId}</Text>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={handleDisconnect}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => setIsKeyboardVisible(!isKeyboardVisible)}
                        >
                            <Text style={styles.controlButtonText}>⌨️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => inputService.sendSpecialKey('escape')}
                        >
                            <Text style={styles.controlButtonText}>ESC</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => inputService.sendKeyPress('', { ctrl: true, alt: true, meta: false })}
                        >
                            <Text style={styles.controlButtonText}>Ctrl+Alt</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Tap anywhere to toggle controls */}
            <TouchableOpacity
                style={styles.controlsToggle}
                onPress={toggleControls}
                activeOpacity={1}
            />
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
        paddingTop: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    sessionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        paddingBottom: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        gap: 12,
    },
    controlButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    controlsToggle: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 80,
    },
});

export default RemoteScreen;
