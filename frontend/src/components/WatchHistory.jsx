import React, { useEffect } from 'react'
import { useSpaceStore } from '../store/useSpaceStore.js'
import { useChatStore } from '../store/useChatStore.js'

const WatchHistory = () => {
  const {spaceWatchHistory, selectedSpace, getSpaceWatchHistory} = useSpaceStore()
  const {userWatchHistory, selectedUser, getUserWatchHistory} = useChatStore()

  const watchHistory = [...spaceWatchHistory, ...userWatchHistory]

  useEffect(()=>{
    if(selectedSpace) {
      getSpaceWatchHistory(selectedSpace._id)
    } else if(selectedUser) {
      getUserWatchHistory(selectedUser._id)
    }
  },[selectedSpace, selectedUser])

  return (
    <div className='p-1 border-l w-full max-w-[15rem] border-base-200 hidden lg:block flex flex-col'>
      <div className='border-b border-base-300 py-2 font-semibold px-4'>Watch History</div>
      <div>
        {watchHistory.length === 0 ? <span className='px-4'>Nothing to show here</span> : <div>
          {watchHistory.map((history, index)=>(
            <button key={index} className='px-4 py-2 gap-1 border-b w-full flex justify-begin'>{index}. {history.title}</button>
          ))}
        </div>}
      </div>
    </div>
  )
}

export default WatchHistory