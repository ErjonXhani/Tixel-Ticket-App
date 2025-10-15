import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        console.log("EditProfile: No user ID, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("EditProfile: Fetching profile for user:", user.id);

      try {
        const { data, error } = await supabase
          .from("Users")
          .select("full_name, email, phone_number, username")
          .eq("auth_uid", user.id)
          .single();

        if (error) {
          console.error("EditProfile: Error fetching profile:", error);
          throw error;
        }

        if (data) {
          console.log("EditProfile: Profile data loaded:", data);
          setFormData({
            fullName: data.full_name || "",
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            username: data.username || "",
          });
        }
      } catch (error) {
        console.error("EditProfile: Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user?.id) {
      console.log("EditProfile: No user ID for save");
      toast.error("User session not found");
      return;
    }
    
    // Validate: username cannot be empty
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    console.log("EditProfile: Saving profile updates:", {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      username: formData.username,
    });

    setSaving(true);
    try {
      const { error } = await supabase
        .from("Users")
        .update({
          full_name: formData.fullName.trim() || null,
          phone_number: formData.phoneNumber.trim() || null,
          username: formData.username.trim(),
        })
        .eq("auth_uid", user.id);

      if (error) {
        console.error("EditProfile: Save error:", error);
        throw error;
      }

      console.log("EditProfile: Profile updated successfully");
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("EditProfile: Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Enter your full name (optional)"
          />
          <p className="text-xs text-gray-500 mt-1">You can clear this field if you prefer</p>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="johndoe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            placeholder="+1 234 567 8900"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white mt-6"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditProfileScreen;
