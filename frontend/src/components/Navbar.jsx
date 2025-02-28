import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useSpaceStore } from "../store/useSpaceStore";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const {setSelectedSpace} = useSpaceStore()
  const {setSelectedUser} = useChatStore()
  const navigate = useNavigate()

  const handleClick = () => {
    setSelectedSpace(null)
    setSelectedUser(null)
    navigate('/')
  }

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-300/90 px-4">
      <div className="container mx-auto flex justify-between items-center h-16">
        <button onClick={handleClick} className="flex items-center gap-2.5 hover:opacity-80 transition">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-primary">SwiftChat</h1>
        </button>

        <div className="flex items-center gap-1">
          <Link to="/settings" className="btn btn-sm rounded-full hover:btn-primary">
            <Settings className="w-4 h-4" />
          </Link>

          {authUser && (
            <>
              <Link to="/profile" className="btn btn-sm rounded-full hover:btn-primary">
                <User className="size-5" />
              </Link>
              <button onClick={logout} className="rounded-full btn btn-sm hover:btn-primary">
                <LogOut className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
