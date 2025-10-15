import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  cardholder_name?: string;
  label?: string;
  is_default: boolean;
}

const PaymentMethodsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(true);
  const [saving, setSaving] = useState(false);
  const [numericUserId, setNumericUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchNumericUserId();
  }, [user]);

  useEffect(() => {
    if (numericUserId) {
      fetchPaymentMethods();
    }
  }, [numericUserId]);

  const fetchNumericUserId = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("Users")
        .select("user_id")
        .eq("auth_uid", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setNumericUserId(data.user_id);
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      toast.error("Failed to load user information");
    }
  };

  const fetchPaymentMethods = async () => {
    if (!numericUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("PaymentMethods")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedCards(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const limited = digits.substring(0, 4);

    if (limited.length === 0) return "";

    let month = limited.substring(0, 2);

    if (month.length === 2) {
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) {
        month = "12";
      } else if (monthNum === 0) {
        month = "01";
      }
    }

    if (limited.length <= 2) {
      return month;
    } else {
      const year = limited.substring(2, 4);
      return `${month}/${year}`;
    }
  };

  const detectCardBrand = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (cleaned.startsWith("5")) return "Mastercard";
    if (cleaned.startsWith("3")) return "Amex";
    return "Card";
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv || !numericUserId) {
      toast.error("Please fill in all card details");
      return;
    }

    setSaving(true);

    try {
      const cleaned = cardNumber.replace(/\s/g, "");
      const last4 = cleaned.slice(-4);
      const [month, year] = expiryDate.split("/");

      const { error } = await supabase
        .from("PaymentMethods")
        .insert({
          user_id: numericUserId,
          brand: detectCardBrand(cardNumber),
          last4,
          exp_month: month,
          exp_year: year,
          cardholder_name: cardName,
          is_default: savedCards.length === 0, // First card is default
        });

      if (error) throw error;

      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCvv("");
      setShowAddCard(false);
      toast.success("Card added successfully!");
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error("Failed to add card");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from("PaymentMethods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Card removed");
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to remove card");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await supabase
        .from("PaymentMethods")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Default card updated");
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to update default card");
    }
  };

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
        <h1 className="text-xl font-bold">Payment Methods</h1>
      </div>

      {/* Saved Cards */}
      <div className="space-y-4 mb-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading payment methods...</p>
        ) : savedCards.length === 0 ? (
          <p className="text-center text-gray-500">No saved cards yet</p>
        ) : (
          savedCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-[#ff4b00]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {card.brand} •••• {card.last4}
                      </p>
                      {card.is_default && (
                        <span className="inline-flex items-center gap-1 bg-[#ff4b00]/10 text-[#ff4b00] text-xs px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Expires {card.exp_month}/{card.exp_year}
                    </p>
                    {card.cardholder_name && (
                      <p className="text-xs text-gray-400">{card.cardholder_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.is_default && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="text-[#ff4b00] hover:text-[#ff4b00]/80 text-sm"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Card Button */}
      {!showAddCard && (
        <Button
          onClick={() => setShowAddCard(true)}
          variant="outline"
          className="w-full border-[#ff4b00] text-[#ff4b00] hover:bg-[#ff4b00] hover:text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Card
        </Button>
      )}

      {/* Add Card Form */}
      {showAddCard && (
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
          <h2 className="font-semibold mb-4">Add New Card</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div>
              <label htmlFor="cardName" className="block text-sm font-medium mb-1">
                Cardholder Name
              </label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <Input
                  id="expiry"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                  CVV
                </label>
                <div className="relative">
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setCvv(digits);
                    }}
                    placeholder="123"
                    maxLength={4}
                    type={showCvv ? "text" : "password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddCard}
                disabled={saving}
                className="flex-1 bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
              >
                {saving ? "Saving..." : "Add Card"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddCard(false);
                  setCardNumber("");
                  setCardName("");
                  setExpiryDate("");
                  setCvv("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsScreen;
