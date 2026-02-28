// Session Statistics Tracker
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './Logger';

const STATS_STORAGE_KEY = 'superdesk_session_stats';

export interface SessionStats {
    totalSessions: number;
    totalDuration: number;        // Total time in seconds
    sessionsAsHost: number;
    sessionsAsGuest: number;
    averageDuration: number;
    longestSession: number;
    lastSessionDate?: string;
    totalDataTransferred?: number; // Files transferred in bytes
}

class SessionStatsTracker {
    private stats: SessionStats = {
        totalSessions: 0,
        totalDuration: 0,
        sessionsAsHost: 0,
        sessionsAsGuest: 0,
        averageDuration: 0,
        longestSession: 0,
    };
    
    private currentSessionStart: number | null = null;
    private currentSessionRole: 'host' | 'guest' | null = null;

    async loadStats(): Promise<SessionStats> {
        try {
            const stored = await AsyncStorage.getItem(STATS_STORAGE_KEY);
            if (stored) {
                this.stats = JSON.parse(stored);
            }
        } catch (error) {
            Logger.warn('Failed to load session stats:', error);
        }
        return this.stats;
    }

    async saveStats(): Promise<void> {
        try {
            await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.stats));
        } catch (error) {
            Logger.warn('Failed to save session stats:', error);
        }
    }

    startSession(role: 'host' | 'guest'): void {
        this.currentSessionStart = Date.now();
        this.currentSessionRole = role;
        Logger.debug(`📊 Session started as ${role}`);
    }

    async endSession(): Promise<void> {
        if (!this.currentSessionStart || !this.currentSessionRole) return;

        const duration = Math.floor((Date.now() - this.currentSessionStart) / 1000);
        
        this.stats.totalSessions++;
        this.stats.totalDuration += duration;
        this.stats.lastSessionDate = new Date().toISOString();
        
        if (this.currentSessionRole === 'host') {
            this.stats.sessionsAsHost++;
        } else {
            this.stats.sessionsAsGuest++;
        }
        
        if (duration > this.stats.longestSession) {
            this.stats.longestSession = duration;
        }
        
        this.stats.averageDuration = Math.floor(
            this.stats.totalDuration / this.stats.totalSessions
        );
        
        await this.saveStats();
        
        Logger.debug(`📊 Session ended. Duration: ${this.formatDuration(duration)}`);
        Logger.debug(`📊 Total sessions: ${this.stats.totalSessions}`);
        
        this.currentSessionStart = null;
        this.currentSessionRole = null;
    }

    getStats(): SessionStats {
        return { ...this.stats };
    }

    formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    async clearStats(): Promise<void> {
        this.stats = {
            totalSessions: 0,
            totalDuration: 0,
            sessionsAsHost: 0,
            sessionsAsGuest: 0,
            averageDuration: 0,
            longestSession: 0,
        };
        await this.saveStats();
        Logger.debug('📊 Session stats cleared');
    }
}

export const sessionStatsTracker = new SessionStatsTracker();
