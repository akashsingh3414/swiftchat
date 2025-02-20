import React, { useEffect, useRef, useState } from "react";
import { useVideoStore } from "../store/useVideoStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

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
    listenForNewRoom,
  } = useVideoStore();

  const navigate = useNavigate();
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { myPeerId, remotePeerId } = useVideoStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const handleDisconnect = () => {
    try {
      disconnectCall(selectedUser);
      navigate("/");
    } catch (error) {
      toast.error("Couldn't disconnect call");
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMicOn((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOn((prev) => !prev);
    }
  };

  const toggleSound = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setIsSoundOn((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!myPeerId || !isInCall) {
      navigate("/");
    }
  }, [myPeerId, isInCall, navigate]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  useEffect(() => {
    listenForNewRoom();
    listenForUserJoined();
  }, [myPeerId, remotePeerId, isInCall]);

  return (
    <div className="flex flex-col items-center h-full justify-between bg-base-300 w-full">
      <div className="flex items-center justify-center bg-base-200 border-b border-base-300 w-full p-4 md:p-2.5">
        <h1>Ongoing Video Call</h1>
      </div>
      <div className="flex w-full px-2 py-2 justify-center h-full max-h-[80%]">
        {isInCall ? (
          <div className="flex flex-col w-full flex-grow gap-y-2 justify-center overflow-hidden">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden w-full md:max-h-[60%]">
              <video ref={remoteVideoRef} autoPlay playsInline className="object-cover w-full h-full" />
              <span className="absolute bottom-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                {selectedUser?.fullName || "Remote User"}
              </span>
            </div>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden w-full md:max-h-[40%]">
              <video ref={localVideoRef} autoPlay muted playsInline className="object-cover w-full h-full" />
              <span className="absolute bottom-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                You ({authUser?.fullName || "Unknown"})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-base-content/60 mt-6">No active call.</p>
        )}
      </div>
      {isInCall && (
          <div className="flex bg-gray-100 rounded-full p-1.5 -translate-y-2 gap-x-4 w-full max-w-[75%] lg:max-w-[60%] h-auto justify-center items-center">
            <button onClick={toggleMic} className="btn btn-circle btn-sm btn-primary">
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button onClick={toggleVideo} className="btn btn-circle btn-sm btn-primary">
              {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            <button onClick={toggleSound} className="btn btn-circle btn-sm btn-primary">
              {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={handleDisconnect} className="btn btn-circle btn-sm btn-error">
              <PhoneOff size={16} />
            </button>
          </div>
        )}
    </div>
  );
};

export default VideoCall;