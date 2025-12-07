// Socket.io service for signaling server connection
import { io, Socket } from 'socket.io-client';

// WebRTC types for signaling
interface RTCSessionDescriptionInit {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
}

interface RTCIceCandidateInit {
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
}

// Default to the SuperDesk server (same as PC app)
const DEFAULT_SERVER_URL = 'https://superdesk-7m7f.onrender.com';

class SocketService {
    private socket: Socket | null = null;
    private serverUrl: string = DEFAULT_SERVER_URL;

    // Event callbacks
    private onSessionCreatedCallback?: (sessionId: string) => void;
    private onSessionJoinedCallback?: (success: boolean) => void;
    private onOfferCallback?: (offer: RTCSessionDescriptionInit, from: string) => void;
    private onAnswerCallback?: (answer: RTCSessionDescriptionInit) => void;
    private onIceCandidateCallback?: (candidate: RTCIceCandidateInit) => void;
    private onPeerDisconnectedCallback?: () => void;

    connect(serverUrl?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serverUrl = serverUrl || DEFAULT_SERVER_URL;

            this.socket = io(this.serverUrl, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('📱 Connected to signaling server');
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Connection error:', error);
                reject(error);
            });

            this.setupEventListeners();
        });
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Session events
        this.socket.on('session-created', (sessionId: string) => {
            console.log('📱 Session created:', sessionId);
            this.onSessionCreatedCallback?.(sessionId);
        });

        this.socket.on('session-joined', (data: { success: boolean }) => {
            console.log('📱 Session joined:', data.success);
            this.onSessionJoinedCallback?.(data.success);
        });

        // WebRTC signaling events
        this.socket.on('offer', (data: { offer: RTCSessionDescriptionInit; from: string }) => {
            console.log('📱 Received offer from:', data.from);
            this.onOfferCallback?.(data.offer, data.from);
        });

        this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit }) => {
            console.log('📱 Received answer');
            this.onAnswerCallback?.(data.answer);
        });

        this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit }) => {
            console.log('📱 Received ICE candidate');
            this.onIceCandidateCallback?.(data.candidate);
        });

        this.socket.on('peer-disconnected', () => {
            console.log('📱 Peer disconnected');
            this.onPeerDisconnectedCallback?.();
        });
    }

    // Host a new session
    createSession() {
        this.socket?.emit('create-session');
    }

    // Join an existing session
    joinSession(sessionId: string) {
        this.socket?.emit('join-session', { sessionId });
    }

    // Send WebRTC offer
    sendOffer(sessionId: string, offer: RTCSessionDescriptionInit) {
        this.socket?.emit('offer', { sessionId, offer });
    }

    // Send WebRTC answer
    sendAnswer(sessionId: string, answer: RTCSessionDescriptionInit) {
        this.socket?.emit('answer', { sessionId, answer });
    }

    // Send ICE candidate
    sendIceCandidate(sessionId: string, candidate: RTCIceCandidateInit) {
        this.socket?.emit('ice-candidate', { sessionId, candidate });
    }

    // Event handlers
    onSessionCreated(callback: (sessionId: string) => void) {
        this.onSessionCreatedCallback = callback;
    }

    onSessionJoined(callback: (success: boolean) => void) {
        this.onSessionJoinedCallback = callback;
    }

    onOffer(callback: (offer: RTCSessionDescriptionInit, from: string) => void) {
        this.onOfferCallback = callback;
    }

    onAnswer(callback: (answer: RTCSessionDescriptionInit) => void) {
        this.onAnswerCallback = callback;
    }

    onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void) {
        this.onIceCandidateCallback = callback;
    }

    onPeerDisconnected(callback: () => void) {
        this.onPeerDisconnectedCallback = callback;
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const socketService = new SocketService();
export default SocketService;
