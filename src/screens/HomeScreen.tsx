// Home Screen - Join or Host a session
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
} from 'react-native';
import { socketService } from '../services/SocketService';

interface HomeScreenProps {
    navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [sessionCode, setSessionCode] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        connectToServer();

        return () => {
            // Cleanup on unmount
        };
    }, []);

    const connectToServer = async () => {
        try {
            setIsConnecting(true);
            await socketService.connect();
            setIsConnected(true);
            setIsConnecting(false);
        } catch (error) {
            setIsConnecting(false);
            Alert.alert('Connection Error', 'Failed to connect to server. Please check your internet connection.');
        }
    };

    const handleJoinSession = () => {
        if (sessionCode.length !== 8) {
            Alert.alert('Invalid Code', 'Please enter an 8-character session code.');
            return;
        }

        navigation.navigate('Remote', {
            sessionId: sessionCode.toUpperCase(),
            role: 'viewer',
        });
    };

    const handleHostSession = () => {
        navigation.navigate('Session', { role: 'host' });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>SuperDesk</Text>
                <Text style={styles.subtitle}>Mobile Remote Control</Text>
            </View>

            {/* Connection Status */}
            <View style={styles.statusContainer}>
                {isConnecting ? (
                    <>
                        <ActivityIndicator size="small" color="#8b5cf6" />
                        <Text style={styles.statusText}>Connecting to server...</Text>
                    </>
                ) : isConnected ? (
                    <>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Connected</Text>
                    </>
                ) : (
                    <>
                        <View style={[styles.statusDot, styles.statusDotOffline]} />
                        <Text style={styles.statusText}>Disconnected</Text>
                    </>
                )}
            </View>

            {/* Join Session Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Join Remote Session</Text>
                <Text style={styles.cardDescription}>
                    Enter the 8-character session code from your PC
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter session code"
                    placeholderTextColor="#666"
                    value={sessionCode}
                    onChangeText={(text) => setSessionCode(text.toUpperCase())}
                    maxLength={8}
                    autoCapitalize="characters"
                />

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleJoinSession}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
            </View>

            {/* Host Session Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Host Session</Text>
                <Text style={styles.cardDescription}>
                    Share your phone screen with a PC (Android only)
                </Text>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleHostSession}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonTextSecondary}>Start Hosting</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Secure P2P Connection via WebRTC</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    logo: {
        fontSize: 36,
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
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
        marginRight: 8,
    },
    statusDotOffline: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        color: '#888',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 4,
        fontWeight: '600',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#3a3a4a',
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#8b5cf6',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#8b5cf6',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: '#555',
        fontSize: 12,
    },
});

export default HomeScreen;
