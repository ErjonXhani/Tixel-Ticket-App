
import React, { useState, useEffect, useRef } from "react";
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

// Utility function to get status color classes
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'sold':
      return 'bg-blue-100 text-blue-800';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800';
    case 'unavailable':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Utility function to format event date
const formatEventDate = (dateString: string) => {
  if (!dateString) return 'Date TBD';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const MyTicketsScreen = () => {
  const { user } = useAuth(); // Removed session from destructuring to avoid dependency issues
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent concurrent fetches and track component mount state
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);

  const fetchUserTickets = async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    // Debounce: prevent rapid successive calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      console.log("Debouncing: too soon since last fetch");
      return;
    }
    lastFetchTimeRef.current = now;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      isFetchingRef.current = true;
      console.log("=== STARTING FETCH USER TICKETS ===");
      console.log("User ID:", user?.id);

      if (!user?.id) {
        console.error("No user ID available");
        if (isMountedRef.current) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
        }
        return;
      }

      // Check if request was cancelled
      if (signal.aborted) return;

      // Step 1: Look up user in Users table
      console.log("Step 1: Looking up user in Users table...");
      
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("user_id, username, email")
        .eq("auth_uid", user.id)
        .abortSignal(signal);

      // Check if request was cancelled
      if (signal.aborted) return;

      console.log("Users query result:", { userData, userError });

      if (userError) {
        console.error("Database error during user lookup:", userError);
        throw new Error(`Database error: ${userError.message}`);
      }

      if (!userData || userData.length === 0) {
        console.error("No user found in Users table for auth_uid:", user.id);
        if (isMountedRef.current) {
          setError("Account setup in progress. Please refresh the page in a few seconds.");
          setLoading(false);
        }
        return;
      }

      const userRecord = userData[0];
      console.log("Found user record:", userRecord);

      // Step 2: Fetch transactions
      console.log("Step 2: Fetching paid transactions...");
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("Transactions")
        .select(`
          total_amount,
          ticket_id,
          buyer_id,
          payment_status,
          "Tickets"!inner(
            ticket_id,
            event_id,
            sector_id,
            ticket_type,
            status,
            owner_id,
            "Events"!inner(
              title,
              event_date,
              "Venues"!inner(name)
            ),
            "Sectors"!inner(sector_name)
          )
        `)
        .eq("buyer_id", userRecord.user_id)
        .eq("payment_status", "Paid")
        .not("ticket_id", "is", null)
        .abortSignal(signal);

      // Check if request was cancelled
      if (signal.aborted) return;

      console.log("Transactions query result:", { transactionsData, transactionsError });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw new Error(`Failed to fetch tickets: ${transactionsError.message}`);
      }

      console.log("Number of transactions found:", transactionsData?.length || 0);

      // Step 3: Transform data
      const transformedTickets: UserTicket[] = [];
      
      if (transactionsData && transactionsData.length > 0) {
        transactionsData.forEach((transaction, index) => {
          console.log(`Processing transaction ${index + 1}:`, transaction);
          
          const ticket = transaction.Tickets;
          if (!ticket) {
            console.warn(`Transaction ${transaction.ticket_id} has no ticket data`);
            return;
          }

          const event = ticket.Events;
          const venue = event?.Venues;
          const sector = ticket.Sectors;

          transformedTickets.push({
            ticket_id: ticket.ticket_id,
            event_id: ticket.event_id,
            sector_id: ticket.sector_id,
            ticket_type: ticket.ticket_type || "General",
            status: ticket.status,
            event_title: event?.title || "Unknown Event",
            event_date: event?.event_date || "",
            venue_name: venue?.name || "Unknown Venue",
            sector_name: sector?.sector_name || "Unknown Sector",
            original_price: transaction.total_amount || 0
          });
        });
      }

      console.log("Final transformed tickets:", transformedTickets);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTickets(transformedTickets);
        setError(null);
      }

    } catch (err: any) {
      // Don't handle errors if request was cancelled
      if (signal.aborted) return;
      
      console.error("=== ERROR IN FETCH TICKETS ===");
      console.error("Error message:", err.message);
      console.error("Full error:", err);
      
      const errorMessage = err.message || "Failed to load your tickets. Please try again.";
      
      if (isMountedRef.current) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("=== MY TICKETS SCREEN MOUNTED ===");
    console.log("User state:", { hasUser: !!user, userId: user?.id });
    
    isMountedRef.current = true;

    if (!user) {
      console.log("No user, setting loading to false");
      setLoading(false);
      return;
    }

    // Reset state and fetch tickets
    setError(null);
    setLoading(true);
    fetchUserTickets();

    // Cleanup function
    return () => {
      console.log("MyTicketsScreen unmounting - cancelling requests");
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]); // Only depend on user.id, not the entire user or session object

  const handleRetry = () => {
    console.log("Manual retry triggered");
    setError(null);
    setLoading(true);
    fetchUserTickets();
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
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            {error.includes("setup in progress") ? "Loading Account" : "Error Loading Tickets"}
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button 
            onClick={handleRetry}
            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white mr-4"
            disabled={loading}
          >
            {loading ? "Retrying..." : "Try Again"}
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-[#ff4b00] text-[#ff4b00] hover:bg-[#ff4b00] hover:text-white"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">
            <p className="text-sm">Loading your tickets...</p>
          </div>
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
