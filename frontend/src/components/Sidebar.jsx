import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useSpaceStore } from "../store/useSpaceStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getSpaces, spaces, selectedSpace, setSelectedSpace, isSpacesLoading } = useSpaceStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
    getSpaces();
  }, [getUsers, getSpaces]);

  if (isUsersLoading || isSpacesLoading) return <SidebarSkeleton />;

  const combinedList = [...spaces, ...users];
  const handleSelection = (item, isSpace) => {
    if (isSpace) {
      setSelectedUser(null);
      setSelectedSpace(item);
    } else {
      setSelectedSpace(null);
      setSelectedUser(item);
    }
  };

  const isExpanded = !selectedUser && !selectedSpace;

  return (
    <aside
      className={`flex flex-col px-1 py-1 transition-all duration-300 overflow-x-hidden overflow-y-auto ${
        isExpanded ? "w-48 border-r border-base-300 bg-base-200" : "w-16"
      }`}
    >
      {isExpanded && <div className="flex items-center justify-begin px-2 mb-1 border-b border-base-300 text-primary font-semibold">Connections ({combinedList.length})</div>}
      {combinedList.map((item) => {
        const isSpace = item?.members !== undefined;
        const isSelected = isSpace ? selectedSpace?._id === item?._id : selectedUser?._id === item?._id;

        return (
          <div key={item?._id} className="relative group">
            <button
              onClick={() => handleSelection(item, isSpace)}
              className={`flex items-center border-b border-base-300 rounded px-2 py-1 transition-all duration-200 w-full text-left ${
                isSelected ? "bg-primary" : "hover:bg-primary/80 hover:text-base-900"
              }`}
            >
              <div className="relative w-10 h-10">
                <img
                  src={item?.profilePic || item?.image || "/avatar.png"}
                  alt={item?.name || item?.fullName}
                  className="w-10 h-10 object-cover rounded-full transition-all duration-200"
                />
                {!isSpace && onlineUsers.includes(item?._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
                )}
              </div>

              {isExpanded && (
                <span className="text-base-900 font-semibold text-lg px-2">
                  {isSpace
                    ? item?.name.length > 10
                      ? item?.name.slice(0, 10) + "..."
                      : item?.name
                    : item?.fullName.length > 10
                    ? item?.fullName.slice(0, 10) + "..."
                    : item?.fullName}
                </span>
              )}
            </button>

            {!isExpanded && <div className="absolute left-16 top-1/2 transform -translate-y-1/2 border border-primary/100 bg-base-200 text-base/90 text-md px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              {item?.name || item?.fullName}
            </div>}
          </div>
        );
      })}

      {combinedList.length === 0 && (
        <div className="text-center text-zinc-500 py-4 text-sm">No chats or spaces</div>
      )}
    </aside>
  );
};

export default Sidebar;
