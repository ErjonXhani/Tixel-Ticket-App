
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, Calendar, MapPin, User, Loader2 } from "lucide-react";

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

  // Fetch current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (!user) return;

      try {
        const { data: userData, error } = await supabase
          .from("Users")
          .select("user_id")
          .eq("auth_uid", user.id)
          .maybeSingle();

        if (error) throw error;
        if (userData) {
          setCurrentUserId(userData.user_id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        toast.error("Failed to load user information");
      }
    };

    fetchUserId();
  }, [user]);

  // Fetch user's owned tickets
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!currentUserId) return;

      setIsLoading(true);
      try {
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
          .eq("status", "Owned");

        if (error) throw error;

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
    
    if (!selectedTicket || !currentUserId) {
      toast.error("Please select a ticket to resell");
      return;
    }

    if (!formData.resale_price || parseFloat(formData.resale_price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create resale listing
      const { error } = await supabase
        .from("ResaleListings")
        .insert({
          ticket_id: formData.ticket_id,
          user_id: currentUserId,
          resale_price: parseFloat(formData.resale_price),
          original_price: selectedTicket.original_price,
          resale_status: "Active"
        });

      if (error) throw error;

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
        .eq("status", "Owned");

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
        setUserTickets(transformedTickets);
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
                  disabled={isSubmitting}
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
