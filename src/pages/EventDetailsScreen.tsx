import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowLeft, User, Clock } from "lucide-react";
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
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  remaining: number;
}

const EventDetailsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: "standard", name: "Standard Entry", price: 45, remaining: 120 },
    { id: "vip", name: "VIP Package", price: 120, remaining: 36 },
  ]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("Events")
          .select("*")
          .eq("event_id", parseInt(id))
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setEvent(data);
          // Once we have real ticket data, we would fetch that here too
        } else {
          toast.error("Event not found");
          navigate("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, navigate]);
  
  useEffect(() => {
    // Set first ticket type as default selected
    if (ticketTypes.length > 0 && !selectedTicket) {
      setSelectedTicket(ticketTypes[0]);
    }
  }, [ticketTypes, selectedTicket]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handlePurchase = () => {
    if (!selectedTicket) {
      toast.error("Please select a ticket type");
      return;
    }
    
    toast.success(`Reserved ${quantity} ${selectedTicket.name} ticket${quantity > 1 ? 's' : ''}!`);
    // In a real app, we would save this to the database
    setTimeout(() => {
      navigate("/home");
    }, 2000);
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
            <div>{event.organizer_name || "Venue not specified"}</div>
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
        
        {/* Ticket selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Tickets</h2>
          
          <div className="space-y-3">
            {ticketTypes.map((ticket) => (
              <div 
                key={ticket.id}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedTicket?.id === ticket.id 
                    ? "border-[#ff4b00] bg-[#ff4b00]/5" 
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{ticket.name}</h3>
                    <p className="text-sm text-gray-500">{ticket.remaining} remaining</p>
                  </div>
                  <div className="text-lg font-semibold">${ticket.price}</div>
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
              disabled={quantity >= 10}
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
          <p className="text-xl font-bold">${selectedTicket ? selectedTicket.price * quantity : 0}</p>
        </div>
        
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 px-6"
          onClick={handlePurchase}
        >
          Reserve Tickets
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsScreen;
