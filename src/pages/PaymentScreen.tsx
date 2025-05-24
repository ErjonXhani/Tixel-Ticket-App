
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  
  // Get all necessary parameters from URL
  const eventId = parseInt(searchParams.get("event") || "0");
  const sectorId = parseInt(searchParams.get("sector") || "0");
  const quantity = parseInt(searchParams.get("qty") || "1");
  const price = parseFloat(searchParams.get("price") || "0");
  
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [sector, setSector] = useState<SectorPrice | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [actualUserId, setActualUserId] = useState<number | null>(null);
  
  // Improved user ID resolution
  useEffect(() => {
    const resolveUserId = async () => {
      if (!user) {
        console.log("Payment: No authenticated user");
        toast.error("Please log in to complete payment");
        navigate("/login");
        return;
      }
      
      console.log("Payment: Resolving user ID for auth user:", user.id);
      
      try {
        // Use auth_uid to find the correct user_id in Users table
        const { data, error } = await supabase
          .from("Users")
          .select("user_id")
          .eq("auth_uid", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Payment: Error fetching user ID:", error);
          toast.error("Error loading user information. Please try again.");
          navigate("/home");
          return;
        }
        
        if (data) {
          console.log("Payment: Database user ID found:", data.user_id);
          setActualUserId(data.user_id);
        } else {
          console.log("Payment: No database user found for auth_uid:", user.id);
          toast.error("User profile not found. Please contact support.");
          navigate("/home");
        }
      } catch (error) {
        console.error("Payment: Failed to resolve user ID:", error);
        toast.error("Failed to load user information. Please try again.");
        navigate("/home");
      }
    };
    
    resolveUserId();
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      console.log("Payment: Fetching payment details for event:", eventId, "sector:", sectorId);
      
      if (!eventId || !sectorId) {
        console.log("Payment: Missing event or sector ID");
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
        console.log("Payment: Event data loaded:", eventData);
        setEvent(eventData);
        
        // Fetch sector information
        const { data: sectorData, error: sectorError } = await supabase
          .from("Sectors")
          .select("sector_id, sector_name")
          .eq("sector_id", sectorId)
          .single();
          
        if (sectorError) throw sectorError;
        console.log("Payment: Sector data loaded:", sectorData);
        
        setSector({
          sector_id: sectorData.sector_id,
          sector_name: sectorData.sector_name,
          price: price
        });
        
      } catch (error) {
        console.error("Payment: Error fetching payment details:", error);
        toast.error("Failed to load payment details");
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [eventId, sectorId, navigate, price]);
  
  // Create transaction when user ID is resolved
  useEffect(() => {
    const createTransaction = async () => {
      if (!eventId || !sectorId || !price || !user || !actualUserId) {
        console.log("Payment: Cannot create transaction, missing data:", {
          eventId, sectorId, price, user: !!user, actualUserId
        });
        return;
      }
      
      if (transactionId) {
        console.log("Payment: Transaction already created:", transactionId);
        return;
      }
      
      console.log("Payment: Creating transaction for user_id:", actualUserId);
      
      try {
        const { data, error } = await supabase
          .from("Transactions")
          .insert({
            buyer_id: actualUserId,
            total_amount: price * quantity,
            payment_method: 'Credit Card',
            payment_status: 'Pending',
            ticket_id: null
          })
          .select()
          .single();
          
        if (error) {
          console.error("Payment: Error creating transaction:", error);
          toast.error("Failed to initialize payment");
          return;
        }
        
        if (data) {
          console.log("Payment: Transaction created successfully:", data.transaction_id);
          setTransactionId(data.transaction_id);
        }
        
      } catch (error) {
        console.error("Payment: Error in transaction creation:", error);
        toast.error("Failed to initialize payment");
      }
    };
    
    if (!isLoading && !transactionId && actualUserId) {
      createTransaction();
    }
    
  }, [isLoading, eventId, sectorId, quantity, price, user, transactionId, actualUserId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    if (!transactionId) {
      toast.error("Transaction information is missing");
      return;
    }
    
    if (!actualUserId) {
      toast.error("User information is missing");
      return;
    }
    
    console.log("Payment: Processing payment with transaction_id:", transactionId, "buyer_id:", actualUserId);
    setIsProcessing(true);
    
    try {
      // First, create a ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("Tickets")
        .insert({
          event_id: eventId,
          owner_id: actualUserId,
          sector_id: sectorId,
          status: 'Reserved',
          ticket_type: sector?.sector_name || 'Standard'
        })
        .select()
        .single();
        
      if (ticketError) {
        console.error("Payment: Error creating ticket:", ticketError);
        throw ticketError;
      }
      
      console.log("Payment: Ticket created successfully:", ticketData.ticket_id);
      
      // Then update the transaction with the ticket_id and status
      const { error: transactionError } = await supabase
        .from("Transactions")
        .update({
          ticket_id: ticketData.ticket_id,
          payment_status: 'Paid'
        })
        .eq("transaction_id", transactionId);
        
      if (transactionError) {
        console.error("Payment: Error updating transaction:", transactionError);
        throw transactionError;
      }
      
      console.log("Payment: Transaction updated successfully to Paid status");
      
      // Success!
      setPaymentSuccess(true);
      toast.success("Payment successful! Your ticket has been confirmed.");
      
      // Wait 2 seconds then navigate to home screen
      setTimeout(() => {
        navigate("/home");
      }, 2000);
      
    } catch (error) {
      console.error("Payment: Payment processing error:", error);
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
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
  
  // Success screen
  if (paymentSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-green-50">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2 text-center">Payment Successful!</h2>
        <p className="text-center text-green-700 mb-6">
          Your ticket has been confirmed and added to your account.
        </p>
        <Button 
          onClick={() => navigate("/home")}
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 px-6"
        >
          Go to Home
        </Button>
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
            disabled={isProcessing || !actualUserId}
          >
            {isProcessing ? "Processing..." : "Confirm & Pay"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;
