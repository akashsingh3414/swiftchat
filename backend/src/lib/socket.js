import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true,
    }
});

const userSocketMap = {};
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        socket.data.userId = userId;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on("joinSpace", (spaceId) => {
        if (!spaceId) {
            console.log("Invalid space ID.");
            return;
        }

        socket.join(spaceId.toString());
        console.log(`User ${socket.id} joined space: ${spaceId}`);
    });

    socket.on('create-vc-room', (roomId, receiver) => {
        console.log(`Room created: ${roomId}`);
        socket.join(roomId);

        if (!receiver || !receiver._id) {
            console.log("Receiver ID is missing.");
            return;
        }

        const receiverSocketId = getReceiverSocketId(receiver._id);
        if (receiverSocketId) {
            console.log(`Notifying receiver (${receiver._id}) at socket: ${receiverSocketId}`);
            io.to(receiverSocketId).emit('new-vc-room', roomId);
        } else {
            console.log(`Receiver (${receiver._id}) is not online.`);
        }
    });

    socket.on("join-vc-room", (roomId, caller) => {
        socket.join(roomId);
        console.log(`User ${caller._id} joined the room: ${roomId}`);

        if (!caller || !caller._id) {
            console.log("Caller ID is missing.");
            return;
        }

        socket.to(roomId).emit('joined-vc-room', roomId);
    });

    socket.on('leave-vc-room', (roomId) => {
        console.log(`User ${socket.id} disconnected from room: ${roomId}`);
        socket.leave(roomId);

        socket.to(roomId).emit('user-disconnected', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (socket.data.userId) {
            delete userSocketMap[socket.data.userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { io, app, server };
