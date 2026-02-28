/**
 * Network Health Monitor
 * Monitors network connectivity and quality
 * 
 * NOTE: For full functionality, install @react-native-community/netinfo:
 * npm install @react-native-community/netinfo
 * 
 * This version provides basic monitoring without external dependencies
 */

import { Logger } from './Logger';

export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface NetworkStatus {
    isConnected: boolean;
    type: NetworkType;
    quality: NetworkQuality;
}

class NetworkHealthMonitor {
    private listeners: ((status: NetworkStatus) => void)[] = [];
    private currentStatus: NetworkStatus = {
        isConnected: true, // Assume connected by default
        type: 'unknown',
        quality: 'unknown',
    };
    
    private checkInterval: NodeJS.Timeout | null = null;

    async initialize() {
        // Try to use NetInfo if available
        try {
            const NetInfo = require('@react-native-community/netinfo');
            this.initializeWithNetInfo(NetInfo);
        } catch (error) {
            Logger.warn('NetInfo not available. Using basic connectivity monitoring.');
            this.initializeBasic();
        }
    }

    private async initializeWithNetInfo(NetInfo: any) {
        // Subscribe to network state changes
        NetInfo.addEventListener((state: any) => {
            const status: NetworkStatus = {
                isConnected: state.isConnected ?? false,
                type: this.mapNetworkType(state.type),
                quality: this.determineQuality(state),
            };
            
            this.currentStatus = status;
            this.notifyListeners(status);
            
            Logger.debug(`📶 Network status: ${status.type}, Quality: ${status.quality}`);
        });

        // Get initial state
        const state = await NetInfo.fetch();
        this.currentStatus = {
            isConnected: state.isConnected ?? false,
            type: this.mapNetworkType(state.type),
            quality: this.determineQuality(state),
        };
    }

    private initializeBasic() {
        // Basic periodic connectivity check by attempting to fetch a small resource
        this.checkInterval = setInterval(async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                
                await fetch('https://www.google.com/generate_204', {
                    signal: controller.signal,
                    cache: 'no-cache',
                });
                
                clearTimeout(timeout);
                
                if (!this.currentStatus.isConnected) {
                    this.currentStatus.isConnected = true;
                    this.notifyListeners(this.currentStatus);
                    Logger.debug('📶 Network restored');
                }
            } catch (error) {
                if (this.currentStatus.isConnected) {
                    this.currentStatus.isConnected = false;
                    this.currentStatus.quality = 'poor';
                    this.notifyListeners(this.currentStatus);
                    Logger.debug('📶 Network lost');
                }
            }
        }, 10000); // Check every 10 seconds
    }

    private mapNetworkType(type: string): NetworkType {
        switch (type) {
            case 'wifi':
                return 'wifi';
            case 'cellular':
                return 'cellular';
            case 'ethernet':
                return 'ethernet';
            case 'none':
                return 'none';
            default:
                return 'unknown';
        }
    }

    private determineQuality(state: any): NetworkQuality {
        if (!state.isConnected) return 'poor';
        
        // WiFi is generally better than cellular
        if (state.type === 'wifi') {
            return state.details?.strength >= 70 ? 'excellent' : 'good';
        }
        
        // Cellular quality based on generation
        if (state.type === 'cellular') {
            const generation = state.details?.cellularGeneration;
            if (generation === '5g') return 'excellent';
            if (generation === '4g') return 'good';
            if (generation === '3g') return 'fair';
            return 'poor';
        }
        
        // Ethernet is excellent
        if (state.type === 'ethernet') return 'excellent';
        
        return 'unknown';
    }

    getStatus(): NetworkStatus {
        return { ...this.currentStatus };
    }

    isGoodQuality(): boolean {
        return this.currentStatus.quality === 'excellent' || 
               this.currentStatus.quality === 'good';
    }

    subscribe(callback: (status: NetworkStatus) => void): () => void {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners(status: NetworkStatus) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                Logger.warn('Error in network status listener:', error);
            }
        });
    }

    getRecommendation(): string {
        const { type, quality } = this.currentStatus;
        
        if (!this.currentStatus.isConnected) {
            return '⚠️ No internet connection. Please check your network.';
        }
        
        if (type === 'cellular' && quality === 'poor') {
            return '⚠️ Poor cellular connection. Consider switching to WiFi for better performance.';
        }
        
        if (quality === 'fair') {
            return '⚠️ Network quality is fair. You may experience some latency.';
        }
        
        if (type === 'wifi' && quality === 'excellent') {
            return '✅ Excellent WiFi connection. Optimal for remote desktop.';
        }
        
        return '✅ Good network connection.';
    }
    
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

export const networkHealthMonitor = new NetworkHealthMonitor();
