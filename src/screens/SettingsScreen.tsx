// Settings Screen - App configuration
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { BackIcon } from '../components/Icons';

interface SettingsScreenProps {
    navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: true,
        autoConnect: false,
        highQuality: true,
        soundEffects: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => { } },
            ]
        );
    };

    const SettingItem = ({
        title,
        subtitle,
        value,
        onToggle
    }: {
        title: string;
        subtitle?: string;
        value: boolean;
        onToggle: () => void;
    }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#333', true: '#8b5cf650' }}
                thumbColor={value ? '#8b5cf6' : '#666'}
            />
        </View>
    );

    const SettingButton = ({
        title,
        subtitle,
        onPress,
        danger = false,
    }: {
        title: string;
        subtitle?: string;
        onPress: () => void;
        danger?: boolean;
    }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            {/* Header */}
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
                {/* General */}
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.section}>
                    <SettingItem
                        title="Notifications"
                        subtitle="Receive push notifications"
                        value={settings.notifications}
                        onToggle={() => handleToggle('notifications')}
                    />
                    <SettingItem
                        title="Dark Mode"
                        subtitle="Use dark theme"
                        value={settings.darkMode}
                        onToggle={() => handleToggle('darkMode')}
                    />
                    <SettingItem
                        title="Sound Effects"
                        subtitle="Play sounds for actions"
                        value={settings.soundEffects}
                        onToggle={() => handleToggle('soundEffects')}
                    />
                </View>

                {/* Connection */}
                <Text style={styles.sectionTitle}>Connection</Text>
                <View style={styles.section}>
                    <SettingItem
                        title="Auto Connect"
                        subtitle="Automatically reconnect to last session"
                        value={settings.autoConnect}
                        onToggle={() => handleToggle('autoConnect')}
                    />
                    <SettingItem
                        title="High Quality"
                        subtitle="Uses more bandwidth"
                        value={settings.highQuality}
                        onToggle={() => handleToggle('highQuality')}
                    />
                </View>

                {/* Account */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.section}>
                    <SettingButton
                        title="Edit Profile"
                        subtitle="Change your name and avatar"
                        onPress={() => { }}
                    />
                    <SettingButton
                        title="Privacy"
                        subtitle="Manage your privacy settings"
                        onPress={() => { }}
                    />
                    <SettingButton
                        title="Logout"
                        onPress={handleLogout}
                        danger
                    />
                </View>

                {/* About */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.section}>
                    <SettingButton
                        title="Version"
                        subtitle="1.0.0"
                        onPress={() => { }}
                    />
                    <SettingButton
                        title="Terms of Service"
                        onPress={() => { }}
                    />
                    <SettingButton
                        title="Privacy Policy"
                        onPress={() => { }}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>SuperDesk Mobile v1.0.0</Text>
                    <Text style={styles.footerSubtext}>© 2024 SuperDesk</Text>
                </View>
            </ScrollView>
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
        fontSize: 14,
        fontWeight: '600',
        color: '#8b5cf6',
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        backgroundColor: '#16161e',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3a',
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    dangerText: {
        color: '#ef4444',
    },
    chevron: {
        fontSize: 24,
        color: '#666',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    footerSubtext: {
        fontSize: 12,
        color: '#444',
        marginTop: 4,
    },
});

export default SettingsScreen;
