
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, ChevronRight, Edit } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";

const ProfileScreen = () => {
  const { user, logout, isAdmin } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-primary text-white pt-12 pb-8 px-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold mr-4">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">{user?.name || "Guest"}</h2>
            <p className="text-white/80">{user?.email}</p>
            {user?.phone_number && (
              <p className="text-white/80 text-sm">{user.phone_number}</p>
            )}
            {isAdmin && <span className="inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded mt-1">Admin</span>}
          </div>
        </div>
      </div>
      
      {/* Account actions */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full mb-3 justify-between"
              onClick={() => window.location.href = '/admin'}
            >
              <span className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Admin Dashboard
              </span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Settings */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">Settings</h2>
        
        <div className="bg-white rounded-lg shadow-sm divide-y">
          <button 
            className="w-full py-3 px-4 flex justify-between items-center"
            onClick={() => setEditDialogOpen(true)}
          >
            <span>Edit Profile</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="w-full py-3 px-4 flex justify-between items-center">
            <span>Notifications</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="w-full py-3 px-4 flex justify-between items-center">
            <span>Payment Methods</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="w-full py-3 px-4 flex justify-between items-center">
            <span>Help Center</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8 text-xs text-gray-400">
        <p>Tixel App v1.0.0</p>
      </div>

      <EditProfileDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};

export default ProfileScreen;
