import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useSpaceStore } from "../store/useSpaceStore";
import InfoSkeleton from "../components/skeletons/InfoSkeleton";
import WatchHistory from "../components/WatchHistory";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedSpace } = useSpaceStore()

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-[calc(100vh-4rem)]">
          <div className="flex h-full overflow-hidden">
            <Sidebar />
            <InfoSkeleton />
            {!selectedUser && !selectedSpace ? <NoChatSelected /> : <>
              <ChatContainer />
              <WatchHistory />
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;