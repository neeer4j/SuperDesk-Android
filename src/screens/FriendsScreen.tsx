// Friends Screen - Manage your connections
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    TextInput,
} from 'react-native';
import { SettingsIcon, FriendsIcon } from '../components/Icons';

interface FriendsScreenProps {
    navigation: any;
}

interface Friend {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);

    const handleAddFriend = () => {
        // TODO: Implement add friend functionality
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <TouchableOpacity style={styles.friendItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus}>
                    {item.status === 'online' ? '🟢 Online' :
                        item.status === 'away' ? '🟡 Away' :
                            `Last seen: ${item.lastSeen || 'Recently'}`}
                </Text>
            </View>
            <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header with Settings */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>Friends</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon size={24} color="#8b5cf6" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search friends..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Friends List */}
            <View style={styles.listContainer}>
                {friends.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FriendsIcon size={48} color="#333" />
                        <Text style={styles.emptyText}>No friends yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add friends to quickly connect with them
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={handleAddFriend}>
                            <Text style={styles.emptyButtonText}>Add Your First Friend</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={friends.filter(f =>
                            f.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )}
                        renderItem={renderFriendItem}
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
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2a2a3a',
        marginRight: 12,
    },
    addButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a3a',
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
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 24,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3a',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#8b5cf620',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8b5cf6',
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    friendStatus: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    connectButton: {
        backgroundColor: '#1e1e2e',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    connectText: {
        color: '#8b5cf6',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default FriendsScreen;
