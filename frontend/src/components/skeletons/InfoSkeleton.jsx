import { Loader, LoaderCircle, LoaderPinwheel, Trash2, VideoIcon, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useSpaceStore } from "../../store/useSpaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useVideoStore } from "../../store/useVideoStore";
import { useSpaceStreamStore } from "../../store/useSpaceStreamStore";
import { toast } from "sonner";

const InfoSkeleton = () => {
  const { getUsers, selectedUser, removeConnection } = useChatStore();
  const { getSpaces, selectedSpace, spaceMembers, getMembersForSpace, leaveSpace, deleteSpace, toggleJoining, removeUserFromSpace } = useSpaceStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { joinRoom, createRoom, initPeer, remotePeerId, isInCall, listenForUserJoined, listenForNewRoom, myPeerId } = useVideoStore();
  const { inVideoStream, startStream, currentStreamUrl } = useSpaceStreamStore();
  const [acceptInvite, setAcceptInvite] = useState(selectedSpace?.acceptingInvites);
  const [startSync, setStartSync] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveUser = () => removeConnection(selectedUser.connectionCode);

  const handleUserRemovalFromSpace = (userId) => {
    removeUserFromSpace({ spaceId: selectedSpace?._id, userId });
  };

  useEffect(() => {
    getUsers();
    getSpaces();
  }, []);

  useEffect(()=>{
    if(uploadedVideo && !currentStreamUrl) {
      setLoading(true);
    } else if(!uploadedVideo && currentStreamUrl) {
      setLoading(false);
    }
  }, [inVideoStream, currentStreamUrl])

  useEffect(() => {
    if (selectedSpace) {
      getMembersForSpace(selectedSpace?._id);
      setAcceptInvite(selectedSpace.acceptingInvites);
    }
  }, [selectedSpace]);

  useEffect(() => {
    setStartSync(false);
    setUploadedVideo(null);
  }, [selectedUser, selectedSpace]);  

  const handleVideoCall = async () => {
    if(inVideoStream) {
      setUploadedVideo(null);
      setStartSync(false);
      toast.error('Already streaming video. Leave or stop streaming.');
      return;
    }

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
    if(isInCall) {
      setUploadedVideo(null);
      setStartSync(false);
      setLoading(false);
      toast.error('Already on call. Disconnect the call first');
      return;
    }

    setUploadedVideo(null);
    setStartSync(false);
    setLoading(true);
    startStream(authUser?._id, uploadedVideo, selectedSpace?._id);
  }

  const handleLeaveSpace = () => leaveSpace(selectedSpace.spaceCode);
  const handleDeleteSpaces = () => deleteSpace(selectedSpace?._id);

  const handleToggleInvite = async () => {
    try {
      await toggleJoining({ spaceId: selectedSpace?._id, change: !acceptInvite });
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

            {/* {!startSync && (
              <div className="flex flex-1 w-full">
                {loading ? <button
                  className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center flex-1"
                  disabled={true}
                >
                  <LoaderCircle className="w-4 h-4 animate-spin"/>
                </button> : <button
                  onClick={() => setStartSync(true)}
                  disabled={inVideoStream}
                  className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center flex-1"
                >
                  <Youtube /> Upload Video
                </button>
              }
              </div>
            )} */}

            {/* {startSync && (
              <div className="w-full">
                <form className="flex flex-1 flex-col items-center justify-center gap-2 w-full">
                  {!uploadedVideo && <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadedVideo(e.target.files[0])}
                    className="px-4 py-1 w-full rounded outline-none border"
                  />}

                  {uploadedVideo && (
                    <div className="flex w-full gap-2">
                      <button onClick={handleStart} className="btn btn-outline btn-sm w-full rounded px-1 py-1">
                        Start Stream
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}  */}

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

            {!startSync && (
              <div className="flex flex-1 w-full">
                {loading ? <button
                  className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center flex-1"
                  disabled={true}
                >
                  <LoaderCircle className="w-4 h-4 animate-spin"/>
                </button> : <button
                  onClick={() => setStartSync(true)}
                  disabled={inVideoStream}
                  className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center flex-1"
                >
                  <Youtube /> Upload Video
                </button>
              }
              </div>
            )}

            {startSync && (
              <div className="w-full">
                <form className="flex flex-1 flex-col items-center justify-center gap-2 w-full">
                  {!uploadedVideo && <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadedVideo(e.target.files[0])}
                    className="px-4 py-1 w-full rounded outline-none border"
                  />}

                  {uploadedVideo && (
                    <div className="flex w-full gap-2">
                      <button onClick={handleStart} className="btn btn-outline btn-sm rounded w-full px-1 py-1">
                        Start Stream
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            <div className="flex justify-center gap-2">
              <button onClick={handleLeaveSpace} className="btn btn-secondary btn-sm flex-grow">Leave Space</button>
              {selectedSpace.creator === authUser?._id && (
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
                <div key={member?._id} className="flex items-center gap-3 py-2 hover:bg-base-300 rounded-lg px-2">
                  <div className="avatar relative">
                    <div className="w-8 h-8 rounded-full">
                      <img src={member.profilePic || "/avatar.png"} alt={member.fullName} />
                    </div>
                    {onlineUsers.includes(member?._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{member.fullName}</p>
                    <p className="text-xs text-base-content/60">{member.connectionCode}</p>
                  </div>
                  {selectedSpace.creator === authUser?._id && member?._id !== selectedSpace.creator && (
                    <button onClick={() => handleUserRemovalFromSpace(member?._id)} className="btn btn-sm btn-secondary btn-outline text-xs px-2">Remove</button>
                  )}
                  {member?._id === selectedSpace.creator && <span className="text-xs text-base-content/60">Admin</span>}
                  {member?._id === authUser?._id && <span className="text-xs text-base-content/60">(You)</span>}
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