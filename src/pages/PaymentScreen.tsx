
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectorPrice {
  sector_id: number;
  sector_name: string;
  price: number;
}

interface Event {
  event_id: number;
  title: string;
  image: string;
}

const PaymentScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("event");
  const sectorId = searchParams.get("sector");
  const quantity = parseInt(searchParams.get("qty") || "1");
  
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [sector, setSector] = useState<SectorPrice | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!eventId || !sectorId) {
        toast.error("Missing payment information");
        navigate("/events");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("Events")
          .select("event_id, title, image")
          .eq("event_id", eventId)
          .single();
          
        if (eventError) throw eventError;
        setEvent(eventData);
        
        // Fetch sector pricing
        const { data: pricingData, error: pricingError } = await supabase
          .from("EventSectorPricing")
          .select(`
            sector_id,
            price,
            Sectors(sector_name)
          `)
          .eq("event_id", eventId)
          .eq("sector_id", sectorId)
          .single();
          
        if (pricingError) throw pricingError;
        
        setSector({
          sector_id: pricingData.sector_id,
          sector_name: pricingData.Sectors.sector_name,
          price: pricingData.price
        });
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to load payment details");
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [eventId, sectorId, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success("Payment successful! Tickets have been added to your account");
      navigate("/home");
    }, 2000);
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>
      
      {/* Order summary */}
      {event && sector && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          
          <div className="flex mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {event.image && (
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="ml-4">
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-500">
                {sector.sector_name} - {quantity} {quantity > 1 ? "tickets" : "ticket"}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span>Price per ticket</span>
              <span>${sector.price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            
            <div className="flex justify-between font-semibold text-lg mt-3">
              <span>Total</span>
              <span>${(sector.price * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment form */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-4">
          <CreditCard className="w-5 h-5 mr-2 text-[#ff4b00]" />
          <h2 className="font-semibold">Payment Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium mb-1">
              Cardholder Name
            </label>
            <Input
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Smith"
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <Input
                id="expiry"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                CVV
              </label>
              <Input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={4}
                type="password"
                className="w-full"
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90 mt-6"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;
