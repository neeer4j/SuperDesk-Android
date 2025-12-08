// File Transfer Screen - Send and receive files
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    Alert,
} from 'react-native';
import { SettingsIcon, FileTransferIcon } from '../components/Icons';

interface FileTransferScreenProps {
    navigation: any;
}

interface TransferItem {
    id: string;
    name: string;
    size: string;
    type: 'sent' | 'received';
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
}

const FileTransferScreen: React.FC<FileTransferScreenProps> = ({ navigation }) => {
    const [transfers, setTransfers] = useState<TransferItem[]>([]);

    const handleSendFile = () => {
        Alert.alert('Coming Soon', 'File transfer feature will be available soon!');
    };

    const handleReceiveFile = () => {
        Alert.alert('Coming Soon', 'File receive feature will be available soon!');
    };

    const renderTransferItem = ({ item }: { item: TransferItem }) => (
        <View style={styles.transferItem}>
            <View style={styles.transferIcon}>
                <FileTransferIcon size={20} color="#8b5cf6" />
            </View>
            <View style={styles.transferInfo}>
                <Text style={styles.transferName}>{item.name}</Text>
                <Text style={styles.transferMeta}>{item.size} • {item.timestamp}</Text>
            </View>
            <View style={[styles.transferStatus,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'failed' && styles.statusFailed
            ]}>
                <Text style={styles.statusText}>
                    {item.status === 'completed' ? '✓' : item.status === 'failed' ? '✗' : '...'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header with Settings */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>File Transfer</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon size={24} color="#8b5cf6" />
                </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleSendFile}>
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>📤</Text>
                    </View>
                    <Text style={styles.actionText}>Send File</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleReceiveFile}>
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>📥</Text>
                    </View>
                    <Text style={styles.actionText}>Receive File</Text>
                </TouchableOpacity>
            </View>

            {/* Transfer History */}
            <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Transfer History</Text>

                {transfers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FileTransferIcon size={48} color="#333" />
                        <Text style={styles.emptyText}>No transfers yet</Text>
                        <Text style={styles.emptySubtext}>
                            Your file transfers will appear here
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={transfers}
                        renderItem={renderTransferItem}
                        keyExtractor={(item) => item.id}
                    />
                )}
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
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1e1e2e',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    historyContainer: {
        flex: 1,
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#444',
        marginTop: 8,
    },
    transferItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3a',
    },
    transferIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#1e1e2e',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transferInfo: {
        flex: 1,
    },
    transferName: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    transferMeta: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    transferStatus: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusCompleted: {
        backgroundColor: '#22c55e20',
    },
    statusFailed: {
        backgroundColor: '#ef444420',
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
    },
});

export default FileTransferScreen;
