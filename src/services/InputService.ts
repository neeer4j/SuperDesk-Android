// Input service for translating touch gestures to mouse/keyboard events
import { webRTCService } from './WebRTCService';

export interface TouchPosition {
    x: number;
    y: number;
}

export interface InputEvent {
    type: 'mouse' | 'keyboard' | 'touch';
    action: string;
    data: any;
}

class InputService {
    private lastPosition: TouchPosition | null = null;
    private screenWidth: number = 1920;
    private screenHeight: number = 1080;
    private viewWidth: number = 0;
    private viewHeight: number = 0;

    // Set the remote screen dimensions
    setRemoteScreenSize(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    // Set the local view dimensions
    setViewSize(width: number, height: number) {
        this.viewWidth = width;
        this.viewHeight = height;
    }

    // Convert touch coordinates to remote screen coordinates
    private translateCoordinates(x: number, y: number): TouchPosition {
        const scaleX = this.screenWidth / this.viewWidth;
        const scaleY = this.screenHeight / this.viewHeight;

        return {
            x: Math.round(x * scaleX),
            y: Math.round(y * scaleY),
        };
    }

    // Handle touch start (mouse down)
    onTouchStart(x: number, y: number) {
        const pos = this.translateCoordinates(x, y);
        this.lastPosition = pos;

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'move',
            data: { x: pos.x, y: pos.y },
        });
    }

    // Handle touch move (mouse move)
    onTouchMove(x: number, y: number) {
        const pos = this.translateCoordinates(x, y);
        this.lastPosition = pos;

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'move',
            data: { x: pos.x, y: pos.y },
        });
    }

    // Handle touch end (mouse click)
    onTouchEnd() {
        if (this.lastPosition) {
            webRTCService.sendInputEvent({
                type: 'mouse',
                action: 'click',
                data: {
                    x: this.lastPosition.x,
                    y: this.lastPosition.y,
                    button: 'left',
                },
            });
        }
    }

    // Handle single tap (left click)
    onTap(x: number, y: number) {
        const pos = this.translateCoordinates(x, y);

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'click',
            data: { x: pos.x, y: pos.y, button: 'left' },
        });
    }

    // Handle double tap (double click)
    onDoubleTap(x: number, y: number) {
        const pos = this.translateCoordinates(x, y);

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'doubleClick',
            data: { x: pos.x, y: pos.y },
        });
    }

    // Handle long press (right click)
    onLongPress(x: number, y: number) {
        const pos = this.translateCoordinates(x, y);

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'click',
            data: { x: pos.x, y: pos.y, button: 'right' },
        });
    }

    // Handle pinch zoom (scroll)
    onPinch(scale: number, centerX: number, centerY: number) {
        const pos = this.translateCoordinates(centerX, centerY);
        const scrollAmount = scale > 1 ? -100 : 100; // Zoom in = scroll up

        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'scroll',
            data: { x: pos.x, y: pos.y, deltaY: scrollAmount },
        });
    }

    // Handle two-finger pan (scroll)
    onTwoFingerPan(deltaX: number, deltaY: number) {
        webRTCService.sendInputEvent({
            type: 'mouse',
            action: 'scroll',
            data: { deltaX: -deltaX, deltaY: -deltaY },
        });
    }

    // Send keyboard input
    sendKeyPress(key: string, modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }) {
        webRTCService.sendInputEvent({
            type: 'keyboard',
            action: 'press',
            data: { key, ...modifiers },
        });
    }

    // Send text input
    sendText(text: string) {
        webRTCService.sendInputEvent({
            type: 'keyboard',
            action: 'type',
            data: { text },
        });
    }

    // Send special keys
    sendSpecialKey(key: 'escape' | 'enter' | 'tab' | 'backspace' | 'delete' | 'home' | 'end' | 'pageup' | 'pagedown' | 'up' | 'down' | 'left' | 'right') {
        webRTCService.sendInputEvent({
            type: 'keyboard',
            action: 'special',
            data: { key },
        });
    }
}

export const inputService = new InputService();
export default InputService;
