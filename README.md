# SuperDesk Mobile

A React Native mobile client for [SuperDesk](https://github.com/neeer4j/SuperDesk) - the remote desktop access software.

## 📱 Features

- **View & Control PC** - Connect to your PC running SuperDesk Agent and control it from your phone
- **Host Phone Screen** - Share your Android screen to be viewed/controlled from a PC (coming soon)
- **Touch Gestures** - Intuitive gesture controls:
  - Single tap = Left click
  - Double tap = Double click
  - Long press = Right click
  - Drag = Mouse movement
  - Two-finger scroll = Scroll
- **Secure Connection** - WebRTC P2P with DTLS-SRTP encryption

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Android Studio (for Android development)
- JDK 17
- An Android device or emulator

### Installation

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (in a separate terminal)
npm run android
```

## 📁 Project Structure

```
SuperDeskMobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Session join/host
│   │   ├── RemoteScreen.tsx    # View/control PC
│   │   └── SessionScreen.tsx   # Host mode
│   ├── services/
│   │   ├── SocketService.ts    # Signaling server connection
│   │   ├── WebRTCService.ts    # P2P video/data streaming
│   │   └── InputService.ts     # Touch-to-mouse translation
│   └── navigation/
│       └── Navigation.tsx      # React Navigation setup
└── android/                    # Android native code
```

## 🎮 How to Use

### Control PC from Phone

1. Start **SuperDesk Agent** on your Windows PC
2. Host a session and note the 8-character code
3. Open **SuperDesk Mobile** on your phone
4. Enter the session code and tap **Connect**
5. Use touch gestures to control your PC!

### Share Phone Screen (Coming Soon)

1. Open **SuperDesk Mobile** on your phone
2. Tap **Start Hosting**
3. Share the session code with your PC
4. Open SuperDesk web client on PC and enter the code

## 🔧 Configuration

The app connects to the SuperDesk signaling server by default. To change the server URL, modify `src/services/SocketService.ts`:

```typescript
const DEFAULT_SERVER_URL = 'https://your-server-url.com';
```

## 📄 License

GPL-3.0 - See [LICENSE](../LICENSE)

---

Built with ❤️ using React Native & WebRTC
