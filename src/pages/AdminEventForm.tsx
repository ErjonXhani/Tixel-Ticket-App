
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Mock event data (in a real app, we'd fetch this from an API)
const mockEvent = {
  id: 1,
  title: "Summer Music Festival",
  description: "Experience the best of summer with live performances from top artists across three stages.",
  location: "Central Park, New York",
  venue: "Great Lawn",
  date: "2023-06-15",
  time: "12:00",
  endTime: "22:00",
  imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop",
  category: "Music",
  organizer: "NYC Events",
  price: "45",
  capacity: "2000",
};

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

const AdminEventForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    venue: "",
    date: "",
    time: "",
    endTime: "",
    imageUrl: "",
    category: "",
    organizer: "",
    price: "",
    capacity: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If editing, fetch event data
  useEffect(() => {
    if (isEditing) {
      // In a real app, we'd fetch the event data
      // For now, just use our mock data
      setFormData(mockEvent);
    }
  }, [isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, we'd make an API call to save the event
      // const endpoint = isEditing ? `/api/events/${id}` : '/api/events';
      // const method = isEditing ? 'PUT' : 'POST';
      // const response = await fetch(endpoint, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Event ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin');
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
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event description"
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label htmlFor="organizer" className="font-medium">
                Organizer
              </label>
              <Input
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Organizer name"
                required
              />
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                required
              />
            </div>
            
            {/* Venue */}
            <div className="space-y-2">
              <label htmlFor="venue" className="font-medium">
                Venue
              </label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Venue name"
                required
              />
            </div>
            
            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="font-medium">
                Date
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Time */}
            <div className="space-y-2">
              <label htmlFor="time" className="font-medium">
                Start Time
              </label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* End Time */}
            <div className="space-y-2">
              <label htmlFor="endTime" className="font-medium">
                End Time
              </label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="font-medium">
                Base Ticket Price ($)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            {/* Capacity */}
            <div className="space-y-2">
              <label htmlFor="capacity" className="font-medium">
                Maximum Capacity
              </label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="100"
                min="1"
                required
              />
            </div>
            
            {/* Image URL */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="imageUrl" className="font-medium">
                Image URL
              </label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Preview:</p>
                  <img 
                    src={formData.imageUrl} 
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
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary"
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
