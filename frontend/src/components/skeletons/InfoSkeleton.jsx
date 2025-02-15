import { Trash2, VideoIcon, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { useChatStore } from "../../store/useChatStore"
import { useSpaceStore } from "../../store/useSpaceStore"
import { useAuthStore } from "../../store/useAuthStore"

const InfoSkeleton = () => {
  const { getUsers, selectedUser, removeConnection } = useChatStore()
  const { getSpaces, selectedSpace, spaceMembers, getMembersForSpace, leaveSpace, deleteSpace, toggleJoining } = useSpaceStore()
  const { onlineUsers, authUser } = useAuthStore()
  const [acceptInvite, setAcceptInvite] = useState(selectedSpace?.acceptingInvites);

  const handleRemoveUser = () => {
    removeConnection(selectedUser.connectionCode)
  }

  const handleLeaveSpace = () => {
    leaveSpace(selectedSpace.spaceCode)
  }

  const handleDeleteSpaces = () => {
    deleteSpace(selectedSpace._id)
  }

  const handleToggleInvite = async () => {
    const newInviteStatus = !acceptInvite;
    setAcceptInvite(newInviteStatus);
  
    try {
      await toggleJoining({ spaceId: selectedSpace._id, change: newInviteStatus });
    } catch (error) {
      setAcceptInvite(!newInviteStatus);
    }
  };  

  useEffect(() => {
    getUsers()
    getSpaces()
  }, [getUsers, getSpaces])

  useEffect(() => {
    if (selectedSpace) {
      getMembersForSpace(selectedSpace._id)

      setAcceptInvite(selectedSpace.acceptingInvites)
    }
  }, [selectedSpace, getMembersForSpace])
  
  if(!selectedSpace && !selectedUser) return null;

  return (
    <div className="h-full w-64 flex flex-col bg-base-200">
      {selectedUser ? (
        <div className="flex flex-col h-full items-center p-4">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{selectedUser.fullName}</h2>
          <p className="text-sm text-base-content/60">{selectedUser.connectionCode}</p>
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
          )}

          <p className="mt-4 text-sm text-center text-base-content/80">{selectedUser.about || "No bio available."}</p>

          <div className="flex flex-col w-full gap-4 mt-6">
            <button className="btn btn-primary btn-sm gap-2">
              <VideoIcon className="w-4 h-4" /> Video Call
            </button>
            <button className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2">
                <Youtube /> Sync Watch
            </button>            
            <button onClick={handleRemoveUser} className="btn btn-error btn-sm mt-4">Remove Connection</button>
          </div>
        </div>
      ) : selectedSpace ? (
        <div className="flex flex-col h-full items-center p-4">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={selectedSpace.creator?.profilePic || "/avatar.png"} alt={selectedSpace.name} />
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{selectedSpace.name}</h2>
          <p className="text-sm text-base-content/60">{selectedSpace.spaceCode}</p>

          <div className="divider mt-5"></div>

          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="font-semibold">Enable Joining</span>
              <input onClick={handleToggleInvite} type="checkbox" checked={acceptInvite} className="toggle toggle-success rounded-full transition ease-in" />
            </div>
            <div className="flex flex-cols items-center justify-between gap-2">
              <button className="btn btn-primary btn-sm gap-2 flex flex-grow">
                <VideoIcon />
              </button>
              <button className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2">
                <Youtube /> Sync Watch
              </button>
            </div>

            <button className="btn btn-secondary btn-sm mt-4" onClick={handleLeaveSpace}>Leave Space</button>
            
            {selectedSpace.creator === authUser._id && (
              <button onClick={handleDeleteSpaces} className="btn btn-error btn-sm btn-outline"><Trash2 className="w-5 h-5" />Delete Space</button>
            )}
          </div>

          <div className="divider my-4">Members ({spaceMembers?.length || 0})</div>

          <div className="w-full overflow-y-auto flex-grow">
            {spaceMembers?.length > 0 ? (
              spaceMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-3 py-2 hover:bg-base-300 rounded-lg px-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img src={member.profilePic || "/avatar.png"} alt={member.fullName} />
                    </div>
                    {onlineUsers.includes(member._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.fullName}</p>
                    <p className="text-xs text-base-content/60">{member.connectionCode}</p>
                  </div>
                  {member._id === selectedSpace.creator && <span className="text-xs text-base-content/60 ml-auto">Admin</span>}
                  {member._id === authUser._id && <span className="text-xs text-base-content/60 ml-auto">You</span>}
                </div>
              ))
            ) : (
              <p className="text-base-content/60 text-sm text-center">No members found.</p>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default InfoSkeleton

