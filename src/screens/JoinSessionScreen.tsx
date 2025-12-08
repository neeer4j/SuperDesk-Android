// Join Session Screen - Connect to a remote PC
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
import { SettingsIcon } from '../components/Icons';

interface JoinSessionScreenProps {
    navigation: any;
}

const JoinSessionScreen: React.FC<JoinSessionScreenProps> = ({ navigation }) => {
    const [sessionCode, setSessionCode] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

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

            {/* Join Session Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Join Remote Session</Text>
                <Text style={styles.cardDescription}>
                    Enter the 8-character session code from the host PC to connect
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
                    style={[styles.button, styles.primaryButton, !isConnected && styles.buttonDisabled]}
                    onPress={handleJoinSession}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Sessions */}
            <View style={styles.recentContainer}>
                <Text style={styles.recentTitle}>Recent Sessions</Text>
                <Text style={styles.recentEmpty}>No recent sessions</Text>
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
        marginBottom: 20,
        lineHeight: 22,
    },
    input: {
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        padding: 16,
        fontSize: 20,
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
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    recentContainer: {
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8b5cf6',
        marginBottom: 12,
    },
    recentEmpty: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default JoinSessionScreen;
