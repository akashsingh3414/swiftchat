import { create } from "zustand"

export const useSpaceStreamStore = create((set, get)=>({

    inVideoStream: false,
    currentStream: null,
    usersInCurrentStream: [],

    startStream: async () => {
        //to send signal to user or all users in spaces
        //if all n users of space click on this separately then n stream will be created separately
        set({ inVideoStream: true });
    },

    fetchStreams: () => {
        //to get list of all live streams in a space
    },

    fetchUsersInStream: () => {
        //fetch all users watching this stream
    },

    joinStream: () => {
        //to join a particular stream
    },

    leaveStream: () => {
        //to leave a particular stream
    },

    stopStream: () => {
        //to stop a stream which current user has started
    },

}))