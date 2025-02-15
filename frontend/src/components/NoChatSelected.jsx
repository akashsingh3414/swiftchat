import { MessageSquare, Plus, User, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useSpaceStore } from "../store/useSpaceStore";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {

  const {createSpace, joinSpace} = useSpaceStore()
  const {addConnection} = useChatStore()
  const [connectStart, setConnectStart] = useState(false)
  const [createStart, setCreateStart] = useState(false)
  const [joinStart, setJoinStart] = useState(false)
  const name = useRef();
  const spaceCodeRef = useRef();
  const connectionCodeRef = useRef();

  return (
    <div className="w-full h-screen bg-base-100 flex flex-col">
      
      <div className="w-full flex items-center gap-3 p-3 border-b border-base-300 bg-base-200">

        <div className="flex items-center gap-2 mx-1">
          {connectStart && (
            <input
              className="input input-sm bg-base-100 text-white px-3 py-1 rounded-md outline outline-1 w-full"
              placeholder="Enter Connection Code"
              ref={connectionCodeRef}
            />
          )}
          
          <button
            onClick={() => {
              if (connectStart && connectionCodeRef?.current?.value) {
                addConnection(connectionCodeRef.current.value);
              }
              
              setConnectStart(!connectStart);
              setCreateStart(false);
              setJoinStart(false);
            }}
            className={`btn btn-sm flex items-center gap-2 rounded-md px-3 py-1 
              ${connectStart ? "btn-success mr-2" : "btn-secondary"}`}
          >
            {connectStart ? "Done" : (
              <>
                <User className="w-4 h-4 hidden sm:inline" />
                Connect To Users
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 mx-1">
          {createStart && (
            <input
              className="input input-sm bg-base-100 text-white px-3 py-1 ml-2 rounded-md outline outline-1 w-full"
              placeholder="Enter Space Name"
              ref={name}
            />
          )}
          
          <button
            onClick={() => {
              if (createStart && name?.current?.value) {
                createSpace(name.current.value);
              } 
              
              setConnectStart(false);
              setCreateStart(!createStart);
              setJoinStart(false);
            }}
            className={`btn btn-sm flex items-center gap-2 rounded-md px-3 py-1 
              ${createStart ? "btn-success" : "btn-secondary"}`}
          >
            {createStart ? "Done" : (
              <>
                <Plus className="w-4 h-4 hidden sm:inline" />
                Create Your Spaces
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 mx-1">
          {joinStart && (
            <input
              className="input input-sm bg-base-100 text-white px-3 py-1 ml-2 rounded-md outline outline-1 w-full"
              placeholder="Enter Space Name"
              ref={name}
            />
          )}
          
          <button
            onClick={() => {
              if (joinStart && spaceCodeRef?.current?.value) {
                createSpace(spaceCodeRef.current.value);
              } 
              
              setConnectStart(false);
              setCreateStart(false);
              setJoinStart(!joinStart);
            }}
            className={`btn btn-sm flex items-center gap-2 rounded-md px-3 py-1 
              ${joinStart ? "btn-success" : "btn-secondary"}`}
          >
            {joinStart ? "Done" : (
              <>
                <Users className="w-4 h-4 hidden sm:inline" />
                Join Spaces
              </>
            )}
          </button>
        </div>

      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">Welcome to SwiftChat!</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar or start a new connection.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default NoChatSelected;
