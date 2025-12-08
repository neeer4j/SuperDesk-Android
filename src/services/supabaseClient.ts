// Supabase Client Configuration
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://srwrsgkfkzstdsiqonzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd3JzZ2tma3pzdGRzaXFvbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODM2MzUsImV4cCI6MjA3ODg1OTYzNX0.URa75VP24G6anG_9Pyo2PqNrgNZ20DmEalcLAKezkSM';

// Simple in-memory storage (fallback when AsyncStorage isn't available)
const memoryStorage: { [key: string]: string } = {};
const inMemoryStorage = {
    getItem: (key: string) => Promise.resolve(memoryStorage[key] || null),
    setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
        return Promise.resolve();
    },
    removeItem: (key: string) => {
        delete memoryStorage[key];
        return Promise.resolve();
    },
};

// Create Supabase client with in-memory storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: inMemoryStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Auth helper functions
export const authService = {
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // Sign up with email and password
    signUp: async (email: string, password: string, username?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email.split('@')[0],
                },
            },
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current user
    getUser: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};

export default supabase;
