import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useSpaceStore } from "../store/useSpaceStore";
import InfoSkeleton from "../components/skeletons/InfoSkeleton";
import WatchHistory from "../components/WatchHistory";
import VideoCall from "../components/VideoCall";
import { useVideoStore } from "../store/useVideoStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedSpace } = useSpaceStore();
  const {isInCall, myPeerId} = useVideoStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-[calc(100vh-4rem)]">
          <div className="flex h-full overflow-hidden w-full">
            <Sidebar />
            <InfoSkeleton />
            {!selectedUser && !selectedSpace ? <NoChatSelected /> : (!isInCall || !myPeerId) ? <>
              <ChatContainer />
              <WatchHistory />
            </> : <>
              <ChatContainer />
              <div className="w-full lg:max-w-[30%]">
                <VideoCall />
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;