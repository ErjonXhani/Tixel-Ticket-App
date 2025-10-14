import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Ticket as TicketIcon, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const TicketDetailsScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const ticketId = searchParams.get("id") || "";
  const eventTitle = searchParams.get("title") || "Event";
  const eventDate = searchParams.get("date") || "";
  const venueName = searchParams.get("venue") || "";
  const sectorName = searchParams.get("sector") || "";
  const ticketType = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const price = searchParams.get("price") || "0";

  const formatEventDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getPurchaseDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/my-tickets")}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Ticket Details</h1>
      </div>

      {/* Ticket Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Event Info */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4">{eventTitle}</h2>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-[#ff4b00]" />
              <span>{formatEventDate(eventDate)}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-3 text-[#ff4b00]" />
              <span>{venueName}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <TicketIcon className="w-5 h-5 mr-3 text-[#ff4b00]" />
              <span>{sectorName} • {ticketType}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-6 bg-gray-50 flex flex-col items-center">
          <QrCode className="w-48 h-48 text-gray-300 mb-4" />
          <p className="text-sm text-gray-500 text-center">
            Show this QR code at the venue entrance
          </p>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-3 border-t">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium">#{ticketId.padStart(6, "0")}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Purchase Date</span>
            <span className="font-medium">{getPurchaseDate()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-green-600">{status}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Price</span>
            <span className="font-bold text-[#ff4b00] text-lg">${price}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          variant="outline"
          className="w-full border-[#ff4b00] text-[#ff4b00] hover:bg-[#ff4b00] hover:text-white"
          onClick={() => navigate("/my-tickets")}
        >
          Back to My Tickets
        </Button>
      </div>
    </div>
  );
};

export default TicketDetailsScreen;
