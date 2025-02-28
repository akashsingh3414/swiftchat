import { Video } from 'lucide-react'
import React from 'react'

const VideoStream = () => {
  return (
    <div className='w-full hidden lg:block flex flex-col overflow-x-hidden overflow-y-auto flex-1 border-base-300 border-r'>
      <div className='py-1.5 px-4 font-semibold px-4 border-base-300 bg-base-200 border-b text-sm relative flex justify-between'>
        <div className='flex justify-center items-center'><Video className='inline mx-2 text-red-500'/>Video Streaming</div>
        <button className='btn btn-error btn-sm btn-outline py-0'>Leave Stream</button>
      </div>

      {/* video player
      list of users in stream */}
    </div>
  )
}

export default VideoStream