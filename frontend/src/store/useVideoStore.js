import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

export const useVideoStore = create((set, get) => ({
    roomId: null,
    isInCall: false,

    createRoom: (receiver) => {
        try {
            const socket = useAuthStore.getState().socket;
            let roomId = get().roomId;

            if (roomId) return roomId;

            roomId = uuid();

            socket.emit("create-vc-room", roomId, receiver);
            set({ roomId, isInCall: true });
            console.log("Created Room:", roomId);
            return roomId;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    },

    listenForNewRoom: () => {
        const socket = useAuthStore.getState().socket;

        socket.off('new-vc-room');
        socket.on('new-vc-room', (roomId) => {
            set({ roomId, isInCall: true });
            console.log('New Room Created:', roomId);
        });
    },

    joinRoom: (roomId, caller) => {
        try {
            const socket = useAuthStore.getState().socket;
            if (!roomId) return;

            socket.emit("join-vc-room", roomId, caller);
            if (!get().roomId) {
                set({ roomId, isInCall: true });
            }

            console.log('Joined Room:', roomId);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    },

    listenForUserJoined: () => {
        const socket = useAuthStore.getState().socket;

        socket.off('joined-vc-room');
        socket.on('joined-vc-room', (roomId) => {
            set({ roomId, isInCall: true });
            console.log('User Joined:', roomId);
        });
    },

    disconnectCall: () => {
        try {
            const socket = useAuthStore.getState().socket;
            const roomId = get().roomId;

            if (!roomId) return;

            socket.emit("leave-vc-room", roomId);

            set({ roomId: null, isInCall: false });

            console.log("Disconnected from Room:", roomId);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    },
}));
