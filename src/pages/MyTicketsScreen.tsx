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
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserTickets = async (retryAttempt = 0) => {
    try {
      console.log("=== FETCH ATTEMPT", retryAttempt + 1, "===");
      console.log("Auth user:", user);
      console.log("Auth session:", session);
      console.log("User ID:", user?.id);

      if (!user?.id) {
        console.error("No user ID available");
        setError("Authentication required. Please log in again.");
        return;
      }

      // Step 1: Look up user in Users table with detailed logging
      console.log("Step 1: Looking up user in Users table...");
      
      const { data: userData, error: userError, count } = await supabase
        .from("Users")
        .select("user_id, username, email")
        .eq("auth_uid", user.id);

      console.log("Users query result:", { userData, userError, count });
      console.log("Number of matching users:", userData?.length || 0);

      if (userError) {
        console.error("Database error during user lookup:", userError);
        throw new Error(`Database error: ${userError.message}`);
      }

      if (!userData || userData.length === 0) {
        console.error("No user found in Users table for auth_uid:", user.id);
        
        // Check if this is a new user that hasn't been synced yet
        console.log("Checking if user exists in auth.users...");
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        console.log("Current auth user:", authUser);
        
        if (authUser && !userData?.length) {
          setError("Account setup in progress. Please refresh the page in a few seconds.");
          // Auto-retry after 3 seconds for new users
          if (retryAttempt < 2) {
            console.log("Will retry in 3 seconds...");
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchUserTickets(retryAttempt + 1);
            }, 3000);
          }
          return;
        }
        
        setError("User account not found. Please contact support.");
        return;
      }

      const userRecord = userData[0];
      console.log("Found user record:", userRecord);

      // Step 2: Fetch transactions with comprehensive error handling
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
        .not("ticket_id", "is", null);

      console.log("Transactions query result:", { transactionsData, transactionsError });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw new Error(`Failed to fetch tickets: ${transactionsError.message}`);
      }

      console.log("Raw transactions data:", transactionsData);
      console.log("Number of transactions found:", transactionsData?.length || 0);

      // Step 3: Transform data with validation
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

          console.log(`Ticket ${ticket.ticket_id} details:`, {
            event: event?.title,
            venue: venue?.name,
            sector: sector?.sector_name,
            status: ticket.status,
            price: transaction.total_amount
          });

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
      console.log("Total tickets to display:", transformedTickets.length);

      setTickets(transformedTickets);
      setError(null); // Clear any previous errors

    } catch (err: any) {
      console.error("=== ERROR IN FETCH TICKETS ===");
      console.error("Error type:", typeof err);
      console.error("Error message:", err.message);
      console.error("Full error:", err);
      console.error("Stack trace:", err.stack);
      
      const errorMessage = err.message || "Failed to load your tickets. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Auto-retry for network errors
      if (retryAttempt < 1 && (err.message?.includes('network') || err.message?.includes('timeout'))) {
        console.log("Network error detected, will retry in 2 seconds...");
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchUserTickets(retryAttempt + 1);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("=== MY TICKETS SCREEN MOUNTED ===");
    console.log("Initial auth state:", { user: !!user, userId: user?.id, session: !!session });
    
    if (!user) {
      console.log("No user, setting loading to false");
      setLoading(false);
      return;
    }

    // Reset state and fetch tickets
    setError(null);
    setLoading(true);
    setRetryCount(0);
    fetchUserTickets();
  }, [user, session]);

  // Monitor auth state changes
  useEffect(() => {
    console.log("Auth state changed:", { 
      hasUser: !!user, 
      userId: user?.id, 
      hasSession: !!session 
    });
  }, [user, session]);

  const handleRetry = () => {
    console.log("Manual retry triggered");
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    fetchUserTickets(retryCount);
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

  // Show error state with better messaging
  if (error) {
    return (
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            {error.includes("setup in progress") ? "Loading Account" : "Error Loading Tickets"}
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          {retryCount < 3 && (
            <Button 
              onClick={handleRetry}
              className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white mr-4"
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
            </Button>
          )}
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

  // Show loading state with retry info
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">
            <p className="text-sm">Loading your tickets...</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">Attempt {retryCount + 1}</p>
            )}
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
