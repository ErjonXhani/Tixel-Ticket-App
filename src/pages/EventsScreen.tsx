
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Search, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const events = [
  {
    id: 1,
    title: "Summer Music Festival",
    location: "Central Park, New York",
    date: "Jun 15, 2023",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
    category: "Music",
    price: "$45",
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    location: "Convention Center, San Francisco",
    date: "Jul 22-24, 2023",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    category: "Technology",
    price: "$299",
  },
  {
    id: 3,
    title: "Basketball Finals",
    location: "Sports Arena, Los Angeles",
    date: "Aug 10, 2023",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop",
    category: "Sports",
    price: "$85",
  },
  {
    id: 4,
    title: "Stand-up Comedy Night",
    location: "Comedy Club, Chicago",
    date: "Jun 20, 2023",
    imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop",
    category: "Entertainment",
    price: "$30",
  },
  {
    id: 5,
    title: "Food & Wine Festival",
    location: "Downtown, Seattle",
    date: "Jul 5-7, 2023",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop",
    category: "Food",
    price: "$75",
  },
  {
    id: 6,
    title: "Art Exhibition Opening",
    location: "Modern Gallery, Boston",
    date: "Jun 28, 2023",
    imageUrl: "https://images.unsplash.com/photo-1581331474665-a0bbee7dfba9?w=800&auto=format&fit=crop",
    category: "Arts",
    price: "$15",
  },
];

const filters = [
  { name: "All", value: "all" },
  { name: "Today", value: "today" },
  { name: "This week", value: "week" },
  { name: "This month", value: "month" },
];

const EventsScreen = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  
  const filteredEvents = events.filter((event) => {
    if (searchTerm) {
      return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             event.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });
  
  return (
    <div className="pb-6">
      {/* Header */}
      <header className="bg-primary pt-6 pb-4 px-4 rounded-b-3xl shadow">
        <h1 className="text-2xl font-bold text-white mb-4">Events</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <Search className="absolute right-4 top-3 text-gray-400 w-5 h-5" />
        </div>
        
        {/* Filters */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeFilter === filter.value
                    ? "bg-white text-primary font-medium"
                    : "bg-primary-500 text-white/80"
                }`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.name}
              </button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenFilter(!openFilter)}
            className="text-white flex items-center whitespace-nowrap"
          >
            <span>Filter</span>
            <ArrowDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </header>
      
      {/* Filter panel (simplified for now) */}
      {openFilter && (
        <div className="px-4 py-3 bg-white shadow-md">
          <h3 className="font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <button className="px-3 py-1 bg-primary-100 text-primary rounded-full text-xs">
              Music
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              Sports
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              Arts
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              Technology
            </button>
          </div>
          
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" className="mr-2">
              Reset
            </Button>
            <Button size="sm" className="bg-primary">
              Apply
            </Button>
          </div>
        </div>
      )}
      
      {/* Events list */}
      <div className="mt-6 px-4 space-y-4">
        {filteredEvents.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="block bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="flex">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-1/3 object-cover"
              />
              
              <div className="p-3 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                  <span className="text-accent font-semibold text-sm">{event.price}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs mt-2">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                    {event.category}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </div>
  );
};

export default EventsScreen;
