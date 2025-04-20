import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Stream from '../models/stream.models.js';
import User from '../models/user.models.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', process.env.CORS_ORIGIN],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    const receiverSocketId = getReceiverSocketId(receiver?._id);
    try {
      socket.to(receiverSocketId).emit('new-vc-room', { remotePeerId: myPeerId, receiver });
    } catch (error) {
      console.log('Receiver is not online')
    }
  });

  socket.on('join-vc-room', ({ receiver, myPeerId }) => {
    const receiverSocketId = getReceiverSocketId(receiver?._id);
    socket.to(receiverSocketId).emit('joined-vc-room', { remotePeerId: myPeerId });
  });

  socket.on('leave-vc-room', ( receiver) => {
    try {
      const receiverSocketId = getReceiverSocketId(receiver?._id);
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

  socket.on('join-stream', async ({ userId, streamUrl, spaceId }) => {
    console.log(`${userId} joining the stream of space ${spaceId}`);
  
    try {
      const stream = await Stream.findOne({ spaceId: spaceId });
  
      if (stream) {
        const viewerIndex = stream.viewers.findIndex(viewer => viewer.user.toString() === userId);
  
        if (viewerIndex === -1) {

          const user = await User.findById(userId);

          await Stream.updateOne(
            { spaceId: spaceId },
            {
              $push: {
                viewers: {
                  user: userId,
                  fullName: user.fullName,
                  joinedAt: [ new Date() ]
                }
              }
            }
          );
        } else {
          await Stream.updateOne(
            { spaceId: spaceId, 'viewers.user': userId },
            {
              $push: {
                'viewers.$.joinedAt': [ new Date() ]
              }
            }
          );
        }
  
        io.to(spaceId.toString()).emit('joined-stream', { userId, streamUrl, spaceId });
      }
    } catch (error) {
      console.error('Error in join-stream:', error);
      socket.emit('error', { message: 'Failed to join stream' });
    }
  });
  

  socket.on('leave-stream', async ({ userId, streamUrl, spaceId, numOfusers }) => {
    console.log(`${userId} leaving the stream of space ${spaceId}`);
  
    try {
      const stream = await Stream.findOne({ spaceId: spaceId });
  
      if (stream) {
        const viewer = stream.viewers.find(viewer => viewer.user.toString() === userId);
  
        if (viewer) {
          await Stream.updateOne(
            { spaceId: spaceId, 'viewers.user': userId },
            {
              $push: {
                'viewers.$.leftAt': [ new Date() ]
              }
            },
          );
        }
  
        if (numOfusers === 1) {
          io.to(spaceId.toString()).emit('stream-ended', { spaceId });
        } else {
          io.to(spaceId.toString()).emit('left-stream', { userId, streamUrl, spaceId });
        }
      }
    } catch (error) {
      console.error('Error in leave-stream:', error);
      socket.emit('error', { message: 'Failed to leave stream properly' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.data.userId) delete userSocketMap[socket.data.userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };