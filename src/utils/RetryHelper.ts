/**
 * RetryHelper - Utility for retrying failed operations with exponential backoff
 */

export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    onRetry: () => {},
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;
    
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt < opts.maxAttempts) {
                const delay = Math.min(
                    opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
                    opts.maxDelay
                );
                
                opts.onRetry(attempt, error);
                console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';
    
    // Network errors
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        return 'Network connection failed. Please check your internet connection.';
    }
    
    // Timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        return 'Connection timed out. The server may be busy, please try again.';
    }
    
    // WebRTC errors
    if (error.message?.includes('ICE') || error.message?.includes('WebRTC')) {
        return 'Failed to establish peer connection. This may be due to firewall or NAT restrictions.';
    }
    
    // Session errors
    if (error.message?.includes('Session not found')) {
        return 'Session not found. Please check the session code and try again.';
    }
    
    if (error.message?.includes('Rate limit')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }
    
    // Permission errors
    if (error.message?.includes('Permission') || error.message?.includes('denied')) {
        return 'Permission denied. Please grant the required permissions.';
    }
    
    // Default to error message or generic message
    return error.message || 'An error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    
    // Network errors are retryable
    if (message.includes('network') || message.includes('fetch')) return true;
    
    // Timeouts are retryable
    if (message.includes('timeout')) return true;
    
    // Server errors (5xx) are retryable
    if (error.status >= 500 && error.status < 600) return true;
    
    // These are NOT retryable
    if (message.includes('not found')) return false;
    if (message.includes('permission')) return false;
    if (message.includes('unauthorized')) return false;
    if (message.includes('rate limit')) return false;
    
    return false;
}
