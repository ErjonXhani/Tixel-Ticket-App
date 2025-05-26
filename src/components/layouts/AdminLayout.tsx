
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Building, Settings, DollarSign, Home, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Protect admin routes
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const navItems = [
    { to: "/admin", icon: Home, label: "Dashboard", end: true },
    { to: "/admin/events", icon: Calendar, label: "Events" },
    { to: "/admin/venues", icon: Building, label: "Venues" },
    { to: "/admin/sectors", icon: Settings, label: "Sectors" },
    { to: "/admin/pricing", icon: DollarSign, label: "Pricing" },
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Admin sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white p-4 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/67b13937-5637-404a-a2fb-861ee71f0679.png" 
              alt="TXL Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink 
              key={to}
              to={to}
              end={end}
              className={({isActive}) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-[#ff4b00] text-white" 
                    : "hover:bg-gray-800 text-gray-300"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 w-full text-left text-gray-300"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Admin content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/67b13937-5637-404a-a2fb-861ee71f0679.png" 
              alt="TXL Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
