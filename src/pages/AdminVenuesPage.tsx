
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    fetchVenues();
    // Auto-open form if coming from dashboard
    if (location.pathname === '/admin/venues' && location.state?.openForm) {
      setShowCreateForm(true);
    }
  }, [location]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      console.log("Fetching venues...");
      
      const { data, error } = await supabase
        .from("Venues")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching venues:", error);
        throw error;
      }
      
      console.log("Venues fetched successfully:", data);
      setVenues(data || []);
      toast.success("Venues loaded successfully");
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting venue data:", formData);
      
      // Validate required fields
      if (!formData.name || !formData.location || !formData.capacity) {
        toast.error("Please fill in all required fields");
        return;
      }

      const venueData = {
        name: formData.name,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        description: formData.description,
      };

      if (editingVenue) {
        const { error } = await supabase
          .from("Venues")
          .update(venueData)
          .eq("venue_id", editingVenue.venue_id);

        if (error) {
          console.error("Error updating venue:", error);
          throw error;
        }
        
        console.log("Venue updated successfully");
        toast.success("Venue updated successfully!");
      } else {
        const { error } = await supabase
          .from("Venues")
          .insert(venueData);

        if (error) {
          console.error("Error creating venue:", error);
          throw error;
        }
        
        console.log("Venue created successfully");
        toast.success("Venue created successfully!");
      }

      resetForm();
      fetchVenues();
    } catch (error) {
      console.error("Error saving venue:", error);
      
      if (error.message?.includes('permission')) {
        toast.error("Permission denied. Please check your admin privileges.");
      } else {
        toast.error("Failed to save venue. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
      setDeleting(venueId);
      console.log("Deleting venue:", venueId);
      
      const { error } = await supabase
        .from("Venues")
        .delete()
        .eq("venue_id", venueId);

      if (error) {
        console.error("Error deleting venue:", error);
        throw error;
      }

      setVenues(venues.filter(venue => venue.venue_id !== venueId));
      toast.success("Venue deleted successfully!");
      console.log("Venue deleted successfully");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue. Please try again.");
    } finally {
      setDeleting(null);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Venues</h1>
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 w-full sm:w-auto"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingVenue ? "Edit Venue" : "Create New Venue"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Venue Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter venue name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter venue location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity *</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="Enter capacity"
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter venue description"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                type="submit" 
                className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2" />
                    {editingVenue ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingVenue ? "Update Venue" : "Create Venue"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Venues List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Venue</th>
                <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Location</th>
                <th className="text-left p-4 font-medium text-gray-600">Capacity</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.venue_id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Building className="w-6 h-6 md:w-8 md:h-8 text-[#ff4b00] mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{venue.name}</p>
                        <p className="text-sm text-gray-500 truncate">{venue.description}</p>
                        <p className="text-sm text-gray-500 md:hidden flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {venue.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{venue.location}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{venue.capacity.toLocaleString()}</span>
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
                        disabled={deleting === venue.venue_id}
                      >
                        {deleting === venue.venue_id ? (
                          <div className="w-4 h-4 border-2 border-red-500 rounded-full border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {venues.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No venues found</h3>
            <p>Create your first venue to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVenuesPage;
