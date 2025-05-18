
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  event_id: number;
  title: string;
  organizer_name: string;
  event_date: string;
  image: string;
  category: string;
  description: string;
  venue_id?: number;
  venue_name?: string;
}

interface Venue {
  venue_id: number;
  name: string;
  location: string;
}

const categories = [
  { id: "music", name: "Music", icon: "🎵" },
  { id: "sports", name: "Sports", icon: "🏆" },
  { id: "arts", name: "Arts", icon: "🎭" },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryFilterActive, setCategoryFilterActive] = useState(false);
  const [venues, setVenues] = useState<Record<number, string>>({});

  // Fetch events from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from("Events")
          .select("*")
          .order("event_id", { ascending: false })
          .limit(20);
          
        if (eventsError) {
          throw eventsError;
        }
        
        // Fetch venues
        const { data: venuesData, error: venuesError } = await supabase
          .from("Venues")
          .select("*");
          
        if (venuesError) {
          throw venuesError;
        }
        
        // Create venue lookup table
        const venueMap: Record<number, string> = {};
        if (venuesData) {
          venuesData.forEach((venue: Venue) => {
            venueMap[venue.venue_id] = venue.name;
          });
        }
        setVenues(venueMap);
        
        // Add venue names to events
        const eventsWithVenues = eventsData ? eventsData.map((event: Event) => ({
          ...event,
          venue_name: event.venue_id ? venueMap[event.venue_id] : undefined
        })) : [];
        
        if (eventsWithVenues && eventsWithVenues.length > 0) {
          setEvents(eventsWithVenues);
          // Initially show only the 4 most recent events
          setFilteredEvents(eventsWithVenues.slice(0, 4));
        } else {
          toast.info("No events found in the database");
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (error: any) {
        console.error("Error fetching events:", error);
        toast.error("Couldn't load events from database");
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    toast.info(`Searching for "${searchQuery}"...`);
    
    const searchResults = events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.organizer_name && event.organizer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.venue_name && event.venue_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    if (searchResults.length > 0) {
      setFilteredEvents(searchResults);
      setCategoryFilterActive(true);
      setSelectedCategory(null);
      toast.success(`Found ${searchResults.length} events matching "${searchQuery}"`);
    } else {
      setFilteredEvents([]);
      setCategoryFilterActive(true);
      setSelectedCategory(null);
      toast.error(`No events found matching "${searchQuery}"`);
    }
  };

  // Filter events by category
  const filterEventsByCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryFilterActive(true);
    
    const lowerCaseCategoryId = categoryId.toLowerCase();
    const categoryEvents = events.filter(event => 
      event.category && event.category.toLowerCase() === lowerCaseCategoryId
    );
    
    if (categoryEvents.length > 0) {
      setFilteredEvents(categoryEvents);
      toast.success(`Showing ${categoryEvents.length} ${categoryId} events`);
    } else {
      setFilteredEvents([]);
      toast.info(`No ${categoryId} events found`);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setCategoryFilterActive(false);
    setFilteredEvents(events.slice(0, 4));
  };

  // Format date for display
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="pb-6">
      {/* Updated logo header */}
      <div className="py-4 flex justify-end pr-4">
        <img 
          src="/lovable-uploads/4f84f21f-d678-4b27-bf99-b3fed96e6d6b.png" 
          alt="TXL Logo" 
          className="h-10"
        />
      </div>
      
      {/* Welcome section */}
      <header className="pt-2 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.name || "Guest"}</h1>
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
          <button 
            onClick={resetFilters}
            className={`text-[#ff4b00] text-sm ${categoryFilterActive ? 'visible' : 'invisible'}`}
          >
            Reset filters
          </button>
        </div>
        
        <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => filterEventsByCategory(category.id)}
              className={`flex flex-col items-center min-w-[70px] ${
                selectedCategory === category.id ? "opacity-100" : "opacity-70"
              }`}
            >
              <div className={`w-14 h-14 rounded-full ${
                selectedCategory === category.id 
                  ? "bg-[#ff4b00]/20 ring-2 ring-[#ff4b00]" 
                  : "bg-[#fff1eb]"
                } flex items-center justify-center text-2xl mb-1`}>
                {category.icon}
              </div>
              <span className={`text-sm ${
                selectedCategory === category.id
                  ? "text-[#ff4b00] font-medium" 
                  : "text-gray-700"
              }`}>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Trending Now */}
      <div className="mb-6">
        <div className="px-4 mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Trending Now</h2>
          <Link to="/events" className="text-[#ff4b00] text-sm">
            See All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="px-4 flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="flex overflow-x-auto px-4 space-x-4 pb-2 no-scrollbar">
            {filteredEvents.map((event) => (
              <div
                key={event.event_id}
                onClick={() => navigate(`/events/${event.event_id}`)}
                className="min-w-[280px] block bg-white rounded-lg overflow-hidden shadow cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={event.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&auto=format&fit=crop`}
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
                    <span>{formatEventDate(event.event_date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{event.venue_name || "Venue not specified"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500">
              {selectedCategory 
                ? `No ${selectedCategory} events found` 
                : "No events found matching your criteria"}
            </p>
            {categoryFilterActive && (
              <button 
                onClick={resetFilters} 
                className="mt-2 text-[#ff4b00] underline"
              >
                Show all events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
