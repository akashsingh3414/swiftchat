import { MessageSquare, Plus, User, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useSpaceStore } from "../store/useSpaceStore";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {

  const {createSpace, joinSpace} = useSpaceStore()
  const {addConnection} = useChatStore()
  const [connect, setConnect] = useState(false)
  const [create, setCreate] = useState(false)
  const [join, setJoin] = useState(false)
  const name = useRef();
  const spaceCodeRef = useRef();
  const connectionCodeRef = useRef();

  return (
    <div className="w-full h-screen bg-base-100 flex flex-col">
      
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
              placeholder="Enter Space Name"
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

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">Welcome to SwiftChat!</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar or  a new connection.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default NoChatSelected;
