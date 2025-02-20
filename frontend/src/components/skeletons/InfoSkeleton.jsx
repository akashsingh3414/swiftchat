import { Trash2, VideoIcon, Youtube } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useSpaceStore } from "../../store/useSpaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useVideoStore } from "../../store/useVideoStore";
import { toast } from "sonner";

const InfoSkeleton = () => {
  const { getUsers, selectedUser, removeConnection, addUserWatchHistory } = useChatStore();
  const { getSpaces, selectedSpace, spaceMembers, getMembersForSpace, leaveSpace, deleteSpace, toggleJoining, removeUserFromSpace, addSpaceWatchHistory } = useSpaceStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { joinRoom, createRoom, initPeer, remotePeerId, isInCall, listenForUserJoined, listenForNewRoom, myPeerId } = useVideoStore();
  const [acceptInvite, setAcceptInvite] = useState(selectedSpace?.acceptingInvites);
  const [startSync, setStartSync] = useState(false);
  const ytUrl = useRef(null)

  const handleRemoveUser = () => removeConnection(selectedUser.connectionCode);

  const handleUserRemovalFromSpace = (userId) => {
    removeUserFromSpace({ spaceId: selectedSpace._id, userId });
  };

  useEffect(() => {
    getUsers();
    getSpaces();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      getMembersForSpace(selectedSpace._id);
      setAcceptInvite(selectedSpace.acceptingInvites);
    }
  }, [selectedSpace]);

  const handleVideoCall = async () => {
    try {
      listenForUserJoined()
      listenForNewRoom()
      await initPeer();
  
      if (!remotePeerId) {
        await createRoom(selectedUser);
      } else {
        joinRoom(selectedUser);
      }
    } catch (error) {
      console.error("Video call initiation failed:", error);
    }
  };

  const handleStart = () => {
    setStartSync(prev=>!prev)

    if(!ytUrl) {
      toast.error('Please provide Youtube Url')
      return
    }

    if(selectedSpace && ytUrl) {
      addSpaceWatchHistory(selectedSpace._id, ytUrl.current.value)
    } else if(selectedUser && ytUrl) {
      addUserWatchHistory(selectedUser._id, ytUrl.current.value)
    }
    return
  }

  const handleLeaveSpace = () => leaveSpace(selectedSpace.spaceCode);
  const handleDeleteSpaces = () => deleteSpace(selectedSpace._id);

  const handleToggleInvite = async () => {
    try {
      await toggleJoining({ spaceId: selectedSpace._id, change: !acceptInvite });
      setAcceptInvite((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle invite status", error);
    }
  };

  if (!selectedSpace && !selectedUser) return null;

  return (
    <div className="h-full w-full max-w-64 flex flex-col bg-base-200">
      {selectedUser ? (
        <div className="flex flex-col h-full items-center p-4">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{selectedUser.fullName}</h2>
          <p className="text-sm text-base-content/60">{selectedUser.connectionCode}</p>

          <div className="divider"></div>

          {selectedUser?.about && <p className="text-sm text-center text-base-content/80">{selectedUser.about}</p>}

          <div className="flex flex-col w-full gap-4 mt-4">

            <button onClick={handleVideoCall} className={`btn btn-primary btn-sm gap-2 ${isInCall || myPeerId ? "btn-success" : ""}`}>
              <VideoIcon className="w-4 h-4" /> Video Chat
            </button>

            {!startSync && <button onClick={()=>(
              setStartSync(prev=>!prev)
            )} className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center">
              <Youtube /> Sync Watch
            </button>}

            {startSync && <div className="w-full">
                <form action="" type="submit" className="flex flex-1 items-center justify-center gap-2 w-full">
                  <input type="text" placeholder="Type or paste URL" ref={ytUrl} className="px-4 py-1 w-full rounded outline-none"/>
                  <button onClick={handleStart} className="btn btn-outline btn-sm rounded px-1 py-1">Start</button>
                </form>
              </div>}
              
            <button onClick={handleRemoveUser} className="btn btn-error btn-sm mt-4">Remove Connection</button>
          </div>
        </div>
      ) : selectedSpace ? (
        <div className="flex flex-col h-full items-center p-4">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={selectedSpace?.image || "/avatar.png"} alt={selectedSpace.name} />
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{selectedSpace.name}</h2>
          <p className="text-sm text-base-content/60">{selectedSpace.spaceCode}</p>

          <div className="divider mt-5"></div>

          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Enable Joining</span>
              <input type="checkbox" checked={acceptInvite} onChange={handleToggleInvite} className="toggle toggle-success rounded-full" />
            </div>

            {!startSync && <button onClick={()=>(
              setStartSync(prev=>!prev)
            )} className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center">
              <Youtube /> Sync Watch
            </button>}

            {startSync && <div className="w-full">
                <form action="" type="submit" className="flex flex-1 items-center justify-center gap-2 w-full">
                  <input type="text" placeholder="Type or paste URL" ref={ytUrl} className="px-4 py-1 w-full rounded outline-none"/>
                  <button onClick={handleStart} className="btn btn-outline btn-sm rounded px-1 py-1">Start</button>
                </form>
              </div>}

            <div className="flex justify-center gap-2">
              <button onClick={handleLeaveSpace} className="btn btn-secondary btn-sm flex-grow">Leave Space</button>
              {selectedSpace.creator === authUser._id && (
                <button onClick={handleDeleteSpaces} className="btn btn-error btn-sm btn-outline flex items-center gap-1 px-2">
                  <Trash2 className="w-4 h-4" /> Delete Space
                </button>
              )}
            </div>
          </div>

          <div className="divider my-4">Members ({spaceMembers?.length || 0})</div>

          <div className="w-full overflow-y-auto flex-grow">
            {spaceMembers?.length ? (
              spaceMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-3 py-2 hover:bg-base-300 rounded-lg px-2">
                  <div className="avatar relative">
                    <div className="w-8 h-8 rounded-full">
                      <img src={member.profilePic || "/avatar.png"} alt={member.fullName} />
                    </div>
                    {onlineUsers.includes(member._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{member.fullName}</p>
                    <p className="text-xs text-base-content/60">{member.connectionCode}</p>
                  </div>
                  {selectedSpace.creator === authUser._id && member._id !== selectedSpace.creator && (
                    <button onClick={() => handleUserRemovalFromSpace(member._id)} className="btn btn-sm btn-secondary btn-outline text-xs px-2">Remove</button>
                  )}
                  {member._id === selectedSpace.creator && <span className="text-xs text-base-content/60">Admin</span>}
                  {member._id === authUser._id && <span className="text-xs text-base-content/60">(You)</span>}
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-base-content/60">No members found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InfoSkeleton;