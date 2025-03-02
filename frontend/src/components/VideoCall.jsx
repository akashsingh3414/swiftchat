import React, { useEffect, useRef, useState } from "react";
import { useVideoStore } from "../store/useVideoStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const VideoCall = () => {
  const {
    disconnectCall,
    localStream,
    remoteStream,
    isInCall,
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
    <div className="flex flex-col items-center h-screen w-full bg-base-900 relative">
      <div className="flex items-center justify-center bg-base-800 w-full py-4 shadow">
        <h1 className="text-lg font-medium text-primary">Video Conference</h1>
      </div>
  
      <div className="flex w-full justify-center flex-grow overflow-hidden px-1 pb-2 sm:pb-4">
        {isInCall ? (
          <div className="relative w-full max-w-6xl mx-auto flex flex-col h-full">
            <div className="relative bg-black rounded-lg overflow-hidden w-full flex-grow mb-2">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="object-cover w-full h-full" 
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {selectedUser?.fullName || "Remote User"}
              </div>
              
              <div className="absolute top-2 right-2 w-2/4 sm:w-2/5 md:w-2/4 lg:w-2/5 aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <video 
                  ref={localVideoRef} 
                  autoPlay
                  muted 
                  playsInline 
                  className="object-cover w-full h-full" 
                />
                <div className="absolute bottom-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                  You
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-base text-gray-400">No active call</p>
          </div>
        )}
      </div>
  
      {isInCall && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center w-full py-6">
          <div className="flex bg-gray-800 rounded-full px-4 py-3 gap-x-4 sm:gap-x-6 justify-center shadow-lg">
            <button 
              onClick={toggleMic} 
              className={`p-3 rounded-full transition-all ${isMicOn ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button 
              onClick={toggleVideo} 
              className={`p-3 rounded-full transition-all ${isVideoOn ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
            <button 
              onClick={toggleSound} 
              className={`p-3 rounded-full transition-all ${isSoundOn ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {isSoundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <button 
              onClick={handleDisconnect} 
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;