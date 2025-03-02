import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

export const useSpaceStreamStore = create((set, get) => ({
    inVideoStream: false,
    currentStreamUrl: null,
    usersInCurrentStream: {}, // Format: { spaceId: [userId1, userId2, ...] }
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
                usersInCurrentStream: {
                    ...state.usersInCurrentStream,
                    [spaceId]: [userId],
                }
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
        socket.off("join-stream");
        socket.off("leave-stream");
    
        socket.on("new-stream", ({ hostId, streamUrl, spaceId }) => {
            console.log('New stream event received');
            console.log(hostId);
            console.log(streamUrl);
            console.log(spaceId);
    
            set((state) => ({
                allStreams: {
                    ...state.allStreams,
                    [spaceId]: streamUrl,
                },
                currentStreamUrl: !state.inVideoStream || state.currentStreamUrl !== streamUrl ? streamUrl : state.currentStreamUrl,
                usersInCurrentStream: {
                    ...state.usersInCurrentStream,
                    [spaceId]: [hostId]
                }
            }));
        });
    
        socket.on("stream-ended", ({ spaceId }) => {
            console.log(spaceId);
            console.log('Stream ended');
            set((state) => {
                const updatedStreams = { ...state.allStreams };
                const streamUrl = updatedStreams[spaceId];
                delete updatedStreams[spaceId];
                
                const updatedViewers = { ...state.usersInCurrentStream };
                delete updatedViewers[spaceId];
    
                return {
                    allStreams: updatedStreams,
                    inVideoStream: state.currentStreamUrl === streamUrl ? false : state.inVideoStream,
                    currentStreamUrl: state.currentStreamUrl === streamUrl ? null : state.currentStreamUrl,
                    usersInCurrentStream: updatedViewers
                };
            });
        });
        
        socket.on("joined-stream", ({ userId, streamUrl, spaceId }) => {
            console.log(`User ${userId} joined stream in space ${spaceId}`);
            
            set((state) => {
                const updatedViewers = { ...state.usersInCurrentStream };
                
                if (!updatedViewers[spaceId]) {
                    updatedViewers[spaceId] = [];
                }
                
                if (!updatedViewers[spaceId].includes(userId)) {
                    updatedViewers[spaceId] = [
                        ...updatedViewers[spaceId],
                        userId
                    ];
                }
                
                return {
                    usersInCurrentStream: updatedViewers
                };
            });
        });
        
        socket.on("left-stream", ({ userId, streamUrl, spaceId }) => {
            console.log(`User ${userId} left stream in space ${spaceId}`);
            
            set((state) => {
                const updatedViewers = { ...state.usersInCurrentStream };
                
                if (updatedViewers[spaceId]) {
                    updatedViewers[spaceId] = updatedViewers[spaceId]
                        .filter(id => id !== userId);
                    
                    if (updatedViewers[spaceId].length === 0) {
                        delete updatedViewers[spaceId];
                    }
                }
                
                return {
                    usersInCurrentStream: updatedViewers
                };
            });
        });
    },    

    joinStream: (userId, streamUrl, spaceId) => {
        console.log("Joining stream");
        const socket = useAuthStore.getState().socket;
        
        socket.emit('join-stream', { userId, streamUrl, spaceId });
        
        set((state) => {
            const updatedViewers = { ...state.usersInCurrentStream };
            
            if (!updatedViewers[spaceId]) {
                updatedViewers[spaceId] = [];
            }
            
            if (!updatedViewers[spaceId].includes(userId)) {
                updatedViewers[spaceId] = [
                    ...updatedViewers[spaceId],
                    userId
                ];
            }
            
            return {
                inVideoStream: true,
                currentStreamUrl: streamUrl,
                usersInCurrentStream: updatedViewers
            };
        });
    },

    leaveStream: (userId, streamUrl, spaceId, usersInCurrentStream) => {
        console.log("Leaving stream");
        const socket = useAuthStore.getState().socket;
        
        socket.emit('leave-stream', { userId, streamUrl, spaceId, numOfusers: usersInCurrentStream[spaceId].length });
        
        set((state) => {
            const updatedViewers = { ...state.usersInCurrentStream };
            
            if (updatedViewers[spaceId]) {
                updatedViewers[spaceId] = updatedViewers[spaceId]
                    .filter(id => id !== userId);
                
                if (updatedViewers[spaceId].length === 0) {
                    delete updatedViewers[spaceId];
                }
            }
            
            return {
                inVideoStream: false,
                currentStreamUrl: state.hostId === userId ? state.currentStreamUrl : null,
                usersInCurrentStream: updatedViewers
            };
        });
    },

    stopStream: async (hostId, streamUrl, spaceId) => {
        console.log("Stopping stream");
        const socket = useAuthStore.getState().socket;
        await axiosInstance.delete('/stream/delete-stream', { data: { hostId, streamUrl, spaceId } });
        
        socket.emit('stream-stopped', { hostId, streamUrl, spaceId });

        set((state) => {
            const updatedStreams = { ...state.allStreams };
            delete updatedStreams[spaceId];
            
            const updatedViewers = { ...state.usersInCurrentStream };
            delete updatedViewers[spaceId];

            return {
                hostId: null,
                inVideoStream: false,
                currentStreamUrl: null,
                allStreams: updatedStreams,
                usersInCurrentStream: updatedViewers
            };
        });
    },
    
    getSpaceViewers: (spaceId) => {
        const state = get();
        return state.usersInCurrentStream[spaceId] || [];
    }
}));