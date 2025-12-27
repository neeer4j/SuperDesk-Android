// Icon components using Lucide React Native
import React from 'react';
import {
    Monitor,
    Link,
    Folder,
    Users,
    MessageCircle,
    Settings,
    ChevronLeft,
    Menu,
} from 'lucide-react-native';

interface IconProps {
    size?: number;
    color?: string;
}

// Host Session - Monitor icon
export const HostIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Monitor size={size} color={color} strokeWidth={2} />
);

// Join Session - Link icon
export const JoinIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Link size={size} color={color} strokeWidth={2} />
);

// File Transfer - Folder icon
export const FileTransferIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Folder size={size} color={color} strokeWidth={2} />
);

// Friends - Users icon
export const FriendsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Users size={size} color={color} strokeWidth={2} />
);

// Messages - MessageCircle icon
export const MessagesIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <MessageCircle size={size} color={color} strokeWidth={2} />
);

// Settings - Settings icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Settings size={size} color={color} strokeWidth={2} />
);

// Back Arrow icon
export const BackIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <ChevronLeft size={size} color={color} strokeWidth={2} />
);

// Menu / Hamburger icon
export const MenuIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
    <Menu size={size} color={color} strokeWidth={2} />
);
