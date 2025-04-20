import React from 'react';
import { Eye, Clock, User, Trash } from 'lucide-react';
import { toast } from "sonner";
import { axiosInstance } from "../lib/axios";

const StreamCard = ({ stream }) => {
  const { createdAt, viewers } = stream;

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  };

  const getDuration = (startStr, endStr) => {
    if (!endStr) return 'Full';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;

    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    const hours = Math.floor(diffMs / 1000 / 60 / 60);

    const pad = (n) => String(n).padStart(2, '0');

    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleDeleteStream = async (streamId) => {
    try {
      await axiosInstance.delete(`/stream/delete-stream-record/${streamId}`);
      toast.success('Deleted stream record successfully');
    } catch (error) {
      toast.error('Error while deleting stream record')
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300 w-full hover:bg-base-200/90">
      <div className="card-body p-5">
        <div className="flex items-center justify-between mb-2">
        <h2 className="card-title text-lg md:text-xl flex items-center gap-2 text-primary truncate max-w-full overflow-hidden text-ellipsis">
          <Eye className="w-5 h-5 shrink-0" />
          <span className="truncate">{`Stream Id: ${stream._id}`}</span>
        </h2>
          <div className="text-xs md:text-sm text-base-content/70 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeAgo(createdAt)}
          </div>
          <div>
            <button className='hover:bg-white rounded-full p-1' onClick={()=>handleDeleteStream(stream._id)}><Trash className='text-red-500'/></button>
          </div>
        </div>

        <p className="text-sm md:text-base text-base-content mb-4">
          Total Viewers: <span className="font-semibold">{viewers.length}</span>
        </p>

        <div className="space-y-4">
          {viewers.map((viewer, index) => {
            const userName =
              typeof viewer.fullName === 'string'
                ? viewer.fullName
                : viewer.user|| 'Unknown';

            return (
              <div key={index} className="border-t border-base-300 pt-3">
                <div className="text-sm font-medium text-base-content flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-base-content/70" />
                  <span className="truncate">{userName}</span>
                </div>
                <ul className="ml-6 text-sm text-base-content/80 space-y-1 list-disc">
                  {viewer.joinedAt.map((joined, i) => {
                    const joinedRaw = joined?.$date || joined;
                    const leftRaw = viewer.leftAt?.[i]?.$date || viewer.leftAt?.[i];
                    const joinedTime = formatTime(joinedRaw);
                    const leftTime = leftRaw ? formatTime(leftRaw) : 'End';
                    const duration = getDuration(joinedRaw, leftRaw);

                    return (
                      <li key={i} className='flex justify-between'>
                        <div className='w-full'>
                          <span className="badge badge-success badge-sm mr-1">Joined</span>
                          <span>{joinedTime}</span>
                        </div>
                        <div className='w-full'>
                          <span className="badge badge-error badge-sm mr-1">Left</span>
                          <span>{leftTime}</span>
                        </div>
                        <div className='w-full'>
                          <span className="badge badge-info badge-sm mr-1">Duration</span>
                          <span>{duration}</span>
                        </div>                
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreamCard;