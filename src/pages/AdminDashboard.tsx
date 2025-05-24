
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building, Settings, Plus, Users } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Events", value: "12", icon: Calendar },
    { title: "Total Venues", value: "8", icon: Building },
    { title: "Total Users", value: "245", icon: Users },
    { title: "Active Sectors", value: "32", icon: Settings },
  ];

  const quickActions = [
    { title: "Create Event", path: "/admin/events/create", icon: Calendar, color: "bg-blue-500" },
    { title: "Add Venue", path: "/admin/venues", icon: Building, color: "bg-green-500" },
    { title: "Manage Sectors", path: "/admin/sectors", icon: Settings, color: "bg-purple-500" },
    { title: "Event Pricing", path: "/admin/pricing", icon: MapPin, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-[#ff4b00] mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">{stat.title}</p>
                <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex flex-col md:flex-row items-center">
                  <div className={`${action.color} p-2 rounded-lg mb-2 md:mb-0 md:mr-3`}>
                    <action.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="font-medium text-sm md:text-base text-center md:text-left">{action.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/admin/events" className="block">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#ff4b00] mb-3" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Manage Events</h3>
            <p className="text-sm md:text-base text-gray-600">View, edit, and delete events</p>
          </div>
        </Link>

        <Link to="/admin/venues" className="block">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Building className="w-6 h-6 md:w-8 md:h-8 text-[#ff4b00] mb-3" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Manage Venues</h3>
            <p className="text-sm md:text-base text-gray-600">Add and manage venue locations</p>
          </div>
        </Link>

        <Link to="/admin/sectors" className="block">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Settings className="w-6 h-6 md:w-8 md:h-8 text-[#ff4b00] mb-3" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Manage Sectors</h3>
            <p className="text-sm md:text-base text-gray-600">Configure venue sectors and pricing</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
