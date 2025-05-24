
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Settings, Building } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Sector {
  sector_id: number;
  sector_name: string;
  capacity: number;
  description: string;
  venue_id: number;
  Venues?: { name: string };
}

interface Venue {
  venue_id: number;
  name: string;
}

const AdminSectorsPage = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    sector_name: "",
    capacity: "",
    description: "",
    venue_id: "",
  });

  useEffect(() => {
    fetchSectors();
    fetchVenues();
  }, []);

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from("Sectors")
        .select(`
          *,
          Venues(name)
        `)
        .order("sector_name");

      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to fetch sectors");
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from("Venues")
        .select("venue_id, name")
        .order("name");

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSector) {
        const { error } = await supabase
          .from("Sectors")
          .update({
            sector_name: formData.sector_name,
            capacity: parseInt(formData.capacity),
            description: formData.description,
            venue_id: parseInt(formData.venue_id),
          })
          .eq("sector_id", editingSector.sector_id);

        if (error) throw error;
        toast.success("Sector updated successfully");
      } else {
        const { error } = await supabase
          .from("Sectors")
          .insert({
            sector_name: formData.sector_name,
            capacity: parseInt(formData.capacity),
            description: formData.description,
            venue_id: parseInt(formData.venue_id),
          });

        if (error) throw error;
        toast.success("Sector created successfully");
      }

      setFormData({ sector_name: "", capacity: "", description: "", venue_id: "" });
      setShowCreateForm(false);
      setEditingSector(null);
      fetchSectors();
    } catch (error) {
      console.error("Error saving sector:", error);
      toast.error("Failed to save sector");
    }
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      sector_name: sector.sector_name,
      capacity: sector.capacity.toString(),
      description: sector.description || "",
      venue_id: sector.venue_id.toString(),
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (sectorId: number) => {
    if (!confirm("Are you sure you want to delete this sector?")) return;

    try {
      const { error } = await supabase
        .from("Sectors")
        .delete()
        .eq("sector_id", sectorId);

      if (error) throw error;

      setSectors(sectors.filter(sector => sector.sector_id !== sectorId));
      toast.success("Sector deleted successfully");
    } catch (error) {
      console.error("Error deleting sector:", error);
      toast.error("Failed to delete sector");
    }
  };

  const resetForm = () => {
    setFormData({ sector_name: "", capacity: "", description: "", venue_id: "" });
    setShowCreateForm(false);
    setEditingSector(null);
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
        <h1 className="text-2xl font-bold">Manage Sectors</h1>
        <Button 
          className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sector
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingSector ? "Edit Sector" : "Create New Sector"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sector Name</label>
                <Input
                  value={formData.sector_name}
                  onChange={(e) => setFormData({...formData, sector_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
                  value={formData.venue_id}
                  onChange={(e) => setFormData({...formData, venue_id: e.target.value})}
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.venue_id} value={venue.venue_id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
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
                {editingSector ? "Update" : "Create"} Sector
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sectors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Sector</th>
                <th className="text-left p-4 font-medium text-gray-600">Venue</th>
                <th className="text-left p-4 font-medium text-gray-600">Capacity</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr key={sector.sector_id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Settings className="w-8 h-8 text-[#ff4b00] mr-3" />
                      <div>
                        <p className="font-medium">{sector.sector_name}</p>
                        <p className="text-sm text-gray-500">{sector.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {sector.Venues?.name}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {sector.capacity.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(sector)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(sector.sector_id)}
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

        {sectors.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No sectors found. Create your first sector!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSectorsPage;
