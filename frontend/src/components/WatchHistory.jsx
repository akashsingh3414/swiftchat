import React from 'react'
import { useSpaceStore } from '../store/useSpaceStore.js'
import { useChatStore } from '../store/useChatStore.js'

const WatchHistory = () => {
  const {spaceWatchHistory} = useSpaceStore()
  const {userWatchHistory} = useChatStore()

  const watchHistory = [...spaceWatchHistory, ...userWatchHistory]
  return (
    <div className='p-1 border-l w-full max-w-[15rem] border-base-200 hidden lg:block flex flex-col'>
      <div className='border-b border-base-300 py-2 font-semibold px-4'>Watch History</div>
      <div>
        {watchHistory.length === 0 ? <span className='px-4'>Nothing to show here</span> : <></>}
      </div>
    </div>
  )
}

export default WatchHistory