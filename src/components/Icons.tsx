// Icon components for SuperDesk Mobile (using Text/Emoji - no native SVG required)
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface IconProps {
    size?: number;
    color?: string;
}

// Host Session - Monitor/Screen icon
export const HostIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>📺</Text>
    </View>
);

// Join Session - Connect/Link icon
export const JoinIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>🔗</Text>
    </View>
);

// File Transfer - Folder icon
export const FileTransferIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>📁</Text>
    </View>
);

// Friends - People icon
export const FriendsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>👥</Text>
    </View>
);

// Messages - Chat bubble icon
export const MessagesIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>💬</Text>
    </View>
);

// Settings - Gear icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>⚙️</Text>
    </View>
);

// Back Arrow icon
export const BackIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { fontSize: size * 0.8, color }]}>←</Text>
    </View>
);

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        textAlign: 'center',
    },
});
