
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, Search, User } from "lucide-react";
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
      <nav className="bottom-nav">
        <NavLink 
          to="/home" 
          className={({isActive}) => 
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/events" 
          className={({isActive}) => 
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span>Events</span>
        </NavLink>
        
        <NavLink 
          to="/search" 
          className={({isActive}) => 
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Search className="w-5 h-5 mb-1" />
          <span>Search</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({isActive}) => 
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <User className="w-5 h-5 mb-1" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MobileLayout;
