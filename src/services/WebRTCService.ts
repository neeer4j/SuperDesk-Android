// WebRTC service for peer-to-peer connections
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    MediaStream,
} from 'react-native-webrtc';
import { socketService } from './SocketService';

// Server URL for fetching WebRTC config
const SERVER_URL = 'https://superdesk-7m7f.onrender.com';

// ICE server type
interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}

// Fallback ICE servers (same as PC app)
const FALLBACK_ICE_SERVERS: IceServer[] = [
    // Google STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // OpenRelay TURN servers (Free public TURN)
    {
        urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:80?transport=tcp'],
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
    // Numb TURN servers
    {
        urls: ['turn:numb.viagenie.ca', 'turn:numb.viagenie.ca:3478'],
        username: 'webrtc@live.com',
        credential: 'muazkh',
    },
];

// Fetch TURN/STUN configuration from server (like PC app does)
async function fetchWebRTCConfig(): Promise<IceServer[]> {
    try {
        console.log('🔧 Fetching WebRTC config from server...');
        const response = await fetch(`${SERVER_URL}/api/webrtc-config`);

        if (!response.ok) {
            console.warn('⚠️ Failed to fetch WebRTC config, using fallback TURN servers');
            return FALLBACK_ICE_SERVERS;
        }

        const config = await response.json();
        console.log('✅ Received WebRTC config from server');

        if (config.iceServers && config.iceServers.length > 0) {
            console.log('🎯 Using server TURN servers:', config.iceServers.length, 'servers');
            return config.iceServers;
        } else {
            console.warn('⚠️ Server returned empty ICE servers, using fallback');
            return FALLBACK_ICE_SERVERS;
        }
    } catch (error) {
        console.error('❌ Error fetching WebRTC config:', error);
        console.log('🔄 Using fallback TURN servers');
        return FALLBACK_ICE_SERVERS;
    }
}

export type ConnectionRole = 'host' | 'viewer';

// RTCDataChannel type definition for react-native-webrtc
interface RTCDataChannelEvent {
    channel: RTCDataChannel;
}

interface RTCDataChannel {
    label: string;
    readyState: 'connecting' | 'open' | 'closing' | 'closed';
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onerror: ((event: any) => void) | null;
    send: (data: string) => void;
    close: () => void;
}

interface RTCTrackEvent {
    streams: MediaStream[];
    track: any;
}

interface RTCIceCandidateEvent {
    candidate: RTCIceCandidate | null;
}

class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private dataChannel: RTCDataChannel | null = null;
    private sessionId: string | null = null;
    private role: ConnectionRole = 'viewer';

    // Callbacks
    private onRemoteStreamCallback?: (stream: MediaStream) => void;
    private onDataChannelMessageCallback?: (message: string) => void;
    private onConnectionStateChangeCallback?: (state: string) => void;

    async initialize(role: ConnectionRole, sessionId?: string): Promise<void> {
        this.role = role;
        this.sessionId = sessionId || null;

        // Fetch TURN/STUN config from server (like PC app)
        const iceServers = await fetchWebRTCConfig();

        // Create peer connection with fetched config
        this.peerConnection = new RTCPeerConnection({ iceServers } as any);

        // Handle ICE candidates
        (this.peerConnection as any).onicecandidate = (event: RTCIceCandidateEvent) => {
            if (event.candidate && this.sessionId) {
                socketService.sendIceCandidate(this.sessionId, event.candidate.toJSON());
            }
        };

        // Handle remote stream
        (this.peerConnection as any).ontrack = (event: RTCTrackEvent) => {
            console.log('📱 Received remote track');
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                if (this.remoteStream) {
                    this.onRemoteStreamCallback?.(this.remoteStream);
                }
            }
        };

        // Handle connection state changes
        (this.peerConnection as any).onconnectionstatechange = () => {
            const state = (this.peerConnection as any)?.connectionState || 'unknown';
            console.log('📱 Connection state:', state);
            this.onConnectionStateChangeCallback?.(state);
        };

        // Set up data channel for input events (mouse/keyboard)
        if (role === 'host') {
            this.setupDataChannel();
        } else {
            (this.peerConnection as any).ondatachannel = (event: RTCDataChannelEvent) => {
                this.dataChannel = event.channel;
                this.setupDataChannelHandlers();
            };
        }

        // Set up signaling handlers
        this.setupSignalingHandlers();
    }

    private setupDataChannel() {
        if (!this.peerConnection) return;

        this.dataChannel = (this.peerConnection as any).createDataChannel('input', {
            ordered: true,
        });
        this.setupDataChannelHandlers();
    }

    private setupDataChannelHandlers() {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            console.log('📱 Data channel opened');
        };

        this.dataChannel.onmessage = (event: { data: string }) => {
            console.log('📱 Data channel message:', event.data);
            this.onDataChannelMessageCallback?.(event.data);
        };

        this.dataChannel.onclose = () => {
            console.log('📱 Data channel closed');
        };
    }

    private setupSignalingHandlers() {
        // Handle incoming offer (as viewer)
        socketService.onOffer(async (offer, _from) => {
            if (!this.peerConnection) return;

            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer as any)
            );

            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            if (this.sessionId) {
                socketService.sendAnswer(this.sessionId, answer);
            }
        });

        // Handle incoming answer (as host)
        socketService.onAnswer(async (answer) => {
            if (!this.peerConnection) return;
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer as any)
            );
        });

        // Handle incoming ICE candidates
        socketService.onIceCandidate(async (candidate) => {
            if (!this.peerConnection) return;
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('❌ Error adding ICE candidate:', error);
            }
        });
    }

    // Create and send offer (as host)
    async createOffer(): Promise<void> {
        if (!this.peerConnection || !this.sessionId) return;

        const offer = await this.peerConnection.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
        } as any);

        await this.peerConnection.setLocalDescription(offer);
        socketService.sendOffer(this.sessionId, offer);
    }

    // Add local stream (for screen sharing as host)
    addStream(stream: MediaStream) {
        this.localStream = stream;
        stream.getTracks().forEach((track) => {
            this.peerConnection?.addTrack(track, stream);
        });
    }

    // Send input event through data channel
    sendInputEvent(event: {
        type: 'mouse' | 'keyboard' | 'touch';
        action: string;
        data: any;
    }) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(event));
        }
    }

    // Event handlers
    onRemoteStream(callback: (stream: MediaStream) => void) {
        this.onRemoteStreamCallback = callback;
    }

    onDataChannelMessage(callback: (message: string) => void) {
        this.onDataChannelMessageCallback = callback;
    }

    onConnectionStateChange(callback: (state: string) => void) {
        this.onConnectionStateChangeCallback = callback;
    }

    // Get remote stream
    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    // Get connection state
    getConnectionState(): string {
        return (this.peerConnection as any)?.connectionState || 'disconnected';
    }

    // Cleanup
    close() {
        this.dataChannel?.close();
        this.localStream?.getTracks().forEach((track) => track.stop());
        this.peerConnection?.close();

        this.dataChannel = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.sessionId = null;
    }
}

export const webRTCService = new WebRTCService();
export default WebRTCService;
