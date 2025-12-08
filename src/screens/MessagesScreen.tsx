// Messages Screen - Chat with friends
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
import { SettingsIcon, MessagesIcon } from '../components/Icons';

interface MessagesScreenProps {
    navigation: any;
}

interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const handleNewMessage = () => {
        // TODO: Implement new message functionality
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity style={styles.conversationItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{item.name}</Text>
                    <Text style={styles.conversationTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
            {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header with Settings */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>Messages</Text>
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
                    placeholder="Search messages..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.newButton} onPress={handleNewMessage}>
                    <Text style={styles.newButtonText}>New</Text>
                </TouchableOpacity>
            </View>

            {/* Conversations List */}
            <View style={styles.listContainer}>
                {conversations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MessagesIcon size={48} color="#333" />
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start a conversation with your friends
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={handleNewMessage}>
                            <Text style={styles.emptyButtonText}>Start a Conversation</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={conversations.filter(c =>
                            c.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )}
                        renderItem={renderConversationItem}
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
    newButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    newButtonText: {
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
    conversationItem: {
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
    conversationInfo: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    conversationName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    conversationTime: {
        fontSize: 12,
        color: '#666',
    },
    lastMessage: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    unreadBadge: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    unreadText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default MessagesScreen;
