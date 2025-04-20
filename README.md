# SwiftChat

**SwiftChat** is a powerful, real-time social media communication platform built for seamless chatting, peer-to-peer video calling, and synchronized video streaming. Designed with performance and user experience in mind, SwiftChat combines secure communication protocols with advanced streaming features to deliver a dynamic social platform experience.

## Features

### Real-time Chat
* Instant 1:1 and group messaging.
* Real-time typing indicators and read receipts.
* Rich presence tracking to monitor user online/offline status.

### Secure Peer-to-Peer Video Calling
* One-on-one video calling implemented using **PeerJS** and **Socket.io**.
* Low-latency, encrypted communication channel for private video chats.
* Call signaling and connection management via WebSocket layer.

### Synchronized Video Streaming
* Host can stream a video to multiple users with dynamic **join/leave** support.
* Viewers see the video in sync with the host.
* Host receives a **viewer log** with join and leave timestamps.
* Hosts can **delete individual entries** from the viewer log.

### Real-Time Presence Tracking
* Tracks online status across the platform.
* Monitors availability and activity across both 1:1 and 1:n communication sessions.

## Tech Stack

| Technology | Usage |
|------------|-------|
| **Node.js** | Backend server & APIs |
| **Express.js** | HTTP server & routing |
| **Socket.io** | Real-time communication (chat, presence, signaling) |
| **PeerJS** | WebRTC abstraction for P2P video calls |
| **MongoDB** | User data, presence logs, message history, stream logs |
| **React.js** | Interactive frontend interface |

## Security
* Encrypted signaling and communication for video calls.
* Secure and authenticated WebSocket connections.
* Controlled access to stream logs (only host can view/delete entries).

## Getting Started

### Prerequisites
* Node.js (v14+)
* MongoDB or preferred database
* PeerJS server (can use public or self-host)

### Installation

```bash
git clone https://github.com/akashsingh3414/swiftchat.git
cd swiftchat
npm install
```

Set up `.env` with your config variables.

### Run Development Servers

```bash
# Start backend
cd backend
npm install
npm run dev

# Start frontend
cd ../frontend
npm install
npm run dev
```
## Future Improvements

- **Docker & CI/CD**: Containerization, Docker Compose, and automated deployment.
- **Kafka Integration**: Event-driven messaging for scalability and real-time processing.
- **Redis**: Caching, sessions, rate limiting, and real-time notifications.
- **Synchronized Watch**: Group viewing with shared controls and reactions.
- **Other Plans**: Message translation, encryption, AI moderation, screen sharing, and third-party integrations (e.g., Spotify, YouTube).

## Contribute to SwiftChat

SwiftChat is an evolving project, and there’s so much more on the horizon.  
Feel free to fork the repo, open issues, or submit pull requests — contributions of all kinds are welcome!
