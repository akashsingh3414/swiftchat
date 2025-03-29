import { MessageSquare, User, Users, Plus, Video, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { useSpaceStore } from "../store/useSpaceStore";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
  const { createSpace, joinSpace } = useSpaceStore();
  const { addConnection } = useChatStore();
  const [connect, setConnect] = useState(false);
  const [create, setCreate] = useState(false);
  const [join, setJoin] = useState(false);
  const name = useRef();
  const spaceCodeRef = useRef();
  const connectionCodeRef = useRef();

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
      <WelcomeContent />
    </div>
  );
};


export const WelcomeContent = () =>{
  return <div className="flex-1 overflow-y-auto bg-gradient-to-br from-base-100 to-base-200">
          <div className="min-h-full w-full p-4 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-base-100 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
                <h2 className="text-3xl font-bold">Welcome to SwiftChat!</h2>
                <p className="mt-2 opacity-90">Connect, communicate and collaborate in real-time</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="flex-1 relative">
                    <div className="relative h-64 w-full md:w-64 mx-auto">
                      <div className="absolute w-full h-full rounded-full bg-primary/10 animate-pulse"></div>
                      
                      <div className="absolute top-4 left-4 animate-bounce">
                        <div className="bg-primary/20 rounded-2xl p-3 shadow-md">
                          <p className="text-sm">Hey there! 👋</p>
                        </div>
                      </div>
                      
                      <div className="absolute top-20 right-4 animate-bounce" style={{ animationDelay: "0.5s" }}>
                        <div className="bg-secondary/20 rounded-2xl p-3 shadow-md">
                          <p className="text-sm">Let's video chat! 📹</p>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-20 left-4 animate-bounce" style={{ animationDelay: "0.75s" }}>
                        <div className="bg-accent/20 rounded-2xl p-3 shadow-md">
                          <p className="text-sm">Join our group! 👥</p>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 animate-bounce" style={{ animationDelay: "1s" }}>
                        <div className="bg-primary/20 rounded-2xl p-3 shadow-md">
                          <p className="text-sm">I'll be there! ✨</p>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-primary opacity-30" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 md:text-left text-center">
                    <h3 className="text-xl font-bold mb-4">Start communicating instantly</h3>
                    <p className="text-base-content/70 mb-6">
                      Select a conversation from the sidebar or create a new connection to begin your communication journey with SwiftChat.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button
                        onClick={() => {
                          setConnect(true);
                          setCreate(false);
                          setJoin(false);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <User className="w-4 h-4" />
                        Connect Now
                      </button>
                      <button
                        onClick={() => {
                          setCreate(true);
                          setConnect(false);
                          setJoin(false);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Create Space
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 p-3 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">1-to-1 Messaging</h3>
                          <p className="text-sm text-base-content/60">
                            Private, secure conversations with real-time messaging
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-secondary/20 p-3 rounded-lg">
                          <Users className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Group Chats</h3>
                          <p className="text-sm text-base-content/60">
                            Connect with multiple users in collaborative spaces
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/20 p-3 rounded-lg">
                          <Video className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Video Calls</h3>
                          <p className="text-sm text-base-content/60">
                            Face-to-face conversations with crystal-clear video
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 p-3 rounded-lg">
                          <Share2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Local Video Streaming</h3>
                          <p className="text-sm text-base-content/60">
                            Stream video to group members without actually sending them
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-base-content/60 text-sm">
                    Start by selecting a conversation from the sidebar or create a new connection above
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
}

export default NoChatSelected;