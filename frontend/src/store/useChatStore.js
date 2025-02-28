import { create } from "zustand";
import { toast } from "sonner";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data.users });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newMessage = res.data.message;

      set({ messages: [...messages, newMessage] });

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  addConnection: async (connectionCode) => {
    try {
      const res = await axiosInstance.get(`/user/connect/${connectionCode}`)
      set({users: [...get().users, res.data.user]})
      toast.success(`${res.data.user.fullName} added to your connections`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  removeConnection: async (connectionCode) => {
    try {
      await axiosInstance.patch('/user/remove-connection', {connectionCode})
      set((state)=>({
        users: state.users.filter(user=>user.connectionCode!=connectionCode),
        selectedUser: null
      }))
      toast.success(`User removed from your connections`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  deleteMyMessages: async (receiverId) => {
    try {
      await axiosInstance.post('/message/delete', {receiverId})
      set((state) => ({
        messages: state.messages.filter(message => message.receiverId !== receiverId)
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      
      if (!isMessageSentFromSelectedUser) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));