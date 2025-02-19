import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import Peer from 'peerjs';

export const useVideoStore = create((set, get) => ({
  roomId: null,
  isInCall: false,
  peer: null,
  myPeerId: null,
  remotePeerId: null,
  localStream: null,
  remoteStream: null,

  initPeer: async () => {
    return new Promise((resolve, reject) => {
      const peer = new Peer(undefined, { host: 'localhost', port: 3000, path: '/peerjs' });
      set({ peer });

      peer.on('open', (id) => {
        set({ myPeerId: id });
        resolve(peer);
      });

      peer.on('call', async (call) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          set({ localStream: stream });
          call.answer(stream);

          call.on('stream', (remoteStream) => set({ remoteStream }));
          call.on('close', () => console.info('Call closed by remote peer'));
          call.on('error', (err) => console.error('Call error:', err));
        } catch (err) {
          console.error('Failed to access media devices:', err);
          toast.error('Failed to access media devices.');
        }
      });
    });
  },

  createRoom: async (receiver) => {
    const { myPeerId, roomId: existingRoomId } = get();
    if (!myPeerId) {
      toast.error('Peer ID not initialized.');
      return null;
    }
  
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error('Socket not found. Ensure you are connected.');
      toast.error('Socket connection issue.');
      return null;
    }
  
    const roomId = existingRoomId || uuid();
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
      set({ localStream: stream, roomId, isInCall: true });
  
      socket.emit('create-vc-room', { roomId, receiver, myPeerId }); 
      get().listenForDisconnection(); 
      return roomId;
    } catch (err) {
      console.error('Error while initializing video stream:', err);
      toast.error('Could not access camera or microphone.');
      return null;
    }
  },
  
  listenForNewRoom: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error('Socket not initialized.');
      return;
    }
  
    socket.off('new-vc-room'); 
  
    socket.on('new-vc-room', ({ roomId, remotePeerId, receiver }) => {
      console.log('Received new-vc-room event:', { roomId, remotePeerId });
          
      toast.info(`${receiver.fullName} wants to connect you over video call`);

      set({ roomId, isInCall: true, remotePeerId });
    });
  },

  joinRoom: (roomId, receiver) => {
    const { myPeerId } = get();

    if (!roomId || !myPeerId) {
      toast.error('Missing room ID or Peer ID.');
      return;
    }

    const socket = useAuthStore.getState().socket;
    socket.emit('join-vc-room', { roomId, receiver, myPeerId });
    get().listenForDisconnection();
    set({ roomId, isInCall: true });
  },

  listenForUserJoined: () => {
    const socket = useAuthStore.getState().socket;
    const { peer, localStream } = get();
  
    socket.off('joined-vc-room');
    socket.on('joined-vc-room', ({ roomId, remotePeerId }) => {
      set({ roomId, remotePeerId, isInCall: true });
    });
  
    const {remotePeerId} = get();
  
    if(peer && remotePeerId) {
      const call = peer.call(remotePeerId, localStream);
      if (call) {
        call.on('stream', (remoteStream) => set({ remoteStream }));
        call.on('close', () => console.info('Call closed'));
        call.on('error', (err) => console.error('Call error:', err));
      }
    }
  },

  disconnectCall: (receiver) => {
    const { roomId, peer, localStream } = get();
    const socket = useAuthStore.getState().socket;
  
    if (!roomId) return;
  
    socket.emit('leave-vc-room', roomId, receiver);
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  
    if (peer) {
      peer.destroy();
    }
  
    set({
      roomId: null,
      isInCall: false,
      remotePeerId: null,
      localStream: null,
      remoteStream: null,
      myPeerId: null,
      peer: null,
    });
  },

  listenForDisconnection: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
  
    socket.off('user-disconnected');
    socket.on('user-disconnected', (receiver) => {
      const { localStream, peer } = get();
      
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
  
      if (peer) {
        peer.destroy();
      }
  
      set({
        roomId: null,
        isInCall: false,
        remotePeerId: null,
        localStream: null,
        remoteStream: null,
        myPeerId: null,
        peer: null,
      });
  
      toast.error(`call ended by ${receiver.fullName}`);
    });
  },

  joinSpace: (spaceId) => {
    if (!spaceId) {
      toast.error('Space ID is required.');
      return;
    }

    const socket = useAuthStore.getState().socket;
    socket.emit('joinSpace', spaceId);
  },

}));
