import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../store/useVideoStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const VideoCall = () => {
  const {
    acceptCall,
    rejectCall,
    disconnectCall,
    localStream,
    remoteStream,
    isInCall,
    incomingCall,
    listenForUserJoined, 
    listenForNewRoom
  } = useVideoStore();

  const navigate = useNavigate()
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const {myPeerId, remotePeerId} = useVideoStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleDisconnect = () => {
    try {
      disconnectCall(selectedUser)
      navigate('/')
    } catch (error) {
      toast.error("Couldn't disconnect call")
    }
  }

  useEffect(()=>{
    if(!myPeerId || !isInCall) {
      navigate('/')
    }
  },[myPeerId, isInCall])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  useEffect(()=>{
    listenForNewRoom()
    listenForUserJoined()
  },[myPeerId, remotePeerId, isInCall])

  return (
    <div className="flex flex-col items-center p-4 mt-16 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Video Call</h2>

      {incomingCall && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={acceptCall}
            className="btn btn-success px-4 py-2 flex items-center"
          >
            Accept Call
          </button>
          <button
            onClick={rejectCall}
            className="btn btn-error px-4 py-2 flex items-center"
          >
            Reject Call
          </button>
        </div>
      )}

      {isInCall ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
              You ({authUser?.fullName || "Unknown"})
            </span>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
              {selectedUser?.fullName || "Remote User"}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-base-content/60 mt-6">No active call.</p>
      )}

      {isInCall && (
        <button
          onClick={handleDisconnect}
          className="btn btn-secondary mt-6 px-4 py-2 flex items-center rounded-full"
        >
          Hang Up
        </button>
      )}
    </div>
  );
};

export default VideoCall;
