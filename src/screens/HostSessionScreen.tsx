// Host Session Screen - Share your device screen
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { socketService } from '../services/SocketService';
import { SettingsIcon } from '../components/Icons';

interface HostSessionScreenProps {
    navigation: any;
}

const HostSessionScreen: React.FC<HostSessionScreenProps> = ({ navigation }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionCode, setSessionCode] = useState('');

    useEffect(() => {
        connectToServer();
        return () => { };
    }, []);

    const connectToServer = async () => {
        try {
            setIsConnecting(true);
            await socketService.connect();
            setIsConnected(true);
            setIsConnecting(false);
        } catch (error) {
            setIsConnecting(false);
            Alert.alert('Connection Error', 'Failed to connect to server.');
        }
    };

    const handleHostSession = () => {
        navigation.navigate('Session', { role: 'host' });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header with Settings */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>SuperDesk</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon size={24} color="#8b5cf6" />
                </TouchableOpacity>
            </View>

            {/* Connection Status */}
            <View style={styles.statusContainer}>
                {isConnecting ? (
                    <>
                        <ActivityIndicator size="small" color="#8b5cf6" />
                        <Text style={styles.statusText}>Connecting...</Text>
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

            {/* Host Session Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Host Session</Text>
                <Text style={styles.cardDescription}>
                    Share your phone screen with a PC. Others can view and control your device remotely.
                </Text>

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton, !isConnected && styles.buttonDisabled]}
                    onPress={handleHostSession}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonText}>Start Hosting</Text>
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>How it works:</Text>
                <Text style={styles.infoText}>1. Tap "Start Hosting" to generate a session code</Text>
                <Text style={styles.infoText}>2. Share the code with someone you trust</Text>
                <Text style={styles.infoText}>3. They can view and control your screen</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    settingsButton: {
        padding: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#8b5cf6',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8b5cf6',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default HostSessionScreen;
