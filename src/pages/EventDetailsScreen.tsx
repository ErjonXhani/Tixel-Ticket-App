
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowLeft, User, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  event_id: number;
  title: string;
  description: string;
  organizer_name: string;
  event_date: string;
  image: string;
  category: string;
  venue_id?: number;
  venue_name?: string;
}

interface SectorPrice {
  pricing_id: number;
  sector_id: number;
  sector_name: string;
  price: number;
  available_tickets: number;
}

const EventDetailsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectorPrices, setSectorPrices] = useState<SectorPrice[]>([]);
  const [selectedSector, setSelectedSector] = useState<SectorPrice | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("Events")
          .select("*, Venues(name)")
          .eq("event_id", parseInt(id))
          .single();
          
        if (eventError) {
          throw eventError;
        }
        
        if (eventData) {
          const formattedEvent = {
            ...eventData,
            venue_name: eventData.Venues?.name,
          };
          setEvent(formattedEvent);
          
          // Fetch sector pricing for this event
          const { data: pricingData, error: pricingError } = await supabase
            .from("EventSectorPricing")
            .select(`
              pricing_id,
              price,
              available_tickets,
              sector_id,
              Sectors(sector_name)
            `)
            .eq("event_id", parseInt(id));
            
          if (pricingError) {
            throw pricingError;
          }
          
          if (pricingData && pricingData.length > 0) {
            const formattedPricing = pricingData.map(item => ({
              pricing_id: item.pricing_id,
              sector_id: item.sector_id,
              sector_name: item.Sectors.sector_name,
              price: item.price,
              available_tickets: item.available_tickets
            }));
            
            setSectorPrices(formattedPricing);
            // Select first sector by default
            setSelectedSector(formattedPricing[0]);
          } else {
            console.log("No pricing data found for this event");
            // Fallback to dummy data if no pricing found
            setSectorPrices([
              { pricing_id: 0, sector_id: 0, sector_name: "General Admission", price: 49.99, available_tickets: 100 },
              { pricing_id: 1, sector_id: 1, sector_name: "VIP", price: 99.99, available_tickets: 50 }
            ]);
          }
        } else {
          toast.error("Event not found");
          navigate("/events");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, navigate]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handlePurchase = () => {
    if (!selectedSector) {
      toast.error("Please select a ticket type");
      return;
    }
    
    if (!id) {
      toast.error("Event information is missing");
      return;
    }
    
    // In a real app, we would redirect to a payment gateway
    toast.success(`Processing payment for ${quantity} ${selectedSector.sector_name} ticket${quantity > 1 ? 's' : ''}...`);
    
    // Navigate to a payment page
    navigate(`/payment?event=${id}&sector=${selectedSector.sector_id}&qty=${quantity}`);
  };
  
  // Format date for display
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "";
    
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
  
  // Format time for display (placeholder since we don't have time data yet)
  const formatEventTime = (dateString?: string) => {
    if (!dateString) return "TBD";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return "TBD";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate("/events")}
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
        >
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Event image */}
      <div className="relative h-64">
        <img
          src={event.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&auto=format&fit=crop`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="inline-block bg-[#ff4b00] text-white text-xs font-medium px-2 py-1 rounded mb-1">
            {event.category}
          </span>
          <h1 className="text-white text-xl font-bold">{event.title}</h1>
        </div>
      </div>
      
      {/* Event details */}
      <div className="px-4 py-4">
        <div className="flex items-center text-gray-700 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatEventDate(event.event_date)}</span>
          <span className="mx-2">•</span>
          <Clock className="w-4 h-4 mr-2" />
          <span>{formatEventTime(event.event_date)} - {formatEventTime(event.event_date)}</span>
        </div>
        
        <div className="flex items-start text-gray-700 mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-0.5" />
          <div>
            <div>{event.venue_name || "Venue not specified"}</div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-700 mb-6">
          <User className="w-4 h-4 mr-2" />
          <span>Organized by {event.organizer_name || "Unknown organizer"}</span>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About This Event</h2>
          <p className="text-gray-700">{event.description || "No description available."}</p>
        </div>
        
        {/* Ticket selection - Updated to use real sectors */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Ticket className="w-5 h-5 mr-2 text-[#ff4b00]" />
            <h2 className="text-lg font-semibold">Select Tickets</h2>
          </div>
          
          <div className="space-y-3">
            {sectorPrices.map((sector) => (
              <div 
                key={sector.sector_id}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedSector?.sector_id === sector.sector_id 
                    ? "border-[#ff4b00] bg-[#ff4b00]/5" 
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedSector(sector)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{sector.sector_name}</h3>
                    <p className="text-sm text-gray-500">{sector.available_tickets} tickets available</p>
                  </div>
                  <div className="text-lg font-semibold">${sector.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quantity selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Quantity</h2>
          
          <div className="flex items-center">
            <button 
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            
            <span className="mx-6 text-lg font-medium">{quantity}</span>
            
            <button 
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 10 || (selectedSector && quantity >= selectedSector.available_tickets)}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Price</p>
          <p className="text-xl font-bold">${selectedSector ? (selectedSector.price * quantity).toFixed(2) : "0.00"}</p>
        </div>
        
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 px-6"
          onClick={handlePurchase}
        >
          Buy Tickets
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsScreen;
