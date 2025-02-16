import { create } from "zustand";
import { toast } from "sonner";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useSpaceStore = create((set, get) => ({
  spaces: [],
  selectedSpace: null,
  messages: [],
  spaceWatchHistory: [],
  spaceMembers: [],
  isSpacesLoading: false,
  isMessagesLoading: false,

  getSpaces: async () => {
    set({ isSpacesLoading: true });
    try {
      const res = await axiosInstance.get("/space/spaces");
      set({ spaces: res.data.spaces });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isSpacesLoading: false });
    }
  },

  createSpace: async (spaceName) => {
    try {
      const res = await axiosInstance.post("/space/create", {spaceName} );
      set({ spaces: [...get().spaces, res.data.space] });
      toast.success(`Created ${res.data.space.name} successfully`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  joinSpace: async (spaceCode) => {
    try {
      const res = await axiosInstance.get(`/space/connect/${spaceCode}`)
      set({ spaces: [...get().spaces, res.data.space] });
      toast.success(`Joined ${res.data.space.name} successfully`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  leaveSpace: async (spaceCode) => {
      try {
        set((state)=>({
          spaces: state.spaces.filter(space=>space.spaceCode!=spaceCode),
          selectedSpace: null
        }));

        await axiosInstance.patch('/space/leave', { spaceCode });

      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
  },
  
  deleteSpace: async (spaceId) => {
    try {
      await axiosInstance.delete("/space/delete", { data: { spaceId } });

      set((state)=>({
        spaces: state.spaces.filter(space=>space._id!=spaceId),
        selectedSpace: null
      }));

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  getMessagesFromSpace: async (spaceId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/space/message/${spaceId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessageToSpace: async (messageData) => {
    const { selectedSpace, messages } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedSpace) return;
    try {
      socket.emit("sendGroupMessage", {
        spaceId: selectedSpace._id,
        ...messageData,
      });

      const res = await axiosInstance.post(`/message/send/${selectedSpace._id}`, messageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });      
    
      set({ messages: [...messages, res.data.message] });

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },
  
  getMembersForSpace: async (spaceId) => {
    const {selectedSpace} = get();

    if(!selectedSpace) return ;
    try {
      const res = await axiosInstance.get(`/space/getMembers/${spaceId}`)
      set({
        spaceMembers: res.data.members
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  getSpaceWatchHistory: async (spaceId) => {
    try {
      const res = await axiosInstance.post('/space/watch-history', {spaceId})
      set({
        spaceWatchHistory: res.data.watchHistory
      })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  toggleJoining: async (data) => {
    try {
      await axiosInstance.post('/space/modify-invite', {spaceId: data.spaceId, change: data.change})
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  deleteAllSpaceMessages: async (receiverId) => {
    try {
      const res = await axiosInstance.delete('space//message/delete-all', {data: {receiverId}})
      if(res.status == 200) {
        set({
          messages: []
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  subscribeToSpaceMessages: () => {
    const { selectedSpace } = get()
    if(!selectedSpace) return;

    const socket = useAuthStore.getState().socket;
    
    socket.on('newGroupMessage', (newMessage) => {
      const isMessageSentFromSelectedSpace = newMessage.receiverId === selectedSpace._id;
      if(!isMessageSentFromSelectedSpace) return;

      set({
        messages: [...get().messages, newMessage]
      });
    });
  },

  unsubscribeFromSpaceMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off(`newGroupMessage`);
  },

  setSelectedSpace: (selectedSpace) => {
    set({ selectedSpace });
    if (selectedSpace) {
      get().getMessagesFromSpace(selectedSpace._id);

      const socket = useAuthStore.getState().socket;
      socket.emit("joinSpace", selectedSpace._id);
    }
  },
  
}));
