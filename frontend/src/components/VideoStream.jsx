import { Video, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSpaceStreamStore } from "../store/useSpaceStreamStore";
import { useSpaceStore } from "../store/useSpaceStore";

const VideoStream = () => {
  const videoRef = useRef(null);
  const { authUser } = useAuthStore();
  const { hostId, fetchStreams, currentStreamUrl, stopStream, leaveStream, usersInCurrentStream } = useSpaceStreamStore();
  const { selectedSpace } = useSpaceStore();
  const [viewers, setViewers] = useState([]);

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    if (currentStreamUrl && videoRef.current) {
      videoRef.current.src = currentStreamUrl;
      videoRef.current.play().catch((error) => console.error("Video play error:", error));
    }
  }, [currentStreamUrl]);

  useEffect(() => {
    if (selectedSpace && selectedSpace._id && usersInCurrentStream && usersInCurrentStream[selectedSpace._id]) {
      setViewers(usersInCurrentStream[selectedSpace._id]);
    } else {
      setViewers([]);
    }
  }, [usersInCurrentStream, currentStreamUrl]);

  const handleLeaveStream = () => {
    console.log(usersInCurrentStream)
    leaveStream(authUser._id, currentStreamUrl, selectedSpace._id, usersInCurrentStream);
  };

  const handleStopStream = () => {
    console.log(currentStreamUrl);
    stopStream(hostId, currentStreamUrl, selectedSpace._id);
  };

  return (
    <div className="w-full hidden lg:block flex flex-col overflow-x-hidden overflow-y-auto flex-1 border-base-300 border-r">
      <div className="py-0 lg:py-1.5 font-semibold lg:px-4 border-base-300 bg-base-200 border-b text-sm relative flex justify-between">
        <div className="flex justify-center items-center truncate">
          <Video className="inline mx-2 text-red-500" /> Video Streaming
        </div>
        <div className="flex justify-center items-center">
          <button className="btn btn-error btn-sm btn-outline py-0 px-1 mx-1" onClick={handleLeaveStream}>
            Leave Stream
          </button>
          {hostId === authUser._id && (
            <button className="btn btn-error btn-sm btn-outline py-0 px-1" onClick={handleStopStream}>
              Stop Stream
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <video ref={videoRef} className="w-full h-auto" controls autoPlay />
        </div>
        <div className="p-4 bg-base-100 rounded-md m-2 border border-base-300">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <Users size={18} />
            <span>Viewers ({viewers.length})</span>
          </div>
          {viewers.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {viewers.map(userId => (
                <ViewerItem key={userId} userId={userId} isHost={userId === hostId} isYou={userId === authUser._id} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No viewers currently watching</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ViewerItem = ({ userId, isHost, isYou }) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-base-200 rounded-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          {userId.substring(userId.length-2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isYou ? 'You' : `User ${userId}`}
          </span>
          <span className="text-xs text-gray-500">
            {isYou ? 'Watching now' : 'Watching now'}
          </span>
        </div>
      </div>
      {isHost && (
        <div className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Host</div>
      )}
    </div>
  );
};

export default VideoStream;