
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, MapPin, User, Loader2, LogIn } from "lucide-react";

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

interface ResaleFormData {
  ticket_id: number;
  resale_price: string;
  description: string;
}

const ResellScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [formData, setFormData] = useState<ResaleFormData>({
    ticket_id: 0,
    resale_price: "",
    description: ""
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check authentication first
  useEffect(() => {
    console.log("Auth state - user:", user);
    if (!user) {
      console.log("No user found, setting loading to false");
      setIsLoading(false);
      setAuthError("Please log in to view and manage your tickets");
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
          .eq("status", "Reserved");

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

  const handleTicketSelect = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setFormData({
      ticket_id: ticket.ticket_id,
      resale_price: ticket.original_price?.toString() || "",
      description: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Starting resale submission...");
    console.log("Selected ticket:", selectedTicket);
    console.log("Current user ID:", currentUserId);
    console.log("Form data:", formData);
    
    if (!user) {
      toast.error("Please log in to list tickets for resale");
      navigate("/login");
      return;
    }

    if (!selectedTicket || !currentUserId) {
      toast.error("Please select a ticket to resell");
      console.error("Missing data - selectedTicket:", selectedTicket, "currentUserId:", currentUserId);
      return;
    }

    if (!formData.resale_price || parseFloat(formData.resale_price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Validate price doesn't exceed face value
    const resalePrice = parseFloat(formData.resale_price);
    if (selectedTicket.original_price && resalePrice > selectedTicket.original_price) {
      toast.error(`Price cannot exceed face value of $${selectedTicket.original_price.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating resale listing with data:", {
        ticket_id: formData.ticket_id,
        user_id: currentUserId,
        resale_price: resalePrice,
        original_price: selectedTicket.original_price,
        resale_status: "Active"
      });

      // Create resale listing
      const { data: resaleData, error } = await supabase
        .from("ResaleListings")
        .insert({
          ticket_id: formData.ticket_id,
          user_id: currentUserId,
          resale_price: resalePrice,
          original_price: selectedTicket.original_price,
          resale_status: "Active"
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating resale listing:", error);
        throw error;
      }

      console.log("Resale listing created successfully:", resaleData);
      toast.success("Ticket listed for resale successfully!");
      
      // Reset form and refresh tickets
      setSelectedTicket(null);
      setFormData({
        ticket_id: 0,
        resale_price: "",
        description: ""
      });
      
      // Refresh user tickets to update the list
      const { data: tickets } = await supabase
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
        .eq("status", "Reserved");

      if (tickets) {
        const transformedTickets = tickets.map(ticket => ({
          ticket_id: ticket.ticket_id,
          event_id: ticket.event_id,
          sector_id: ticket.sector_id,
          ticket_type: ticket.ticket_type,
          status: ticket.status,
          event_title: ticket.Events?.title || "Unknown Event",
          event_date: ticket.Events?.event_date || "",
          venue_name: ticket.Events?.Venues?.name || "Unknown Venue",
          sector_name: ticket.Sectors?.sector_name || "Unknown Sector"
        }));
        
        // Fetch prices for refreshed tickets
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
        
        setUserTickets(ticketsWithPrices);
      }

    } catch (error: any) {
      console.error("Error creating resale listing:", error);
      toast.error(error.message || "Failed to list ticket for resale");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Show login prompt if not authenticated
  if (!user || authError) {
    return (
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Resell Your Tickets</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            {authError || "Please log in to view and manage your tickets for resale."}
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
      <h1 className="text-2xl font-bold mb-6">Resell Your Tickets</h1>
      
      {userTickets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Tickets to Resell</h2>
          <p className="text-gray-600">
            You don't have any tickets available for resale. Purchase tickets first to list them here.
          </p>
        </div>
      ) : (
        <>
          {/* Your Tickets Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
            <div className="space-y-3">
              {userTickets.map((ticket) => (
                <div 
                  key={ticket.ticket_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTicket?.ticket_id === ticket.ticket_id 
                      ? "border-[#ff4b00] bg-[#ff4b00]/5" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{ticket.event_title}</h3>
                    <span className="text-lg font-semibold text-[#ff4b00]">
                      ${ticket.original_price?.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatEventDate(ticket.event_date)}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{ticket.venue_name}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Ticket className="w-4 h-4 mr-1" />
                    <span>{ticket.sector_name} • {ticket.ticket_type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resale Form */}
          {selectedTicket && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">List Ticket for Resale</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-1">Selected Ticket</h3>
                <p className="text-sm text-gray-600">{selectedTicket.event_title}</p>
                <p className="text-sm text-gray-600">{selectedTicket.sector_name} • Original Price: ${selectedTicket.original_price?.toFixed(2)}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Resale Price ($)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTicket.original_price}
                    value={formData.resale_price}
                    onChange={(e) => setFormData({...formData, resale_price: e.target.value})}
                    placeholder="0.00"
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum allowed: ${selectedTicket.original_price?.toFixed(2)} (face value)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Add details about your ticket (section, row, seat numbers, etc.)"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
                  disabled={isSubmitting || !currentUserId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Listing Ticket...
                    </>
                  ) : (
                    "List Ticket for Resale"
                  )}
                </Button>
              </form>
            </div>
          )}
        </>
      )}
      
      {/* Guidelines */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Reselling Guidelines</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Tickets can only be listed at face value or less</li>
          <li>All sales are subject to a 10% service fee</li>
          <li>Payment will be processed within 24h of successful sale</li>
          <li>Original tickets will be invalidated once resold</li>
          <li>Listings expire after 30 days if not sold</li>
        </ul>
      </div>
    </div>
  );
};

export default ResellScreen;
