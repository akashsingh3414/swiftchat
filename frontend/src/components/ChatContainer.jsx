import { useChatStore } from "../store/useChatStore";
import { useSpaceStore } from "../store/useSpaceStore";
import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils"; 
import ChatHeader from "./ChatHeader";
import { useVideoStore } from "../store/useVideoStore";

const ChatContainer = () => {
  const {
    messages: userMessages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const {
    messages: spaceMessages,
    selectedSpace,
    getMessagesFromSpace,
    subscribeToSpaceMessages,
    unsubscribeFromSpaceMessages,
  } = useSpaceStore();

  const { authUser } = useAuthStore();
  const { isInCall } = useVideoStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser?._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    } else if (selectedSpace) {
      getMessagesFromSpace(selectedSpace?._id);
      subscribeToSpaceMessages(selectedSpace?._id);
      return () => unsubscribeFromSpaceMessages(selectedSpace?._id);
    }
  }, [
    selectedUser?._id,
    selectedSpace?._id,
    getMessages,
    getMessagesFromSpace,
    subscribeToMessages,
    subscribeToSpaceMessages,
    unsubscribeFromMessages,
    unsubscribeFromSpaceMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessages, spaceMessages]);

  const messages = selectedUser ? userMessages : selectedSpace ? spaceMessages : [];

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className={`flex flex-1 flex-col overflow-hidden border-base-300 border-r ${isInCall ? 'hidden lg:flex lg:flex-col border-r border-base-300' : ''}`}>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message?._id}
                className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar flex-col items-center gap-1">
                  {selectedSpace && message.senderId !== authUser?._id && <span className="mx-1 text-sms opacity-50 ml-1">{message.senderName}</span>}
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser?._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser?.profilePic || selectedSpace?.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                {(message.text || (!message.image && message.text)) && (
                  <div
                    className={`chat-bubble flex flex-col ${
                      message.senderId === authUser?._id
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 text-base-content"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image || "/placeholder.svg"}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p className="break-words">{message.text}</p>}
                  </div>
                )}
                {!message.text && message.image && (
                  <img
                    src={message.image || "/placeholder.svg"}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <div className="flex h-full justify-center items-center text-gray-500 text-lg italic rounded-lg">
            Break the silence. Type away!
          </div>
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
