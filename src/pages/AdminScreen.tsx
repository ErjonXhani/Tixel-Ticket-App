
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    location: "Central Park, New York",
    date: "Jun 15, 2023",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
    category: "Music",
    status: "Published",
    ticketsSold: 245,
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    location: "Convention Center, San Francisco",
    date: "Jul 22-24, 2023",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    category: "Technology",
    status: "Published",
    ticketsSold: 187,
  },
  {
    id: 3,
    title: "Basketball Finals",
    location: "Sports Arena, Los Angeles",
    date: "Aug 10, 2023",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop",
    category: "Sports",
    status: "Draft",
    ticketsSold: 0,
  },
];

const AdminScreen = () => {
  const [events, setEvents] = useState(mockEvents);
  
  const handleDeleteEvent = (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    
    if (confirmDelete) {
      setEvents(events.filter(event => event.id !== id));
      toast.success("Event deleted successfully");
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <Link to="/admin/events/create">
          <Button className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Total Events</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Tickets Sold</p>
          <p className="text-2xl font-bold">
            {events.reduce((total, event) => total + event.ticketsSold, 0)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Revenue</p>
          <p className="text-2xl font-bold">$25,320</p>
        </div>
      </div>
      
      {/* Events table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Manage Events</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Event</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Location</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Sold</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{event.date}</td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate">{event.location}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{event.ticketsSold}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Link to={`/admin/events/edit/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {events.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No events found. Create your first event!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
