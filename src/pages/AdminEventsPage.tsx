
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  event_id: number;
  title: string;
  description: string;
  organizer_name: string;
  event_date: string;
  image: string;
  category: string;
  venue_id: number;
  Venues?: { name: string };
}

const AdminEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events...");
      
      const { data, error } = await supabase
        .from("Events")
        .select(`
          *,
          Venues(name)
        `)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
      
      console.log("Events fetched successfully:", data);
      setEvents(data || []);
      toast.success("Events loaded successfully");
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      setDeleting(eventId);
      console.log("Deleting event:", eventId);
      
      const { error } = await supabase
        .from("Events")
        .delete()
        .eq("event_id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }

      setEvents(events.filter(event => event.event_id !== eventId));
      toast.success("Event deleted successfully");
      console.log("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setDeleting(null);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <Link to="/admin/events/create">
          <Button className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Event</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Venue</th>
                <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Category</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img 
                        src={event.image || `https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100&h=100&fit=crop`}
                        alt={event.title}
                        className="w-10 h-10 md:w-12 md:h-12 rounded object-cover mr-3"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-gray-500 truncate">{event.organizer_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{event.Venues?.name || "No venue"}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Link to={`/admin/events/edit/${event.event_id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteEvent(event.event_id)}
                        disabled={deleting === event.event_id}
                      >
                        {deleting === event.event_id ? (
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

        {events.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p>Create your first event to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventsPage;
