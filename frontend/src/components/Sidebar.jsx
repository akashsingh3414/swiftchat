import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Grid } from "lucide-react";
import { useSpaceStore } from "../store/useSpaceStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getSpaces, spaces, selectedSpace, setSelectedSpace, isSpacesLoading } = useSpaceStore();
  const { onlineUsers } = useAuthStore();

  const [showSpaces, setShowSpaces] = useState(false);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    if (showSpaces) {
      getSpaces();
    } else {
      getUsers();
    }
  }, [showSpaces, getSpaces, getUsers]);

  const handleChatDisplay = (e) => {
    e.preventDefault();
    setShowSpaces(!showSpaces);
    showSpaces ? setSelectedSpace(null) : setSelectedUser(null)
  }

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading || isSpacesLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header Section */}
      <div className="border-b border-base-300 w-full p-5 flex justify-between items-center">
        {/* Toggle Button */}
        <button
          className={`rounded-full p-2 transition-all duration-200 ${
            showSpaces ? "bg-primary text-white" : "border hover:bg-gray-200"
          }`}
          onClick={handleChatDisplay}
        >
          {showSpaces ? <Users className="size-5" /> : <Grid className="size-5" />}
        </button>

        {/* Show Online Only (Hidden when Spaces are shown) */}
        {!showSpaces && (
          <div className="hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="overflow-y-auto w-full py-3">
        {/* Render Users or Spaces */}
        {showSpaces
          ? spaces.map((space) => (
              <button
                key={space._id}
                onClick={() => setSelectedSpace(space)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedSpace?._id === space._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={space.image || "/avatar.png"}
                    alt={space.name}
                    className="size-12 object-cover rounded-full"
                  />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{space.name}</div>
                  <div className="text-sm text-zinc-400">{space.members.length} members</div>
                </div>
              </button>
            ))
          : filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

        {/* No Users/Spaces Available */}
        {(showSpaces ? spaces.length === 0 : filteredUsers.length === 0) && (
          <div className="text-center text-zinc-500 py-4">
            {showSpaces ? "No spaces available" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
