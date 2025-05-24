
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Building, Settings, DollarSign, Home, LogOut } from "lucide-react";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
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
    <div className="flex h-screen">
      {/* Admin sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#ff4b00]">Tixel Admin</h1>
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
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 w-full text-left text-gray-300"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Admin content */}
      <main className="flex-1 p-8 bg-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
