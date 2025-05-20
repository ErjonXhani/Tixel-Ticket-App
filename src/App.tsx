import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster"

import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import HomeScreen from "./pages/HomeScreen";
import EventsScreen from "./pages/EventsScreen";
import EventDetailsScreen from "./pages/EventDetailsScreen";

// Import the PaymentScreen component
import PaymentScreen from "./pages/PaymentScreen";

function App() {
  const { user, loading, checkAuth } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const performAuthCheck = async () => {
      await checkAuth();
      setHasCheckedAuth(true);
    };

    performAuthCheck();
  }, [checkAuth]);

  // Show a loading indicator while checking authentication
  if (loading || !hasCheckedAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <LoginScreen />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/home" /> : <SignupScreen />}
        />
        <Route
          path="/home"
          element={user ? <HomeScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/events"
          element={user ? <EventsScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/events/:id"
          element={user ? <EventDetailsScreen /> : <Navigate to="/login" />}
        />
        
        {/* Add the new payment route */}
        <Route path="/payment" element={<PaymentScreen />} />
        
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
