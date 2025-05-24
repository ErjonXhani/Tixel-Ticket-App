
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "Music",
  "Sports",
  "Arts",
  "Food",
  "Technology",
  "Business",
  "Education",
  "Entertainment",
  "Other"
];

interface Venue {
  venue_id: number;
  name: string;
}

const AdminEventForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer_name: "",
    event_date: "",
    image: "",
    category: "",
    venue_id: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchVenues();
    if (isEditing) {
      fetchEventData();
    }
  }, [isEditing]);

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
      toast.error("Failed to fetch venues");
    }
  };

  const fetchEventData = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("Events")
        .select("*")
        .eq("event_id", parseInt(id))
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          description: data.description || "",
          organizer_name: data.organizer_name || "",
          event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 16) : "",
          image: data.image || "",
          category: data.category || "",
          venue_id: data.venue_id?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to fetch event data");
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        organizer_name: formData.organizer_name,
        event_date: new Date(formData.event_date).toISOString(),
        image: formData.image,
        category: formData.category,
        venue_id: parseInt(formData.venue_id),
      };

      if (isEditing) {
        const { error } = await supabase
          .from("Events")
          .update(eventData)
          .eq("event_id", parseInt(id!));

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("Events")
          .insert(eventData);

        if (error) throw error;
      }
      
      toast.success(`Event ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Event' : 'Create New Event'}
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event title */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="font-medium">
                Event Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event description"
                rows={4}
                required
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Organizer */}
            <div className="space-y-2">
              <label htmlFor="organizer_name" className="font-medium">
                Organizer
              </label>
              <Input
                id="organizer_name"
                name="organizer_name"
                value={formData.organizer_name}
                onChange={handleChange}
                placeholder="Organizer name"
                required
              />
            </div>
            
            {/* Venue */}
            <div className="space-y-2">
              <label htmlFor="venue_id" className="font-medium">
                Venue
              </label>
              <select
                id="venue_id"
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#ff4b00]"
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
            
            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="event_date" className="font-medium">
                Event Date & Time
              </label>
              <Input
                id="event_date"
                name="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Image URL */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="image" className="font-medium">
                Image URL
              </label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Event preview" 
                    className="h-32 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/admin/events')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEventForm;
