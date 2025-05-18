
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Search, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const filters = [
  { name: "All", value: "all" },
  { name: "Today", value: "today" },
  { name: "This week", value: "week" },
  { name: "This month", value: "month" },
];

const categories = [
  { name: "Music", value: "music" },
  { name: "Sports", value: "sports" },
  { name: "Arts", value: "arts" },
];

const EventsScreen = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch events and venues from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from("Events")
          .select("*")
          .order("event_id", { ascending: false });
          
        if (eventsError) {
          throw eventsError;
        }
        
        // Fetch all venues
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
          setFilteredEvents(eventsWithVenues);
        } else {
          toast.info("No events found in the database");
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Couldn't load events from database");
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      // Reset to current category filter if search is cleared
      applyFilters(activeFilter, activeCategory);
    }
  };
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    const results = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.organizer_name && event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.category && event.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.venue_name && event.venue_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredEvents(results);
    if (results.length === 0) {
      toast.info(`No events found matching "${searchTerm}"`);
    }
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
  
  // Apply time and category filters
  const applyFilters = (timeFilter: string, categoryFilter: string | null) => {
    setActiveFilter(timeFilter);
    setActiveCategory(categoryFilter);
    
    let filtered = [...events];
    
    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setMonth(thisMonth.getMonth() - 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);
        
        if (timeFilter === "today") {
          return eventDate >= today && eventDate < new Date(today.getTime() + 86400000);
        } else if (timeFilter === "week") {
          return eventDate >= thisWeek;
        } else if (timeFilter === "month") {
          return eventDate >= thisMonth;
        }
        return true;
      });
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(event => 
        event.category && event.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    setFilteredEvents(filtered);
    
    // Show toast notification with results
    if (filtered.length === 0) {
      if (categoryFilter) {
        toast.info(`No ${categoryFilter} events found${timeFilter !== 'all' ? ` for the selected time period` : ''}`);
      } else {
        toast.info(`No events found for the selected time period`);
      }
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setActiveFilter("all");
    setActiveCategory(null);
    setSearchTerm("");
    setFilteredEvents(events);
    setOpenFilter(false);
  };
  
  // Navigate to event details
  const goToEventDetails = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };
  
  return (
    <div className="pb-6">
      {/* Header */}
      <header className="bg-[#ff4b00] pt-6 pb-4 px-4 rounded-b-3xl shadow">
        <h1 className="text-2xl font-bold text-white mb-4">Events</h1>
        
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-white rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button type="submit" className="absolute right-4 top-3">
            <Search className="text-gray-400 w-5 h-5" />
          </button>
        </form>
        
        {/* Filters */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeFilter === filter.value
                    ? "bg-white text-[#ff4b00] font-medium"
                    : "bg-[#ff4b00]/80 text-white/80"
                }`}
                onClick={() => applyFilters(filter.value, activeCategory)}
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
            <ArrowDown className={`ml-1 h-3 w-3 transition-transform ${openFilter ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </header>
      
      {/* Filter panel */}
      {openFilter && (
        <div className="px-4 py-3 bg-white shadow-md">
          <h3 className="font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <button 
                key={category.value}
                className={`px-3 py-1 rounded-full text-xs ${
                  activeCategory === category.value
                    ? "bg-[#ff4b00] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => applyFilters(activeFilter, category.value)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
              onClick={() => setOpenFilter(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
      
      {/* Events list */}
      {isLoading ? (
        <div className="px-4 flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="mt-6 px-4 space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.event_id}
                onClick={() => goToEventDetails(event.event_id)}
                className="block bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
              >
                <div className="flex h-24">
                  <div className="h-full w-1/3 flex-shrink-0">
                    <img
                      src={event.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&auto=format&fit=crop`}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-xs mt-2">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{formatEventDate(event.event_date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.venue_name || "Venue not specified"}</span>
                    </div>
                    
                    {event.category && (
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                          {event.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-8 text-center">
              <p className="text-gray-500">No events found</p>
              {(activeFilter !== "all" || activeCategory || searchTerm) && (
                <button 
                  onClick={resetFilters}
                  className="mt-2 text-[#ff4b00] underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsScreen;
