
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowLeft, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock data (in a real app, we would fetch this from an API)
const eventData = {
  id: "1",
  title: "Summer Music Festival",
  description: "Experience the best of summer with live performances from top artists across three stages. Food trucks, art installations, and more in the heart of Central Park.",
  location: "Central Park, New York",
  venue: "Great Lawn",
  date: "Jun 15, 2023",
  time: "12:00 PM - 10:00 PM",
  imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
  category: "Music",
  organizer: "NYC Events",
  price: "$45",
  availableTickets: 156,
  ticketTypes: [
    { id: "standard", name: "Standard Entry", price: 45, remaining: 120 },
    { id: "vip", name: "VIP Package", price: 120, remaining: 36 },
  ]
};

const EventDetailsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(eventData.ticketTypes[0]);
  const [quantity, setQuantity] = useState(1);
  
  // In a real app, we'd fetch the event data based on the ID
  const event = eventData;
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handlePurchase = () => {
    toast.success(`Reserved ${quantity} ${selectedTicket.name} ticket${quantity > 1 ? 's' : ''}!`);
    // In a real app, we would navigate to checkout or show a confirmation
    setTimeout(() => {
      navigate("/home");
    }, 2000);
  };

  return (
    <div className="pb-20">
      {/* Event image */}
      <div className="relative h-64">
        <img
          src={event.imageUrl}
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
          <span className="inline-block bg-primary text-white text-xs font-medium px-2 py-1 rounded mb-1">
            {event.category}
          </span>
          <h1 className="text-white text-xl font-bold">{event.title}</h1>
        </div>
      </div>
      
      {/* Event details */}
      <div className="px-4 py-4">
        <div className="flex items-center text-gray-700 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{event.date}</span>
          <span className="mx-2">•</span>
          <Clock className="w-4 h-4 mr-2" />
          <span>{event.time}</span>
        </div>
        
        <div className="flex items-start text-gray-700 mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-0.5" />
          <div>
            <div>{event.venue}</div>
            <div className="text-gray-500 text-sm">{event.location}</div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-700 mb-6">
          <User className="w-4 h-4 mr-2" />
          <span>Organized by {event.organizer}</span>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About This Event</h2>
          <p className="text-gray-700">{event.description}</p>
        </div>
        
        {/* Ticket selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Tickets</h2>
          
          <div className="space-y-3">
            {event.ticketTypes.map((ticket) => (
              <div 
                key={ticket.id}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedTicket.id === ticket.id 
                    ? "border-primary bg-primary-50" 
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
          <p className="text-xl font-bold">${selectedTicket.price * quantity}</p>
        </div>
        
        <Button 
          className="bg-accent hover:bg-accent/90 px-6"
          onClick={handlePurchase}
        >
          Reserve Tickets
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsScreen;
