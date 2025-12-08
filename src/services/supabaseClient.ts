// Supabase Client Configuration with OTP Auth
import 'react-native-url-polyfill/auto';
import { createClient, Session, User } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://srwrsgkfkzstdsiqonzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd3JzZ2tma3pzdGRzaXFvbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODM2MzUsImV4cCI6MjA3ODg1OTYzNX0.URa75VP24G6anG_9Pyo2PqNrgNZ20DmEalcLAKezkSM';

// In-memory storage for session (persists until app is closed)
const memoryStorage: { [key: string]: string } = {};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: {
            getItem: async (key) => memoryStorage[key] || null,
            setItem: async (key, value) => { memoryStorage[key] = value; },
            removeItem: async (key) => { delete memoryStorage[key]; },
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Profile type matching Supabase 'profiles' table schema
export interface UserProfile {
    id: string;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
    status: string | null;
    username: string;
    created_at?: string;
    updated_at?: string;
}

// Auth helper functions for OTP
export const authService = {
    // Send OTP to email
    sendOTP: async (email: string) => {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        });
        if (error) throw error;
        return data;
    },

    // Verify OTP code
    verifyOTP: async (email: string, token: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        // Clear all stored data
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        if (error) throw error;
    },

    // Get current session
    getSession: async (): Promise<Session | null> => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current auth user
    getUser: async (): Promise<User | null> => {
        const { data, error } = await supabase.auth.getUser();
        if (error) return null;
        return data.user;
    },

    // Get user profile from the 'profiles' table
    getUserProfile: async (): Promise<UserProfile | null> => {
        const user = await authService.getUser();
        if (!user) return null;

        // Fetch from 'profiles' table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, display_name, avatar_url, status, username, created_at, updated_at')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            console.log('Profile fetch error:', error);
            // Return fallback with auth data
            return {
                id: user.id,
                email: user.email || null,
                display_name: null,
                avatar_url: null,
                status: null,
                username: user.email?.split('@')[0] || 'User',
            };
        }

        return profile as UserProfile;
    },

    // Update user profile in the 'profiles' table
    updateProfile: async (updates: { username?: string; display_name?: string; avatar_url?: string }) => {
        const user = await authService.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};

export default supabase;
