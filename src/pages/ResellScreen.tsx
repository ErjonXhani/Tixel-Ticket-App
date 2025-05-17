
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResellScreen = () => {
  const handleResellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Resell feature will be implemented soon!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resell Your Tickets</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-gray-600 mb-4">
          You can safely resell your unused tickets through our platform. 
          List your tickets and get paid when they sell.
        </p>
        
        <form onSubmit={handleResellSubmit} className="space-y-4">
          <div>
            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select 
              id="event" 
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select your event</option>
              <option value="1">Summer Music Festival - Jun 15, 2023</option>
              <option value="2">Tech Conference 2023 - Jul 22-24, 2023</option>
              <option value="3">Basketball Finals - Aug 10, 2023</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets
            </label>
            <Input
              id="ticketCount"
              type="number"
              min="1"
              placeholder="1"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Ticket ($)
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Add details about your tickets (section, row, seat numbers, etc.)"
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-600 text-white"
          >
            List Tickets for Resale
          </Button>
        </form>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Reselling Guidelines</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Tickets can only be listed at face value or less</li>
          <li>All sales are subject to a 10% service fee</li>
          <li>Payment will be processed within 24h of successful sale</li>
          <li>Original tickets will be invalidated once resold</li>
        </ul>
      </div>
    </div>
  );
};

export default ResellScreen;
