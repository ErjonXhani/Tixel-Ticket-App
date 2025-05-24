
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, DollarSign, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventSectorPricing {
  pricing_id: number;
  event_id: number;
  sector_id: number;
  price: number;
  available_tickets: number;
  Events?: { title: string };
  Sectors?: { sector_name: string };
}

interface Event {
  event_id: number;
  title: string;
}

interface Sector {
  sector_id: number;
  sector_name: string;
  venue_id: number;
  Venues?: { name: string };
}

const AdminPricingPage = () => {
  const [pricings, setPricings] = useState<EventSectorPricing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState<EventSectorPricing | null>(null);
  const [formData, setFormData] = useState({
    event_id: "",
    sector_id: "",
    price: "",
    available_tickets: "",
  });

  useEffect(() => {
    fetchPricings();
    fetchEvents();
    fetchSectors();
  }, []);

  const fetchPricings = async () => {
    try {
      const { data, error } = await supabase
        .from("EventSectorPricing")
        .select(`
          *,
          Events(title),
          Sectors(sector_name)
        `)
        .order("pricing_id");

      if (error) throw error;
      setPricings(data || []);
    } catch (error) {
      console.error("Error fetching pricings:", error);
      toast.error("Failed to fetch pricings");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("Events")
        .select("event_id, title")
        .order("title");

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from("Sectors")
        .select(`
          sector_id,
          sector_name,
          venue_id,
          Venues(name)
        `)
        .order("sector_name");

      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPricing) {
        const { error } = await supabase
          .from("EventSectorPricing")
          .update({
            event_id: parseInt(formData.event_id),
            sector_id: parseInt(formData.sector_id),
            price: parseFloat(formData.price),
            available_tickets: parseInt(formData.available_tickets),
          })
          .eq("pricing_id", editingPricing.pricing_id);

        if (error) throw error;
        toast.success("Pricing updated successfully");
      } else {
        const { error } = await supabase
          .from("EventSectorPricing")
          .insert({
            event_id: parseInt(formData.event_id),
            sector_id: parseInt(formData.sector_id),
            price: parseFloat(formData.price),
            available_tickets: parseInt(formData.available_tickets),
          });

        if (error) throw error;
        toast.success("Pricing created successfully");
      }

      setFormData({ event_id: "", sector_id: "", price: "", available_tickets: "" });
      setShowCreateForm(false);
      setEditingPricing(null);
      fetchPricings();
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("Failed to save pricing");
    }
  };

  const handleEdit = (pricing: EventSectorPricing) => {
    setEditingPricing(pricing);
    setFormData({
      event_id: pricing.event_id.toString(),
      sector_id: pricing.sector_id.toString(),
      price: pricing.price.toString(),
      available_tickets: pricing.available_tickets.toString(),
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (pricingId: number) => {
    if (!confirm("Are you sure you want to delete this pricing?")) return;

    try {
      const { error } = await supabase
        .from("EventSectorPricing")
        .delete()
        .eq("pricing_id", pricingId);

      if (error) throw error;

      setPricings(pricings.filter(pricing => pricing.pricing_id !== pricingId));
      toast.success("Pricing deleted successfully");
    } catch (error) {
      console.error("Error deleting pricing:", error);
      toast.error("Failed to delete pricing");
    }
  };

  const resetForm = () => {
    setFormData({ event_id: "", sector_id: "", price: "", available_tickets: "" });
    setShowCreateForm(false);
    setEditingPricing(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Event Pricing</h1>
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingPricing ? "Edit Pricing" : "Create New Pricing"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
                  value={formData.event_id}
                  onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                  required
                >
                  <option value="">Select an event</option>
                  {events.map(event => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sector</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
                  value={formData.sector_id}
                  onChange={(e) => setFormData({...formData, sector_id: e.target.value})}
                  required
                >
                  <option value="">Select a sector</option>
                  {sectors.map(sector => (
                    <option key={sector.sector_id} value={sector.sector_id}>
                      {sector.sector_name} - {sector.Venues?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Available Tickets</label>
                <Input
                  type="number"
                  value={formData.available_tickets}
                  onChange={(e) => setFormData({...formData, available_tickets: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="bg-[#ff4b00] hover:bg-[#ff4b00]/90">
                {editingPricing ? "Update" : "Create"} Pricing
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Pricings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Event</th>
                <th className="text-left p-4 font-medium text-gray-600">Sector</th>
                <th className="text-left p-4 font-medium text-gray-600">Price</th>
                <th className="text-left p-4 font-medium text-gray-600">Available</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricings.map((pricing) => (
                <tr key={pricing.pricing_id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Calendar className="w-6 h-6 text-[#ff4b00] mr-3" />
                      <span className="font-medium">{pricing.Events?.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 text-gray-500 mr-2" />
                      {pricing.Sectors?.sector_name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="font-semibold">{pricing.price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {pricing.available_tickets} tickets
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(pricing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(pricing.pricing_id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pricings.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No pricing configurations found. Create your first pricing setup!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPricingPage;
