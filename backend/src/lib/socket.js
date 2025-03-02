import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
});

const userSocketMap = {};
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.data.userId = userId;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('create-vc-room', ({ receiver, myPeerId }) => {
    const receiverSocketId = getReceiverSocketId(receiver._id);
    try {
      socket.to(receiverSocketId).emit('new-vc-room', { remotePeerId: myPeerId, receiver });
    } catch (error) {
      console.log('Receiver is not online')
    }
  });

  socket.on('join-vc-room', ({ receiver, myPeerId }) => {
    const receiverSocketId = getReceiverSocketId(receiver._id);
    socket.to(receiverSocketId).emit('joined-vc-room', { remotePeerId: myPeerId });
  });

  socket.on('leave-vc-room', ( receiver) => {
    try {
      const receiverSocketId = getReceiverSocketId(receiver._id);
      socket.to(receiverSocketId).emit('user-disconnected', receiver);
    } catch (error) {
      console.error('Error in leave-vc-room:', error);
    }
  });

  socket.on('joinSpace', (spaceId) => {
    if (!spaceId) {
      console.log('Invalid space ID.');
      return;
    }
    socket.join(spaceId.toString());
    console.log(`User ${socket.id} joined space ${spaceId}`);
  });

  socket.on('join-stream', ({userId, streamUrl, spaceId}) => {
    console.log(`${userId} joining the stream of space ${spaceId}`)
    io.to(spaceId.toString()).emit('joined-stream', { userId, streamUrl, spaceId });
  });

  socket.on('leave-stream', ({userId, streamUrl, spaceId, numOfusers}) => {
    console.log(`${userId} leaving the stream of space ${spaceId}`)
    if(numOfusers===1) {
      io.to(spaceId).emit('stream-ended', {spaceId});
    } else 
    io.to(spaceId.toString()).emit('left-stream', { userId, streamUrl, spaceId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.data.userId) delete userSocketMap[socket.data.userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };