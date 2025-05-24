
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Building, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Venue {
  venue_id: number;
  name: string;
  location: string;
  capacity: number;
  description: string;
}

const AdminVenuesPage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from("Venues")
        .select("*")
        .order("name");

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVenue) {
        const { error } = await supabase
          .from("Venues")
          .update({
            name: formData.name,
            location: formData.location,
            capacity: parseInt(formData.capacity),
            description: formData.description,
          })
          .eq("venue_id", editingVenue.venue_id);

        if (error) throw error;
        toast.success("Venue updated successfully");
      } else {
        const { error } = await supabase
          .from("Venues")
          .insert({
            name: formData.name,
            location: formData.location,
            capacity: parseInt(formData.capacity),
            description: formData.description,
          });

        if (error) throw error;
        toast.success("Venue created successfully");
      }

      setFormData({ name: "", location: "", capacity: "", description: "" });
      setShowCreateForm(false);
      setEditingVenue(null);
      fetchVenues();
    } catch (error) {
      console.error("Error saving venue:", error);
      toast.error("Failed to save venue");
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity.toString(),
      description: venue.description || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (venueId: number) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;

    try {
      const { error } = await supabase
        .from("Venues")
        .delete()
        .eq("venue_id", venueId);

      if (error) throw error;

      setVenues(venues.filter(venue => venue.venue_id !== venueId));
      toast.success("Venue deleted successfully");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", location: "", capacity: "", description: "" });
    setShowCreateForm(false);
    setEditingVenue(null);
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
        <h1 className="text-2xl font-bold">Manage Venues</h1>
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingVenue ? "Edit Venue" : "Create New Venue"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Venue Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="bg-[#ff4b00] hover:bg-[#ff4b00]/90">
                {editingVenue ? "Update" : "Create"} Venue
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Venues List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Venue</th>
                <th className="text-left p-4 font-medium text-gray-600">Location</th>
                <th className="text-left p-4 font-medium text-gray-600">Capacity</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.venue_id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Building className="w-8 h-8 text-[#ff4b00] mr-3" />
                      <div>
                        <p className="font-medium">{venue.name}</p>
                        <p className="text-sm text-gray-500">{venue.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {venue.location}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {venue.capacity.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(venue)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(venue.venue_id)}
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

        {venues.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No venues found. Create your first venue!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVenuesPage;
