
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, User, Ticket, MapPin, ChevronRight } from "lucide-react";

const ProfileScreen = () => {
  const { user, logout, isAdmin } = useAuth();

  // Mock data
  const upcomingEvents = [
    {
      id: 1,
      title: "Summer Music Festival",
      date: "Jun 15, 2023",
      location: "Central Park, New York",
      imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-primary text-white pt-12 pb-8 px-4 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold mr-4">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">{user?.name || "Guest"}</h2>
            <p className="text-white/80">{user?.email}</p>
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
      
      {/* My Tickets */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center">
          <Ticket className="w-5 h-5 mr-2" />
          My Tickets
        </h2>
        
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-16 h-16 rounded-md object-cover"
                />
                
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="text-primary">
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tickets purchased yet</p>
            <Button variant="link" className="text-primary mt-2">
              Browse Events
            </Button>
          </div>
        )}
      </div>
      
      {/* Settings */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">Settings</h2>
        
        <div className="bg-white rounded-lg shadow-sm divide-y">
          <button className="w-full py-3 px-4 flex justify-between items-center">
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
    </div>
  );
};

export default ProfileScreen;
