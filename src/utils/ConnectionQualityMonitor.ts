// Connection Quality Monitor Utility
import { Logger } from './Logger';

export interface ConnectionQualityMetrics {
    rtt?: number;              // Round-trip time in ms
    packetsLost?: number;      // Number of packets lost
    bandwidth?: number;        // Estimated bandwidth in bits/s
    timestamp: number;         // When metrics were collected
}

export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export class ConnectionQualityMonitor {
    /**
     * Determine connection quality level based on metrics
     */
    static getQualityLevel(metrics: ConnectionQualityMetrics): QualityLevel {
        if (!metrics.rtt) return 'unknown';
        
        const { rtt, packetsLost = 0 } = metrics;
        
        // Excellent: <50ms RTT, <1% packet loss
        if (rtt < 50 && packetsLost < 10) return 'excellent';
        
        // Good: <100ms RTT, <3% packet loss
        if (rtt < 100 && packetsLost < 30) return 'good';
        
        // Fair: <200ms RTT, <5% packet loss
        if (rtt < 200 && packetsLost < 50) return 'fair';
        
        // Poor: Everything else
        return 'poor';
    }
    
    /**
     * Get user-friendly description of connection quality
     */
    static getQualityDescription(level: QualityLevel): string {
        switch (level) {
            case 'excellent':
                return 'Excellent connection - Low latency, no packet loss';
            case 'good':
                return 'Good connection - Minimal latency';
            case 'fair':
                return 'Fair connection - Some latency may be noticeable';
            case 'poor':
                return 'Poor connection - High latency, may experience issues';
            case 'unknown':
                return 'Connection quality unknown';
        }
    }
    
    /**
     * Get emoji indicator for quality level
     */
    static getQualityEmoji(level: QualityLevel): string {
        switch (level) {
            case 'excellent': return '🟢';
            case 'good': return '🟡';
            case 'fair': return '🟠';
            case 'poor': return '🔴';
            case 'unknown': return '⚪';
        }
    }
    
    /**
     * Format metrics for display
     */
    static formatMetrics(metrics: ConnectionQualityMetrics): string {
        const parts: string[] = [];
        
        if (metrics.rtt !== undefined) {
            parts.push(`RTT: ${metrics.rtt}ms`);
        }
        
        if (metrics.packetsLost !== undefined) {
            parts.push(`Lost: ${metrics.packetsLost} packets`);
        }
        
        if (metrics.bandwidth !== undefined) {
            const mbps = (metrics.bandwidth / 1000000).toFixed(2);
            parts.push(`BW: ${mbps} Mbps`);
        }
        
        return parts.join(' | ');
    }
    
    /**
     * Log quality metrics
     */
    static logQuality(metrics: ConnectionQualityMetrics): void {
        const level = this.getQualityLevel(metrics);
        const emoji = this.getQualityEmoji(level);
        const formatted = this.formatMetrics(metrics);
        
        Logger.debug(`${emoji} ${level.toUpperCase()}: ${formatted}`);
    }
}
