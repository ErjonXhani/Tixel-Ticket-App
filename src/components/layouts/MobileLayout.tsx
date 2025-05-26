
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, Ticket, User } from "lucide-react";
import { useEffect } from "react";

const MobileLayout = () => {
  const location = useLocation();
  
  // Effect to scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="app-container">
      {/* Main content area */}
      <main className="pb-16">
        <Outlet />
      </main>
      
      {/* Bottom navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-1 safe-bottom z-10">
        <NavLink 
          to="/home" 
          className={({isActive}) => 
            `flex flex-col items-center justify-center p-2 ${isActive ? "text-[#ff4b00]" : "text-gray-600"}`
          }
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </NavLink>
        
        <NavLink 
          to="/events" 
          className={({isActive}) => 
            `flex flex-col items-center justify-center p-2 ${isActive ? "text-[#ff4b00]" : "text-gray-600"}`
          }
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-xs">Events</span>
        </NavLink>
        
        <NavLink 
          to="/my-tickets" 
          className={({isActive}) => 
            `flex flex-col items-center justify-center p-2 ${isActive ? "text-[#ff4b00]" : "text-gray-600"}`
          }
        >
          <Ticket className="w-5 h-5 mb-1" />
          <span className="text-xs">My Tickets</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({isActive}) => 
            `flex flex-col items-center justify-center p-2 ${isActive ? "text-[#ff4b00]" : "text-gray-600"}`
          }
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MobileLayout;
