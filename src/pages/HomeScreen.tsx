
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock data
const featuredEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    location: "Central Park, New York",
    date: "Jun 15, 2023",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
    category: "Music",
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    location: "Convention Center, San Francisco",
    date: "Jul 22-24, 2023",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    category: "Technology",
  },
  {
    id: 3,
    title: "Basketball Finals",
    location: "Sports Arena, Los Angeles",
    date: "Aug 10, 2023",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop",
    category: "Sports",
  },
];

const categories = [
  { id: "music", name: "Music", icon: "🎵" },
  { id: "sports", name: "Sports", icon: "🏆" },
  { id: "arts", name: "Arts", icon: "🎭" },
  { id: "food", name: "Food", icon: "🍔" },
  { id: "tech", name: "Tech", icon: "💻" },
];

const trendingEvents = [
  {
    id: 4,
    title: "Stand-up Comedy Night",
    location: "Comedy Club, Chicago",
    date: "Jun 20, 2023",
    imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Food & Wine Festival",
    location: "Downtown, Seattle",
    date: "Jul 5-7, 2023",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop",
  },
];

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="pt-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.name || "Guest"}</h1>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.name?.[0]?.toUpperCase() || "G"}
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search events, venues..."
            className="w-full bg-gray-100 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="absolute right-4 top-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </header>
      
      {/* Categories */}
      <div className="mb-6">
        <div className="px-4 mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Categories</h2>
          <Link to="/categories" className="text-primary text-sm">
            See All
          </Link>
        </div>
        
        <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/events?category=${category.id}`}
              className="flex flex-col items-center min-w-[70px]"
            >
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-2xl mb-1">
                {category.icon}
              </div>
              <span className="text-sm text-gray-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Featured Events */}
      <div className="mb-6">
        <div className="px-4 mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Featured Events</h2>
          <Link to="/events" className="text-primary text-sm">
            See All
          </Link>
        </div>
        
        <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
          {featuredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="min-w-[280px] block bg-white rounded-lg overflow-hidden shadow"
            >
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-36 w-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-white text-xs py-1 px-2 rounded">
                  {event.category}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold">{event.title}</h3>
                
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Trending Now */}
      <div className="mb-6">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-bold">Trending Now</h2>
        </div>
        
        <div className="px-4 space-y-4">
          {trendingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="flex bg-white rounded-lg overflow-hidden shadow"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-24 w-24 object-cover"
              />
              
              <div className="p-3 flex-1">
                <h3 className="font-semibold">{event.title}</h3>
                
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
