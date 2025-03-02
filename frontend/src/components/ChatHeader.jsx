import { useState, useEffect, useRef, useCallback } from "react";
import { EllipsisVertical, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSpaceStore } from "../store/useSpaceStore";
import { useSpaceStreamStore } from "../store/useSpaceStreamStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, deleteMyMessages } = useChatStore();
  const { selectedSpace, setSelectedSpace, deleteAllSpaceMessages } = useSpaceStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { allStreams, currentStreamUrl, joinStream, fetchStreams, hostId, inVideoStream, leaveStream } = useSpaceStreamStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef(null);

  const isSpaceSelected = !!selectedSpace;
  const name = isSpaceSelected ? selectedSpace.name : selectedUser?.fullName;
  const image = isSpaceSelected ? selectedSpace.image : selectedUser?.profilePic;

  useEffect(() => {
    fetchStreams();
  }, []);

  const status = isSpaceSelected
    ? `${selectedSpace.members.length} members`
    : onlineUsers.includes(selectedUser?._id)
    ? "Online"
    : "Offline";

    const handleJoinStream = () => {
      if (authUser && selectedSpace) {
        const currentStream = allStreams[selectedSpace?._id];
    
        if (!currentStream) return;
    
        if (inVideoStream && currentStreamUrl !== currentStream) {
          leaveStream(authUser._id, currentStreamUrl, selectedSpace._id);
        }
    
        joinStream(authUser._id, currentStream, selectedSpace._id);
      }
    };
    
    useEffect(() => {
      if (selectedSpace) {
        setIsDropdownOpen(false);
      }
    }, [allStreams, selectedSpace]);
    
    console.log(allStreams)
    console.log(hostId)

  const handleDeleteAllMessages = () => {
    if (selectedSpace) deleteAllSpaceMessages(selectedSpace._id);
  };

  const handleDeleteMyMessages = () => {
    deleteMyMessages(selectedUser?._id || selectedSpace?.creator);
  };

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="px-4 py-1 border-b border-base-300 flex items-center justify-between bg-base-200 relative">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            <img src={image || "/avatar.png"} alt={name} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold truncate">{name}</h3>
          <p className="text-xs text-gray-500">{status}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        { allStreams[selectedSpace?._id] &&
          (
            <button
              onClick={handleJoinStream}
              disabled={inVideoStream && allStreams[selectedSpace?._id]}
              className={`btn btn-sm px-2 py-1 mx-1 ${
                inVideoStream && allStreams[selectedSpace?._id] ? "btn-success" : "btn-error btn-outline"
              }`}
            >
              {inVideoStream && allStreams[selectedSpace?._id] ? "Joined" : "Join Stream"}
            </button>
          )}

        <button ref={buttonRef} onClick={toggleDropdown} className="p-1 rounded-lg hover:bg-base-300 transition">
          <EllipsisVertical className="size-5 text-gray-500" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-base-100 border border-base-300 shadow-md rounded-box z-50 whitespace-nowrap">
            <button
              onClick={handleDeleteMyMessages}
              className="block text-left px-2 py-2 text-sm hover:bg-base-200 rounded-md"
            >
              Delete my messages
            </button>
            {selectedSpace && selectedSpace.creator === authUser._id && (
              <button
                onClick={handleDeleteAllMessages}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-base-200 rounded-md"
              >
                Clear Space
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => (isSpaceSelected ? setSelectedSpace(null) : setSelectedUser(null))}
          className="p-1 rounded-lg hover:bg-base-300 transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
