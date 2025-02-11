import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSpaceStore } from "../store/useSpaceStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedSpace, setSelectedSpace } = useSpaceStore();
  const { onlineUsers } = useAuthStore();

  const isSpaceSelected = !!selectedSpace;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar / Space Icon */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={isSpaceSelected ? selectedSpace.image || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                alt={isSpaceSelected ? selectedSpace.name : selectedUser.fullName}
              />
            </div>
          </div>

          {/* User / Space Info */}
          <div>
            <h3 className="font-medium">
              {isSpaceSelected ? selectedSpace.name : selectedUser.fullName}
            </h3>
            <p className="text-sm text-base-content/70">
              {isSpaceSelected
                ? `${selectedSpace.members.length} members`
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={() => (isSpaceSelected ? setSelectedSpace(null) : setSelectedUser(null))}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
