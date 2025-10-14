import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Ticket, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  notification_id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      try {
        // Get user_id from Users table
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("user_id")
          .eq("auth_uid", user.id)
          .single();

        if (userError) throw userError;

        // Fetch notifications
        const { data, error } = await supabase
          .from("Notifications")
          .select("*")
          .eq("user_id", userData.user_id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from("Notifications")
        .update({ is_read: true })
        .eq("notification_id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Ticket className="w-5 h-5 text-[#ff4b00]" />;
      case "event":
        return <Calendar className="w-5 h-5 text-[#ff4b00]" />;
      default:
        return <Bell className="w-5 h-5 text-[#ff4b00]" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No Notifications
          </h2>
          <p className="text-gray-500">
            You'll see updates about your tickets and events here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`bg-white rounded-lg p-4 shadow-sm ${
                !notification.is_read ? "border-l-4 border-[#ff4b00]" : ""
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.notification_id);
                }
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-sm ${
                      !notification.is_read
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-[#ff4b00] rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
