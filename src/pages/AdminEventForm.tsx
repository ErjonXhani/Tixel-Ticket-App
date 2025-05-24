
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
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchVenues();
    if (isEditing) {
      fetchEventData();
    }
  }, [isEditing]);

  const fetchVenues = async () => {
    try {
      console.log("Fetching venues...");
      const { data, error } = await supabase
        .from("Venues")
        .select("venue_id, name")
        .order("name");

      if (error) {
        console.error("Error fetching venues:", error);
        throw error;
      }
      
      console.log("Venues fetched:", data);
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    }
  };

  const fetchEventData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log("Fetching event data for ID:", id);
      
      const { data, error } = await supabase
        .from("Events")
        .select("*")
        .eq("event_id", parseInt(id))
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      if (data) {
        console.log("Event data fetched:", data);
        setFormData({
          title: data.title,
          description: data.description || "",
          organizer_name: data.organizer_name || "",
          event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 16) : "",
          image: data.image || "",
          category: data.category || "",
          venue_id: data.venue_id?.toString() || "",
        });
        toast.success("Event data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to fetch event data");
      navigate('/admin/events');
    } finally {
      setLoading(false);
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
      console.log("Submitting form data:", formData);
      
      // Validate required fields
      if (!formData.title || !formData.event_date || !formData.venue_id) {
        toast.error("Please fill in all required fields");
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        organizer_name: formData.organizer_name,
        event_date: new Date(formData.event_date).toISOString(),
        image: formData.image,
        category: formData.category,
        venue_id: parseInt(formData.venue_id),
      };

      console.log("Processed event data:", eventData);

      if (isEditing) {
        const { error } = await supabase
          .from("Events")
          .update(eventData)
          .eq("event_id", parseInt(id!));

        if (error) {
          console.error("Error updating event:", error);
          throw error;
        }
        
        console.log("Event updated successfully");
        toast.success("Event updated successfully!");
      } else {
        const { error } = await supabase
          .from("Events")
          .insert(eventData);

        if (error) {
          console.error("Error creating event:", error);
          throw error;
        }
        
        console.log("Event created successfully");
        toast.success("Event created successfully!");
      }
      
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      
      // More specific error messages
      if (error.message?.includes('permission')) {
        toast.error("Permission denied. Please check your admin privileges.");
      } else if (error.message?.includes('foreign key')) {
        toast.error("Invalid venue selection. Please choose a valid venue.");
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Event' : 'Create New Event'}
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event title */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="font-medium">
                Event Title *
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
                className="resize-none"
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
                Venue *
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
                Event Date & Time *
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
          
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/admin/events')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEventForm;
