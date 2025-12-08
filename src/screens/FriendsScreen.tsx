// Friends Screen - Display and manage friends list
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    TextInput,
    Image,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SettingsIcon } from '../components/Icons';
import { friendsService, Friend } from '../services/supabaseClient';

interface FriendsScreenProps {
    navigation: any;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddingFriend, setIsAddingFriend] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setIsLoading(true);
            const [friendsList, requests] = await Promise.all([
                friendsService.getFriends(),
                friendsService.getPendingRequests(),
            ]);
            setFriends(friendsList);
            setPendingRequests(requests);
        } catch (error: any) {
            console.error('Failed to load friends:', error);
            Alert.alert('Error', error.message || 'Failed to load friends');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadFriends();
        setIsRefreshing(false);
    }, []);

    const handleAddFriend = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }

        setIsAddingFriend(true);
        try {
            await friendsService.addFriend(searchQuery.trim());
            setSearchQuery('');
            Alert.alert('Success', 'Friend request sent!');
            await loadFriends();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send friend request');
        } finally {
            setIsAddingFriend(false);
        }
    };

    const handleAcceptRequest = async (friendshipId: string) => {
        try {
            await friendsService.acceptFriend(friendshipId);
            Alert.alert('Success', 'Friend request accepted!');
            await loadFriends();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept request');
        }
    };

    const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
        Alert.alert(
            'Remove Friend',
            `Are you sure you want to remove ${friendName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await friendsService.removeFriend(friendshipId);
                            await loadFriends();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to remove friend');
                        }
                    },
                },
            ]
        );
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <View style={styles.friendItem}>
            {item.friend_profile?.avatar_url ? (
                <Image
                    source={{ uri: item.friend_profile.avatar_url }}
                    style={styles.avatar}
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.friend_profile?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
            )}
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                    {item.friend_profile?.display_name || item.friend_profile?.username}
                </Text>
                <Text style={styles.friendUsername}>@{item.friend_profile?.username}</Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.id, item.friend_profile?.username || 'this friend')}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPendingRequest = ({ item }: { item: Friend }) => (
        <View style={styles.requestItem}>
            {item.friend_profile?.avatar_url ? (
                <Image
                    source={{ uri: item.friend_profile.avatar_url }}
                    style={styles.avatar}
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.friend_profile?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
            )}
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                    {item.friend_profile?.display_name || item.friend_profile?.username}
                </Text>
                <Text style={styles.friendUsername}>@{item.friend_profile?.username}</Text>
            </View>
            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(item.id)}
            >
                <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Friends</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Add Friend Section */}
            <View style={styles.addFriendSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter username to add friend"
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddFriend}
                    disabled={isAddingFriend}
                >
                    {isAddingFriend ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.addButtonText}>Add</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pending Requests ({pendingRequests.length})</Text>
                    <FlatList
                        data={pendingRequests}
                        renderItem={renderPendingRequest}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {/* Friends List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {friends.length > 0 ? `Friends (${friends.length})` : 'No Friends Yet'}
                </Text>
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#8b5cf6"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                Add friends using their username above
                            </Text>
                        </View>
                    }
                />
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    settingsButton: {
        padding: 8,
    },
    addFriendSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
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
        paddingHorizontal: 24,
        justifyContent: 'center',
        minWidth: 80,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    section: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8b5cf6',
        marginBottom: 12,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#8b5cf640',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#8b5cf620',
        borderWidth: 2,
        borderColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8b5cf6',
    },
    friendInfo: {
        flex: 1,
        marginLeft: 12,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    friendUsername: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    removeButton: {
        backgroundColor: '#ef444420',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef444440',
    },
    removeButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: '#10b98120',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#10b98140',
    },
    acceptButtonText: {
        color: '#10b981',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default FriendsScreen;
