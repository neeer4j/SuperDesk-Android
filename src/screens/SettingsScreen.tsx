// Settings Screen - Matching Desktop Design
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Switch,
    Alert,
    Image,
    Modal,
    TextInput,
} from 'react-native';
import { BackIcon } from '../components/Icons';
import { authService, supabase } from '../services/supabaseClient';

interface SettingsScreenProps {
    navigation: any;
    onLogout?: () => void;
}

interface UserProfile {
    username: string;
    email: string | null;
    avatar_url: string | null;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, onLogout }) => {
    const [settings, setSettings] = useState({
        darkMode: true,
        notifications: true,
        soundEffects: true,
        startOnBoot: false,
        shareAudio: true,
    });
    const [videoQuality, setVideoQuality] = useState('Auto');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editUsername, setEditUsername] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await authService.getUserProfile();
            if (profile) {
                setUserProfile({
                    username: profile.username,
                    email: profile.email,
                    avatar_url: profile.avatar_url,
                });
                setEditUsername(profile.username);
            }
        } catch (error) {
            // Ignore errors
        }
    };

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.signOut();
                            if (onLogout) {
                                onLogout();
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const handleSaveProfile = async () => {
        try {
            await authService.updateProfile({ username: editUsername });
            setUserProfile(prev => prev ? { ...prev, username: editUsername } : null);
            setShowEditProfile(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        }
    };

    const SettingToggle = ({
        icon,
        title,
        subtitle,
        value,
        onToggle
    }: {
        icon: string;
        title: string;
        subtitle: string;
        value: boolean;
        onToggle: () => void;
    }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#333', true: '#10b981' }}
                thumbColor={'#fff'}
            />
        </View>
    );

    const SettingDropdown = ({
        icon,
        title,
        subtitle,
        value,
    }: {
        icon: string;
        title: string;
        subtitle: string;
        value: string;
    }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>{value}</Text>
                <Text style={styles.dropdownArrow}>▾</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <BackIcon size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.scrollView}>
                <Text style={styles.sectionTitle}>ACCOUNT</Text>
                <TouchableOpacity
                    style={styles.accountCard}
                    onPress={() => setShowEditProfile(true)}
                >
                    {userProfile?.avatar_url ? (
                        <Image
                            source={{ uri: userProfile.avatar_url }}
                            style={styles.accountAvatar}
                        />
                    ) : (
                        <View style={styles.accountAvatarPlaceholder}>
                            <Text style={styles.accountAvatarText}>
                                {userProfile?.username?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.accountInfo}>
                        <Text style={styles.accountEmail}>{userProfile?.email}</Text>
                        <Text style={styles.accountUsername}>@{userProfile?.username}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>APPEARANCE</Text>
                <View style={styles.section}>
                    <SettingToggle
                        icon="🌙"
                        title="Dark Mode"
                        subtitle="Switch to dark theme"
                        value={settings.darkMode}
                        onToggle={() => handleToggle('darkMode')}
                    />
                </View>

                <Text style={styles.sectionTitle}>PREFERENCES</Text>
                <View style={styles.section}>
                    <SettingToggle
                        icon="🔔"
                        title="Notifications"
                        subtitle="Get notified when someone joins"
                        value={settings.notifications}
                        onToggle={() => handleToggle('notifications')}
                    />
                    <SettingToggle
                        icon="🔊"
                        title="Sound Effects"
                        subtitle="Play sounds for events"
                        value={settings.soundEffects}
                        onToggle={() => handleToggle('soundEffects')}
                    />
                    <SettingToggle
                        icon="⏰"
                        title="Start on System Boot"
                        subtitle="Launch SuperDesk automatically"
                        value={settings.startOnBoot}
                        onToggle={() => handleToggle('startOnBoot')}
                    />
                </View>

                <Text style={styles.sectionTitle}>CONNECTION</Text>
                <View style={styles.section}>
                    <SettingDropdown
                        icon="📺"
                        title="Video Quality"
                        subtitle="Adjust stream quality"
                        value={videoQuality}
                    />
                    <SettingToggle
                        icon="🎵"
                        title="Share Audio"
                        subtitle="Share system audio in sessions"
                        value={settings.shareAudio}
                        onToggle={() => handleToggle('shareAudio')}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>SuperDesk Mobile v1.0.0</Text>
                </View>
            </ScrollView>

            <Modal
                visible={showEditProfile}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditProfile(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalAvatarContainer}>
                            {userProfile?.avatar_url ? (
                                <Image
                                    source={{ uri: userProfile.avatar_url }}
                                    style={styles.modalAvatar}
                                />
                            ) : (
                                <View style={styles.modalAvatarPlaceholder}>
                                    <Text style={styles.modalAvatarText}>
                                        {userProfile?.username?.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.changePhotoButton}>
                                <Text style={styles.changePhotoText}>📷 Change Photo</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalField}>
                            <Text style={styles.modalLabel}>EMAIL</Text>
                            <View style={styles.modalInputDisabled}>
                                <Text style={styles.modalInputText}>{userProfile?.email}</Text>
                            </View>
                            <Text style={styles.modalHint}>Your email cannot be changed</Text>
                        </View>

                        <View style={styles.modalField}>
                            <Text style={styles.modalLabel}>USERNAME</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editUsername}
                                onChangeText={setEditUsername}
                                placeholder="@username"
                                placeholderTextColor="#666"
                            />
                            <Text style={styles.modalHint}>Letters, numbers, underscores and periods. 3-30 characters.</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowEditProfile(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.modalSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8b5cf6',
        marginTop: 24,
        marginBottom: 12,
        letterSpacing: 1,
    },
    accountCard: {
        backgroundColor: '#16161e',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    accountAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    accountAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0a0a0f',
    },
    accountInfo: {
        marginLeft: 12,
        flex: 1,
    },
    accountEmail: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    accountUsername: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    chevron: {
        fontSize: 24,
        color: '#666',
    },
    section: {
        backgroundColor: '#16161e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3a',
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#8b5cf620',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    settingSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a3a',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    dropdownText: {
        color: '#fff',
        marginRight: 8,
    },
    dropdownArrow: {
        color: '#666',
    },
    logoutButton: {
        backgroundColor: '#ef444420',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#ef444440',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#3a3a4a',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    modalClose: {
        fontSize: 20,
        color: '#666',
        padding: 8,
    },
    modalAvatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    modalAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAvatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0a0a0f',
    },
    changePhotoButton: {
        backgroundColor: '#2a2a3a',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
    },
    modalField: {
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        marginBottom: 8,
        letterSpacing: 1,
    },
    modalInputDisabled: {
        backgroundColor: '#2a2a3a',
        borderRadius: 8,
        padding: 14,
    },
    modalInputText: {
        color: '#888',
        fontSize: 16,
    },
    modalInput: {
        backgroundColor: '#2a2a3a',
        borderRadius: 8,
        padding: 14,
        color: '#fff',
        fontSize: 16,
    },
    modalHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#2a2a3a',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    modalCancelText: {
        color: '#fff',
        fontWeight: '600',
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    modalSaveText: {
        color: '#8b5cf6',
        fontWeight: '600',
    },
});

export default SettingsScreen;
