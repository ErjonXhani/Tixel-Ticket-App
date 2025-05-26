
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, MapPin, LogIn, ShoppingBag } from "lucide-react";

interface UserTicket {
  ticket_id: number;
  event_id: number;
  sector_id: number;
  ticket_type: string;
  status: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  sector_name: string;
  original_price: number;
}

const MyTicketsScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching tickets for user:", user.id);
        
        // First get the user_id from the Users table
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("user_id")
          .eq("auth_uid", user.id)
          .single();

        if (userError || !userData) {
          console.error("User not found:", userError);
          setError("User account not found. Please contact support.");
          return;
        }

        console.log("Found user_id:", userData.user_id);

        // Get tickets for this user with all related information
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("Tickets")
          .select(`
            ticket_id,
            event_id,
            sector_id,
            ticket_type,
            status,
            Events!inner(
              title,
              event_date,
              Venues!inner(name)
            ),
            Sectors!inner(sector_name)
          `)
          .eq("owner_id", userData.user_id)
          .in("status", ["Reserved", "Owned"]);

        if (ticketsError) {
          console.error("Error fetching tickets:", ticketsError);
          throw ticketsError;
        }

        console.log("Tickets data:", ticketsData);

        // Now get pricing for each ticket by matching event_id and sector_id
        const transformedTickets: UserTicket[] = [];
        
        if (ticketsData && ticketsData.length > 0) {
          for (const ticket of ticketsData) {
            // Get price for this specific event and sector combination
            const { data: pricingData, error: pricingError } = await supabase
              .from("EventSectorPricing")
              .select("price")
              .eq("event_id", ticket.event_id)
              .eq("sector_id", ticket.sector_id)
              .single();

            if (pricingError) {
              console.warn(`No pricing found for event ${ticket.event_id}, sector ${ticket.sector_id}`);
            }

            transformedTickets.push({
              ticket_id: ticket.ticket_id,
              event_id: ticket.event_id,
              sector_id: ticket.sector_id,
              ticket_type: ticket.ticket_type || "General",
              status: ticket.status,
              event_title: ticket.Events?.title || "Unknown Event",
              event_date: ticket.Events?.event_date || "",
              venue_name: ticket.Events?.Venues?.name || "Unknown Venue",
              sector_name: ticket.Sectors?.sector_name || "Unknown Sector",
              original_price: pricingData?.price || 0
            });
          }
        }

        console.log("Transformed tickets:", transformedTickets);
        setTickets(transformedTickets);

      } catch (err: any) {
        console.error("Error loading tickets:", err);
        setError("Failed to load your tickets. Please try again.");
        toast.error("Failed to load your tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [user]);

  const formatEventDate = (dateString: string) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
    } catch (e) {
      return "TBD";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Owned":
        return "bg-green-100 text-green-800";
      case "Reserved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your tickets.
          </p>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Tickets</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
        <div className="ml-4 text-gray-600">
          <p className="text-sm">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      
      {tickets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't purchased any tickets yet. Browse events to find something exciting!
          </p>
          <Button 
            onClick={() => navigate("/events")}
            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
          >
            Browse Events
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.ticket_id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{ticket.event_title}</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#ff4b00]">
                    ${ticket.original_price.toFixed(2)}
                  </span>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatEventDate(ticket.event_date)}</span>
                <span className="mx-3">•</span>
                <MapPin className="w-4 h-4 mr-2" />
                <span>{ticket.venue_name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Ticket className="w-4 h-4 mr-2" />
                <span>{ticket.sector_name} • {ticket.ticket_type}</span>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 mb-4">
              Want to attend more events? Check out what's available.
            </p>
            <Button 
              onClick={() => navigate("/events")}
              variant="outline"
              className="border-[#ff4b00] text-[#ff4b00] hover:bg-[#ff4b00] hover:text-white"
            >
              Browse More Events
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsScreen;
