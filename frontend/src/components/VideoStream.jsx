import { Video } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSpaceStreamStore } from "../store/useSpaceStreamStore";
import { useSpaceStore } from "../store/useSpaceStore";

const VideoStream = () => {
  const videoRef = useRef(null);
  const { authUser } = useAuthStore();
  const { hostId, fetchStreams, currentStreamUrl, stopStream, leaveStream } = useSpaceStreamStore();
  const {selectedSpace} = useSpaceStore();

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    if (currentStreamUrl && videoRef.current) {
      videoRef.current.src = currentStreamUrl;
      videoRef.current.play().catch((error) => console.error("Video play error:", error));
    }
  }, [currentStreamUrl]);

  const handleLeaveStream = () => {
    leaveStream()
  };

  const handleStopStream = () => {
    console.log(currentStreamUrl)
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
        <div>
          {/* list of users watching this stream */}
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
