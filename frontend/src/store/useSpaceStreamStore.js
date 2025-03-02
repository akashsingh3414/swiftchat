import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

export const useSpaceStreamStore = create((set, get) => ({
    inVideoStream: false,
    currentStreamUrl: null,
    usersInCurrentStream: [],
    hostId: null,
    allStreams: {},

    startStream: async (userId, uploadedVideo, spaceId) => {
        console.log("Uploading video for streaming");
        try {
            if (!uploadedVideo) {
                console.error("No video file provided");
                return;
            }

            const formData = new FormData();
            formData.append("file", uploadedVideo);
            formData.append("receiverId", spaceId);

            const res = await axiosInstance.post('/stream/start-stream', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(res);

            const streamUrl = res.data.streamUrl;

            set((state) => ({
                inVideoStream: true,
                hostId: userId,
                currentStreamUrl: streamUrl,
                allStreams: {
                    ...state.allStreams,
                    [spaceId]: streamUrl,
                },
            }));

        } catch (error) {
            console.error("Error starting stream:", error);
        }
    },

    fetchStreams: () => {
        const socket = useAuthStore.getState().socket;
        console.log('Fetching streams');
    
        socket.off("new-stream");
        socket.off("stream-ended");
    
        socket.on("new-stream", ({ hostId, streamUrl, spaceId }) => {
            console.log('New stream event received');
            console.log(hostId)
            console.log(streamUrl)
            console.log(spaceId)
    
            set((state) => ({
                allStreams: {
                    ...state.allStreams,
                    [spaceId]: streamUrl,
                },
                currentStreamUrl: !state.inVideoStream || state.currentStreamUrl !== streamUrl ? streamUrl : state.currentStreamUrl,
            }));
        });
    
        socket.on("stream-ended", ({ spaceId }) => {
            console.log(spaceId)
            console.log('Stream ended');
            set((state) => {
                const updatedStreams = { ...state.allStreams };
                delete updatedStreams[spaceId];
    
                return {
                    allStreams: updatedStreams,
                    inVideoStream: state.currentStreamUrl === updatedStreams[spaceId] ? false : state.inVideoStream,
                    currentStreamUrl: state.currentStreamUrl === updatedStreams[spaceId] ? null : state.currentStreamUrl,
                };
            });
        });
    },    

    joinStream: (userId, streamUrl, spaceId) => {
        console.log("Joining stream");
        const socket = useAuthStore.getState().socket;
        socket.emit('join-stream', userId, streamUrl, spaceId);
        
        set(() => ({
            inVideoStream: true,
            currentStreamUrl: streamUrl
        }));
    },

    leaveStream: (userId, streamUrl, spaceId) => {
        const socket = useAuthStore.getState().socket;
        socket.emit('leave-stream', userId, streamUrl, spaceId);
        
        set((state) => ({
            inVideoStream: false,
            currentStreamUrl: state.hostId === userId ? state.currentStreamUrl : null,
        }));
    },

    stopStream: async (hostId, streamUrl, spaceId) => {
        console.log("Stopping stream");
        const socket = useAuthStore.getState().socket;
        await axiosInstance.delete('/stream/delete-stream', { data: { hostId, streamUrl, spaceId } });
        socket.emit('stream-stopped', hostId, streamUrl, spaceId);

        set((state) => {
            const updatedStreams = { ...state.allStreams };
            delete updatedStreams[spaceId];

            return {
                hostId: null,
                inVideoStream: false,
                currentStreamUrl: null,
                allStreams: updatedStreams,
            };
        });
    },
}));
