import React, { useEffect } from 'react'
import { useSpaceStore } from '../store/useSpaceStore.js'
import { useChatStore } from '../store/useChatStore.js'
import { Trash2, Youtube } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore.js'

const WatchHistory = () => {
  const {spaceWatchHistory, selectedSpace, getSpaceWatchHistory, deleteSpaceWatchHistory} = useSpaceStore()
  const {userWatchHistory, selectedUser, getUserWatchHistory, deleteUserWatchHistory} = useChatStore()
  const {authUser} = useAuthStore()

  const handleDeleteYturl = (ytUrlId) => {
    if(selectedSpace && ytUrlId) {
      deleteSpaceWatchHistory(selectedSpace._id, ytUrlId)
    } else if(selectedUser && ytUrlId) {
      deleteUserWatchHistory(authUser._id, ytUrlId)
    }
    return
  }

  useEffect(()=>{
    if(selectedSpace) {
      getSpaceWatchHistory(selectedSpace._id)
    } else if(selectedUser) {
      getUserWatchHistory(selectedUser._id)
    }
  },[selectedSpace, selectedUser])

  return (
    <div className='w-full max-w-[15rem] hidden lg:block flex flex-col overflow-x-hidden overflow-y-auto'>
      <div className='py-2.5 px-4 font-semibold px-4 border-base-300 bg-base-200 border-b text-sm relative'><Youtube className='inline mx-2 text-red-500'/>Recent YouTube Views</div>
        <div>
          {(selectedSpace && spaceWatchHistory.length === 0 ) || (selectedUser && userWatchHistory.length === 0) ?  <span className='px-4 py-2 flex item-center justify-begin text-gray-500 italic'>No history yet. Sync to start!</span> : <div>
            {selectedSpace && spaceWatchHistory.map((history, index)=>(
              <div className='flex px-4 py-1 w-full rounded items-center justify-between hover:bg-base-300' key={index}>
                <button className='hover:text-primary truncate'>{index+1}. {history.title}</button>
                {selectedSpace.creator === authUser._id && <button onClick={() => (handleDeleteYturl(history._id))} className='btn btn-sm hover:text-red-500'><Trash2 /></button>}
              </div>
            ))}

            {selectedUser && userWatchHistory.map((history, index)=>(
              <div className='flex px-4 py-1 w-full rounded items-center justify-between hover:bg-base-300' key={index}>
                <button className='hover:text-primary truncate'>{index+1}. {history.title}</button>
                <button onClick={() => (handleDeleteYturl(history._id))} className='btn btn-sm hover:text-red-500'><Trash2 /></button>
              </div>
            ))}
          </div>}
      </div>
    </div>
  )
}

export default WatchHistory