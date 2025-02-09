import {Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express();
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true,
    }
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
} 

const userSocketMap = {} //{userId: socketId}


io.on('connection', (socket) => {
    console.log('a user connected: ', socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap)) //used to send events to all connected clients

    socket.on('joinGroup', (spaceId) => {
        socket.join(spaceId.toString());
        console.log(`User $userId joined group ${spaceId}`);
    });

    socket.on('leaveGroup', (spaceId) => {
        socket.leave(spaceId.toString());
        console.log(`User $userId left group ${spaceId}`);
    });

    socket.on('disconnect', ()=> {
        console.log('a user disconnected: ', socket.id);
        delete userSocketMap[userId];

        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
})



export {io, app, server};