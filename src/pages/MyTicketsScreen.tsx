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
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [validationAttempts, setValidationAttempts] = useState(0);

  // Single consolidated useEffect that handles the entire flow
  useEffect(() => {
    const loadTicketsWithValidation = async () => {
      console.log("MyTickets: Starting ticket load process");

      // Check authentication first
      if (!user) {
        console.log("MyTickets: No user found");
        setIsLoading(false);
        setAuthError("Please log in to view your tickets");
        return;
      }

      // Prevent multiple simultaneous attempts
      if (hasValidated || validationAttempts >= 3) {
        console.log("MyTickets: Skipping - already validated or max attempts reached");
        return;
      }

      console.log("MyTickets: Starting validation attempt", validationAttempts + 1);
      setValidationAttempts(prev => prev + 1);
      setAuthError(null);

      try {
        // Add timeout wrapper for all database queries
        const queryTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        );

        let validatedUserId: number | null = null;

        // Strategy 1: Direct auth_uid + user.id match
        try {
          const directQuery = supabase
            .from("Users")
            .select("user_id, auth_uid, email")
            .eq("auth_uid", user.id)
            .maybeSingle();

          const { data: directData, error: directError } = await Promise.race([
            directQuery,
            queryTimeout
          ]) as any;

          if (directError && !directError.message?.includes('timeout')) {
            console.error("MyTickets: Direct validation error:", directError);
          } else if (directData) {
            console.log("MyTickets: Direct match found:", directData.user_id);
            validatedUserId = directData.user_id;
          }
        } catch (error) {
          console.log("MyTickets: Direct validation failed:", error);
        }

        // Strategy 2: Email match fallback
        if (!validatedUserId && user.email) {
          try {
            const emailQuery = supabase
              .from("Users")
              .select("user_id, auth_uid, email")
              .eq("email", user.email)
              .maybeSingle();

            const { data: emailData, error: emailError } = await Promise.race([
              emailQuery,
              queryTimeout
            ]) as any;

            if (emailError && !emailError.message?.includes('timeout')) {
              console.error("MyTickets: Email validation error:", emailError);
            } else if (emailData) {
              console.log("MyTickets: Email match found:", emailData.user_id);
              validatedUserId = emailData.user_id;
              
              // Update auth_uid if needed
              if (emailData.auth_uid !== user.id) {
                console.log("MyTickets: Updating mismatched auth_uid");
                try {
                  await supabase
                    .from("Users")
                    .update({ auth_uid: user.id })
                    .eq("user_id", emailData.user_id);
                } catch (updateErr) {
                  console.error("MyTickets: Failed to update auth_uid:", updateErr);
                }
              }
            }
          } catch (error) {
            console.log("MyTickets: Email validation failed:", error);
          }
        }

        // If validation successful, fetch tickets with prices in a single query
        if (validatedUserId) {
          console.log("MyTickets: User validated, fetching tickets for user ID:", validatedUserId);
          setHasValidated(true);
          
          try {
            // Fetch tickets with all related data including pricing in a single query
            const ticketsQuery = supabase
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
                  venue_id, 
                  Venues(name)
                ),
                Sectors!inner(sector_name),
                EventSectorPricing!inner(price)
              `)
              .eq("owner_id", validatedUserId)
              .in("status", ["Reserved", "Owned"]);

            const { data: tickets, error: ticketsError } = await Promise.race([
              ticketsQuery,
              queryTimeout
            ]) as any;

            if (ticketsError) {
              console.error("MyTickets: Error fetching tickets:", ticketsError);
              throw ticketsError;
            }

            console.log("MyTickets: Fetched tickets with pricing:", tickets);

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
              sector_name: ticket.Sectors?.sector_name || "Unknown Sector",
              original_price: ticket.EventSectorPricing?.price || 0
            })) || [];

            console.log("MyTickets: Transformed tickets with prices:", transformedTickets);
            setUserTickets(transformedTickets);

          } catch (ticketsError) {
            console.error("MyTickets: Error in ticket fetching:", ticketsError);
            toast.error("Failed to load your tickets");
          }
        } else {
          // Validation failed
          if (validationAttempts >= 2) {
            console.error("MyTickets: All validation methods failed after 3 attempts");
            setAuthError("Unable to verify your account. Please try refreshing the page.");
          } else {
            console.log("MyTickets: Retrying validation in 2 seconds...");
            setTimeout(() => {
              loadTicketsWithValidation();
            }, 2000);
            return; // Don't set loading to false yet
          }
        }

      } catch (error) {
        console.error("MyTickets: Unhandled error in loadTicketsWithValidation:", error);
        if (validationAttempts >= 2) {
          setAuthError("Something went wrong loading your tickets. Please refresh the page.");
        } else {
          setTimeout(() => {
            loadTicketsWithValidation();
          }, 2000);
          return; // Don't set loading to false yet
        }
      } finally {
        // Only set loading to false if we're done (successful or final attempt)
        if (hasValidated || validationAttempts >= 2) {
          setIsLoading(false);
        }
      }
    };

    // Only run if we have a user and haven't validated yet
    if (user && !hasValidated && validationAttempts < 3) {
      loadTicketsWithValidation();
    } else if (!user) {
      setIsLoading(false);
      setAuthError("Please log in to view your tickets");
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Any cleanup needed
    };
  }, [user, hasValidated, validationAttempts]); // Controlled dependencies

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
        <div className="ml-4 text-gray-600">
          {validationAttempts > 0 && (
            <p className="text-sm">Validating user... (Attempt {validationAttempts}/3)</p>
          )}
        </div>
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
                    ${ticket.original_price?.toFixed(2) || "0.00"}
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
