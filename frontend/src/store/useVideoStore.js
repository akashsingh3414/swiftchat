import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';
import Peer from 'peerjs';

export const useVideoStore = create((set, get) => ({
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
    const { myPeerId } = get();
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
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
      set({ localStream: stream, isInCall: true });
  
      socket.emit('create-vc-room', { receiver, myPeerId }); 
      get().listenForDisconnection(); 
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
  
    socket.on('new-vc-room', ({ remotePeerId, receiver }) => {

      toast.info(`${receiver.fullName} wants to connect you over video call`);

      set({ isInCall: true, remotePeerId });
    });
  },

  joinRoom: (receiver) => {
    const { myPeerId } = get();

    if (!myPeerId) {
      toast.error('Missing Peer ID.');
      return;
    }

    const socket = useAuthStore.getState().socket;
    socket.emit('join-vc-room', { receiver, myPeerId });
    get().listenForDisconnection();
    set({ isInCall: true });
  },

  listenForUserJoined: () => {
    const socket = useAuthStore.getState().socket;
    const { peer, localStream } = get();
  
    socket.off('joined-vc-room');
    socket.on('joined-vc-room', ({ remotePeerId }) => {
      set({ remotePeerId, isInCall: true });
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
    const { peer, localStream } = get();
    const socket = useAuthStore.getState().socket;
  
    socket.emit('leave-vc-room', receiver);
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  
    if (peer) {
      peer.destroy();
    }
  
    set({
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
