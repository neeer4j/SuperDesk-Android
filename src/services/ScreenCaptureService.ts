// TypeScript wrapper for the native ScreenCaptureModule
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenCaptureModule } = NativeModules;

// Event names
export const SCREEN_CAPTURE_EVENTS = {
    FRAME_CAPTURED: 'onFrameCaptured',
    CAPTURE_STOPPED: 'onCaptureStopped',
    CAPTURE_ERROR: 'onCaptureError',
};

// Event emitter for screen capture events
const eventEmitter = Platform.OS === 'android'
    ? new NativeEventEmitter(ScreenCaptureModule)
    : null;

/**
 * Screen capture service for Android using MediaProjection API.
 * This module provides methods to request permission, start/stop capture,
 * and receive frames via events.
 */
class ScreenCaptureService {
    private frameListeners: ((base64Frame: string) => void)[] = [];
    private stopListeners: (() => void)[] = [];
    private errorListeners: ((error: string) => void)[] = [];
    private subscriptions: any[] = [];

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!eventEmitter) return;

        // Frame captured event
        const frameSub = eventEmitter.addListener(
            SCREEN_CAPTURE_EVENTS.FRAME_CAPTURED,
            (base64Frame: string) => {
                this.frameListeners.forEach(listener => listener(base64Frame));
            }
        );
        this.subscriptions.push(frameSub);

        // Capture stopped event
        const stopSub = eventEmitter.addListener(
            SCREEN_CAPTURE_EVENTS.CAPTURE_STOPPED,
            () => {
                this.stopListeners.forEach(listener => listener());
            }
        );
        this.subscriptions.push(stopSub);

        // Error event
        const errorSub = eventEmitter.addListener(
            SCREEN_CAPTURE_EVENTS.CAPTURE_ERROR,
            (error: string) => {
                this.errorListeners.forEach(listener => listener(error));
            }
        );
        this.subscriptions.push(errorSub);
    }

    /**
     * Request screen capture permission from the user.
     * This will show a system dialog asking for permission.
     * @returns Promise that resolves true if permission granted
     */
    async requestPermission(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            throw new Error('Screen capture is only supported on Android');
        }
        return await ScreenCaptureModule.requestPermission();
    }

    /**
     * Start capturing frames after permission is granted.
     * @returns Promise that resolves true if capture started
     */
    async startCapture(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            throw new Error('Screen capture is only supported on Android');
        }
        return await ScreenCaptureModule.startCapture();
    }

    /**
     * Stop screen capture.
     * @returns Promise that resolves true if capture stopped
     */
    async stopCapture(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true;
        }
        return await ScreenCaptureModule.stopCapture();
    }

    /**
     * Check if screen capture is currently running.
     * @returns Promise with boolean indicating capture state
     */
    async isCapturing(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }
        return await ScreenCaptureModule.isCapturing();
    }

    /**
     * Register a listener for captured frames.
     * @param callback Function to call with base64 encoded frame
     */
    onFrame(callback: (base64Frame: string) => void): () => void {
        this.frameListeners.push(callback);
        return () => {
            const index = this.frameListeners.indexOf(callback);
            if (index > -1) {
                this.frameListeners.splice(index, 1);
            }
        };
    }

    /**
     * Register a listener for capture stopped event.
     * @param callback Function to call when capture stops
     */
    onStop(callback: () => void): () => void {
        this.stopListeners.push(callback);
        return () => {
            const index = this.stopListeners.indexOf(callback);
            if (index > -1) {
                this.stopListeners.splice(index, 1);
            }
        };
    }

    /**
     * Register a listener for capture errors.
     * @param callback Function to call with error message
     */
    onError(callback: (error: string) => void): () => void {
        this.errorListeners.push(callback);
        return () => {
            const index = this.errorListeners.indexOf(callback);
            if (index > -1) {
                this.errorListeners.splice(index, 1);
            }
        };
    }

    /**
     * Cleanup all event listeners.
     */
    cleanup() {
        this.subscriptions.forEach(sub => sub.remove());
        this.subscriptions = [];
        this.frameListeners = [];
        this.stopListeners = [];
        this.errorListeners = [];
    }
}

export const screenCaptureService = new ScreenCaptureService();
export default ScreenCaptureService;
