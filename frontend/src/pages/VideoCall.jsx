import React, { useEffect } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { useNavigate } from 'react-router-dom'

const VideoCall = () => {
  const { disconnectCall } = useVideoStore()
  const navigate = useNavigate()

  const handleDisconnect = () => {
    disconnectCall()
    navigate('/')
  }

  return (
    <div className="flex flex-col items-center p-4 mt-16">
      <h2 className="text-xl font-semibold">Video Call</h2>
      
      <button
        onClick={handleDisconnect}
        className="btn btn-error btn-sm mt-4"
      >
        Disconnect
      </button>
    </div>
  )
}

export default VideoCall
