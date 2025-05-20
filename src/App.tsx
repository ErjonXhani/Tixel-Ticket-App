
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import HomeScreen from "./pages/HomeScreen";
import EventsScreen from "./pages/EventsScreen";
import EventDetailsScreen from "./pages/EventDetailsScreen";
import PaymentScreen from "./pages/PaymentScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AdminScreen from "./pages/AdminScreen";

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
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
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
        
        {/* Add the payment route - don't require login for demo purposes */}
        <Route path="/payment" element={<PaymentScreen />} />
        
        {/* Admin route */}
        <Route
          path="/admin"
          element={user?.role === "admin" ? <AdminScreen /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
