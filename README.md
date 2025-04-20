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

## 📊 Video Stream Logs
* **Location:** Accessible via host dashboard.
* **Data Includes:**
   * Username / user ID
   * Join timestamp
   * Leave timestamp
* **Actions Available to Host:**
   * View all current/past viewers
   * Delete individual user log entries
