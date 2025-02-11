import { create } from "zustand";
import { toast } from "sonner";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useSpaceStore = create((set, get) => ({
  spaces: [],
  selectedSpace: null,
  messages: [],
  isSpacesLoading: false,
  isMessagesLoading: false,

  getSpaces: async () => {
    set({ isSpacesLoading: true });
    try {
      const res = await axiosInstance.get("/space/spaces");
      set({ spaces: res.data.spaces });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      set({ isSpacesLoading: false });
    }
  },

  createSpaces: async (spaceData) => {
    try {
      const res = await axiosInstance.post("/spaces/create", spaceData);
      set({ spaces: [...get().spaces, res.data.space] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  },

  leaveSpaces: async (spaceCode) => {
    try {
      await axiosInstance.patch("/spaces/leave", { spaceCode });
      set({ spaces: get().spaces.filter((space) => space.code !== spaceCode) });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  },

  getMessagesFromSpace: async (spaceId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/space/message/${spaceId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
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
      console.log('here')
      toast.error(error?.response?.data?.message || error.message);
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
}
}));
