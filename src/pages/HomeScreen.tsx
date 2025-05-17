
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Logo from "@/components/ui/logo";

interface Event {
  event_id: number;
  title: string;
  location: string;
  date: string;
  imageUrl: string;
  category: string;
}

const categories = [
  { id: "music", name: "Music", icon: "🎵" },
  { id: "sports", name: "Sports", icon: "🏆" },
  { id: "arts", name: "Arts", icon: "🎭" },
];

const HomeScreen = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("Events")
          .select("*");
          
        if (error) {
          throw error;
        }
        
        // Map Supabase data to our Event interface
        const formattedEvents = data.map((event) => ({
          event_id: event.event_id,
          title: event.title,
          location: event.organizer_name || "Location not specified",
          date: new Date(event.event_date).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          }),
          imageUrl: event.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&auto=format&fit=crop`,
          category: event.category || ["Music", "Sports", "Arts"][Math.floor(Math.random() * 3)],
        }));
        
        setEvents(formattedEvents);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        // If no events in database yet, show placeholder data
        setEvents([
          {
            event_id: 1,
            title: "Summer Music Festival",
            location: "Central Park, New York",
            date: "Jun 15, 2023",
            imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
            category: "Music",
          },
          {
            event_id: 2,
            title: "Tech Conference 2023",
            location: "Convention Center, San Francisco",
            date: "Jul 22-24, 2023",
            imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
            category: "Arts",
          },
          {
            event_id: 3,
            title: "Basketball Finals",
            location: "Sports Arena, Los Angeles",
            date: "Aug 10, 2023",
            imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop",
            category: "Sports",
          },
        ]);
        toast.error("Couldn't load events from database, showing placeholder data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    toast.info(`Searching for "${searchQuery}"...`);
    // For a real implementation, filter events based on search query
    const filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredEvents.length > 0) {
      setEvents(filteredEvents);
      toast.success(`Found ${filteredEvents.length} events matching "${searchQuery}"`);
    } else {
      toast.error(`No events found matching "${searchQuery}"`);
    }
  };

  // Filter events by category
  const filterEventsByCategory = (categoryId: string) => {
    toast.info(`Filtering by ${categoryId}`);
    // Filter events by category
    const filteredEvents = events.filter(event => 
      event.category.toLowerCase() === categoryId
    );
    
    if (filteredEvents.length > 0) {
      setEvents(filteredEvents);
      toast.success(`Found ${filteredEvents.length} ${categoryId} events`);
    } else {
      toast.error(`No ${categoryId} events found`);
      // If no events found, fetch all events again
      const fetchEvents = async () => {
        const { data, error } = await supabase
          .from("Events")
          .select("*");
          
        if (error) {
          toast.error("Error fetching events");
          return;
        }
        
        const formattedEvents = data.map((event) => ({
          event_id: event.event_id,
          title: event.title,
          location: event.organizer_name || "Location not specified",
          date: new Date(event.event_date).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          }),
          imageUrl: event.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&auto=format&fit=crop`,
          category: event.category || ["Music", "Sports", "Arts"][Math.floor(Math.random() * 3)],
        }));
        
        setEvents(formattedEvents);
      };
      
      fetchEvents();
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="pt-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.name || "Guest"}</h1>
          </div>
          <div className="w-10 h-10">
            <Logo size="sm" type="icon" />
          </div>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
            />
            <button type="submit" className="absolute right-4 top-3">
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
        </form>
      </header>
      
      {/* Categories */}
      <div className="mb-6">
        <div className="px-4 mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Categories</h2>
          <Link to="/categories" className="text-[#ff4b00] text-sm">
            See All
          </Link>
        </div>
        
        <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => filterEventsByCategory(category.id)}
              className="flex flex-col items-center min-w-[70px]"
            >
              <div className="w-14 h-14 rounded-full bg-[#fff1eb] flex items-center justify-center text-2xl mb-1">
                {category.icon}
              </div>
              <span className="text-sm text-gray-700">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Events */}
      <div className="mb-6">
        <div className="px-4 mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Events</h2>
          <Link to="/events" className="text-[#ff4b00] text-sm">
            See All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="px-4 flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
            {events.map((event) => (
              <Link
                key={event.event_id}
                to={`/events/${event.event_id}`}
                className="min-w-[280px] block bg-white rounded-lg overflow-hidden shadow"
              >
                <div className="relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-[#ff4b00] text-white text-xs py-1 px-2 rounded">
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
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
