
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  // Protect admin routes
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  return (
    <div className="flex h-screen">
      {/* Admin sidebar */}
      <aside className="w-64 bg-primary-800 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Tixel Admin</h1>
        </div>
        
        <nav className="space-y-1">
          <NavLink 
            to="/admin" 
            end
            className={({isActive}) => 
              `block px-4 py-2 rounded ${isActive ? "bg-primary-700" : "hover:bg-primary-700"}`
            }
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/admin/events/create" 
            className={({isActive}) => 
              `block px-4 py-2 rounded ${isActive ? "bg-primary-700" : "hover:bg-primary-700"}`
            }
          >
            Add New Event
          </NavLink>
          
          <div className="pt-4 mt-4 border-t border-primary-700">
            <button
              onClick={logout}
              className="block px-4 py-2 rounded hover:bg-primary-700 w-full text-left"
            >
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
