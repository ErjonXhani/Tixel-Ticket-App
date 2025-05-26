
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
  original_price?: number;
}

const MyTicketsScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check authentication first
  useEffect(() => {
    console.log("Auth state - user:", user);
    if (!user) {
      console.log("No user found, setting loading to false");
      setIsLoading(false);
      setAuthError("Please log in to view your tickets");
      return;
    }
    setAuthError(null);
  }, [user]);

  // Fetch current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (!user) {
        console.log("No user available for ID fetch");
        return;
      }

      try {
        console.log("Fetching user ID for auth_uid:", user.id);
        const { data: userData, error } = await supabase
          .from("Users")
          .select("user_id")
          .eq("auth_uid", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user ID:", error);
          throw error;
        }
        
        if (userData) {
          console.log("Found user ID:", userData.user_id);
          setCurrentUserId(userData.user_id);
        } else {
          console.log("No user record found in Users table");
          toast.error("User profile not found. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        toast.error("Failed to load user information");
        setAuthError("Failed to load user profile");
      }
    };

    if (user) {
      fetchUserId();
    }
  }, [user]);

  // Fetch user's owned tickets
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!currentUserId) {
        console.log("No currentUserId available for ticket fetch");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching tickets for user ID:", currentUserId);
        const { data: tickets, error } = await supabase
          .from("Tickets")
          .select(`
            ticket_id,
            event_id,
            sector_id,
            ticket_type,
            status,
            Events(title, event_date, venue_id, Venues(name)),
            Sectors(sector_name)
          `)
          .eq("owner_id", currentUserId)
          .in("status", ["Reserved", "Owned"]);

        if (error) {
          console.error("Error fetching tickets:", error);
          throw error;
        }

        console.log("Fetched tickets:", tickets);

        // Transform the data
        const transformedTickets = tickets?.map(ticket => ({
          ticket_id: ticket.ticket_id,
          event_id: ticket.event_id,
          sector_id: ticket.sector_id,
          ticket_type: ticket.ticket_type,
          status: ticket.status,
          event_title: ticket.Events?.title || "Unknown Event",
          event_date: ticket.Events?.event_date || "",
          venue_name: ticket.Events?.Venues?.name || "Unknown Venue",
          sector_name: ticket.Sectors?.sector_name || "Unknown Sector"
        })) || [];

        console.log("Transformed tickets:", transformedTickets);

        // Fetch original prices for tickets
        const ticketsWithPrices = await Promise.all(
          transformedTickets.map(async (ticket) => {
            const { data: pricingData } = await supabase
              .from("EventSectorPricing")
              .select("price")
              .eq("event_id", ticket.event_id)
              .eq("sector_id", ticket.sector_id)
              .maybeSingle();

            return {
              ...ticket,
              original_price: pricingData?.price || 0
            };
          })
        );

        console.log("Tickets with prices:", ticketsWithPrices);
        setUserTickets(ticketsWithPrices);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load your tickets");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserId) {
      fetchUserTickets();
    }
  }, [currentUserId]);

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
  if (!user || authError) {
    return (
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            {authError || "Please log in to view your tickets."}
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      
      {userTickets.length === 0 ? (
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
          {userTickets.map((ticket) => (
            <div 
              key={ticket.ticket_id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{ticket.event_title}</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#ff4b00]">
                    ${ticket.original_price?.toFixed(2)}
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
