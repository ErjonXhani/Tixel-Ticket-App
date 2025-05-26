
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, Ticket, User } from "lucide-react";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ResponsiveLayout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Effect to scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  if (isMobile) {
    // Mobile layout with bottom navigation
    return (
      <div className="app-container">
        <main className="pb-16">
          <Outlet />
        </main>
        
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
  }
  
  // Desktop layout with side navigation
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation */}
      <nav className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <img 
            src="/lovable-uploads/4f84f21f-d678-4b27-bf99-b3fed96e6d6b.png" 
            alt="TXL Logo" 
            className="h-12"
          />
        </div>
        
        <div className="flex-1 py-6">
          <div className="space-y-2 px-3">
            <NavLink 
              to="/home" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-[#ff4b00]/10 text-[#ff4b00] border-r-2 border-[#ff4b00]" 
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </NavLink>
            
            <NavLink 
              to="/events" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-[#ff4b00]/10 text-[#ff4b00] border-r-2 border-[#ff4b00]" 
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Calendar className="w-5 h-5 mr-3" />
              Events
            </NavLink>
            
            <NavLink 
              to="/my-tickets" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-[#ff4b00]/10 text-[#ff4b00] border-r-2 border-[#ff4b00]" 
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Ticket className="w-5 h-5 mr-3" />
              My Tickets
            </NavLink>
            
            <NavLink 
              to="/profile" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-[#ff4b00]/10 text-[#ff4b00] border-r-2 border-[#ff4b00]" 
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <User className="w-5 h-5 mr-3" />
              Profile
            </NavLink>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;
