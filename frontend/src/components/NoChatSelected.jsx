import { MessageSquare, User, Users, Plus, Video, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSpaceStore } from "../store/useSpaceStore";
import { useChatStore } from "../store/useChatStore";
import StreamCard from "./StreamCard";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import WelcomeContent from "./WelcomeContent";

const NoChatSelected = () => {
  const { createSpace, joinSpace } = useSpaceStore();
  const { addConnection } = useChatStore();
  const [connect, setConnect] = useState(false);
  const [create, setCreate] = useState(false);
  const [join, setJoin] = useState(false);
  const [streams, setStreams] = useState([]);
  const name = useRef();
  const spaceCodeRef = useRef();
  const connectionCodeRef = useRef();

  const getStreams = async () => {
    try {
      const response = await axiosInstance.get(`/stream/get-stream`)
      setStreams(response.data.streams)
    } catch (error) {
      toast.error("Error while fetching streams")
    }
  }

  useEffect(()=>{
    getStreams();
  }, [])

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row items-left gap-2 p-3 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-2">
          {connect && (
            <input
              className="input input-sm bg-base-100 text-primary min-w-[15rem] px-3 py-1 rounded-md outline outline-1"
              placeholder="Enter Connection Code"
              ref={connectionCodeRef}
            />
          )}
          
          <button
            onClick={() => {
              if (connect && connectionCodeRef?.current?.value) {
                addConnection(connectionCodeRef.current.value);
              }
              setConnect(!connect);
              setCreate(false);
              setJoin(false);
            }}
            className={`btn btn-sm w-full md:w-auto max-w-[15rem] flex items-center gap-2 rounded-md px-3 py-1 
              ${connect ? "btn-success mr-2 w-auto" : "btn-secondary"}`}
          >
            {connect ? "Done" : (
              <>
                <User className="w-4 h-4 hidden md:inline" />
                Connect To Users
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 ">
          {create && (
            <input
              className="input input-sm bg-base-100 text-primary min-w-[15rem] px-3 py-1 ml-2 rounded-md outline outline-1"
              placeholder="Enter Space Name"
              ref={name}
            />
          )}
          
          <button
            onClick={() => {
              if (create && name?.current?.value) {
                createSpace(name.current.value);
              } 
              
              setConnect(false);
              setCreate(!create);
              setJoin(false);
            }}
            className={`btn btn-sm w-full md:w-auto max-w-[15rem] flex items-center gap-2 rounded-md px-3 py-1 
              ${create ? "btn-success w-auto" : "btn-secondary"}`}
          >
            {create ? "Done" : (
              <>
                <Plus className="w-4 h-4 hidden md:inline" />
                Create Your Spaces
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 ">
          {join && (
            <input
              className="input input-sm bg-base-100 text-primary min-w-[15rem] px-3 py-1 ml-2 rounded-md outline outline-1"
              placeholder="Enter Space Code"
              ref={spaceCodeRef}
            />
          )}
          
          <button
            onClick={() => { 
              if (join && spaceCodeRef?.current?.value) {
                joinSpace(spaceCodeRef.current.value);
              } 

              setConnect(false);
              setCreate(false);
              setJoin(!join);
            }}
            className={`btn btn-sm flex w-full md:w-auto max-w-[15rem] items-center gap-2 rounded-md px-3 py-1 
              ${join ? "btn-success w-auto" : "btn-secondary"}`}
          >
            {join ? "Done" : (
              <>
                <Users className="w-4 h-4 hidden md:inline" />
                Join Spaces
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 p-2">
        {streams.map(stream => (
          <StreamCard key={stream._id} stream={stream}/>
        ))}
      </div>

      {streams.length == 0 && <WelcomeContent />}
    </div>
  );
};

export default NoChatSelected;